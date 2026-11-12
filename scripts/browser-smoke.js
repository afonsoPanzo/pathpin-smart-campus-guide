// Dependency-free browser smoke test over the Chrome DevTools Protocol.
//
// Drives a real headless Chrome through the main flows (search, filters,
// keyboard, details dialog, bad data, load error, mobile overflow).
//
// Usage (with the site served locally, see README):
//   node scripts/browser-smoke.js [url] [screenshotDir]
// Chrome is found via CHROME_PATH or the usual install locations.
import { spawn } from "node:child_process";
import { existsSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
].filter(Boolean);
const chromePath = CHROME_CANDIDATES.find((candidate) => existsSync(candidate));
if (!chromePath) {
  console.error("Chrome not found. Set CHROME_PATH to a Chrome or Chromium executable.");
  process.exit(2);
}
const [url = "http://127.0.0.1:8000/", shotDir] = process.argv.slice(2);
// Known, tracked warning (docs/ROADMAP.md, task 3): remove once Tailwind CDN is gone.
const KNOWN_WARNINGS = [/cdn\.tailwindcss\.com should not be used in production/];
const port = 9333;
const profile = mkdtempSync(join(tmpdir(), "pathpin-e2e-"));
const chrome = spawn(chromePath, [
  "--headless=new", "--disable-gpu", `--remote-debugging-port=${port}`,
  `--user-data-dir=${profile}`, "--no-first-run", "about:blank",
], { stdio: "ignore" });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let targets;
for (let i = 0; i < 50; i++) {
  try { targets = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); break; } catch { await sleep(200); }
}
const page = targets.find((t) => t.type === "page");
const ws = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r));
let nextId = 1;
const pending = new Map();
const consoleMessages = [];
ws.addEventListener("message", (event) => {
  const msg = JSON.parse(event.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
  if (msg.method === "Runtime.consoleAPICalled" && !KNOWN_WARNINGS.some((pattern) => pattern.test(msg.params.args[0]?.value ?? ""))) consoleMessages.push(`${msg.params.type}: ${msg.params.args.map((a) => a.value ?? a.description).join(" ")}`);
  if (msg.method === "Runtime.exceptionThrown") consoleMessages.push(`exception: ${msg.params.exceptionDetails.exception?.description ?? msg.params.exceptionDetails.text}`);
});
const send = (method, params = {}) => new Promise((resolve) => {
  const id = nextId++; pending.set(id, resolve); ws.send(JSON.stringify({ id, method, params }));
});
const evaluate = async (expression) => {
  const res = await send("Runtime.evaluate", { expression, awaitPromise: true, returnByValue: true });
  if (res.result?.exceptionDetails) throw new Error(res.result.exceptionDetails.exception?.description);
  return res.result.result.value;
};
const key = async (k, code = k, keyCode = 0) => {
  for (const type of ["keyDown", "keyUp"]) {
    await send("Input.dispatchKeyEvent", { type, key: k, code, windowsVirtualKeyCode: keyCode, text: type === "keyDown" && k.length === 1 ? k : undefined });
  }
  await sleep(80);
};
const typeText = async (text) => { await send("Input.insertText", { text }); await sleep(120); };
const shot = async (name) => {
  if (!shotDir) return;
  const { result } = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(join(shotDir, `${name}.png`), Buffer.from(result.data, "base64"));
};

let failures = 0;
const check = (name, ok, detail = "") => {
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}${detail ? `  (${detail})` : ""}`);
  if (!ok) failures++;
};

await send("Runtime.enable");
await send("Page.enable");

async function load(width, height, mobile, target = url) {
  await send("Emulation.setDeviceMetricsOverride", { width, height, deviceScaleFactor: 1, mobile });
  await send("Page.navigate", { url: target });
  for (let i = 0; i < 50; i++) {
    await sleep(200);
    const ready = await evaluate(`document.querySelectorAll('.location-card').length > 0 || !document.querySelector('[data-load-error]').hidden`).catch(() => false);
    if (ready) break;
  }
  await sleep(300);
}

const state = () => evaluate(`({
  cards: document.querySelectorAll('.location-card').length,
  count: document.querySelector('[data-result-count]').textContent,
  active: document.querySelector('[role=tab][aria-selected=true]')?.dataset.category,
  tabs: [...document.querySelectorAll('[role=tab]')].map(t => t.dataset.category + ':' + t.querySelector('.filter-count').textContent).join(' '),
  emptyVisible: !document.querySelector('[data-empty-state]').hidden,
  emptyTitle: document.querySelector('[data-empty-title]').textContent,
  focus: document.activeElement?.id || document.activeElement?.dataset?.category || document.activeElement?.dataset?.locationId || document.activeElement?.className || document.activeElement?.tagName,
  dialogOpen: document.querySelector('dialog').open,
  query: document.querySelector('#campus-search').value,
})`);

// ---- Desktop flows -----------------------------------------------------------
await load(1280, 900, false);
let s = await state();
check("initial render: 9 cards", s.cards === 9, s.count);
check("tabs rendered from data with counts", s.tabs === "all:9 lecture:2 lab:2 office:2 services:3", s.tabs);
check("mask icons resolved", await evaluate(`[...document.querySelectorAll('.mask-icon')].every(i => getComputedStyle(i).maskImage.startsWith('url('))`));
check("category colour comes from data", await evaluate(`getComputedStyle(document.querySelector('.location-card[data-category=lab] .category-icon-tile')).color`) === "rgb(14, 124, 134)");
await shot("desktop-initial");

await evaluate(`document.body.focus()`);
await key("/", "Slash", 191);
s = await state();
check('"/" focuses search', s.focus === "campus-search", s.focus);

await typeText("laboratory");
s = await state();
check("search by category label finds labs", s.cards === 2 && s.tabs.includes("lab:2") && s.tabs.includes("all:2"), `${s.count} | ${s.tabs}`);

await evaluate(`document.querySelector('#campus-search').value=''; document.querySelector('#campus-search').dispatchEvent(new Event('input'))`);
await typeText("lab   c3");
s = await state();
check("multi-word search", s.cards === 1, s.count);

await key("Escape", "Escape", 27);
s = await state();
check("Esc clears search", s.query === "" && s.cards === 9, `${s.query}|${s.count}`);

await typeText("zzzz");
s = await state();
check("empty state shown for no results", s.emptyVisible && s.emptyTitle.includes("zzzz"), s.emptyTitle);
await evaluate(`document.querySelector('[data-reset-filters]').click()`);
s = await state();
check('"Show all locations" resets', s.cards === 9 && s.query === "" && s.active === "all");

await evaluate(`document.querySelector('[role=tab][data-category=services]').click()`);
s = await state();
check("category tab filters", s.cards === 3 && s.active === "services", s.count);

await evaluate(`document.querySelector('[role=tab][data-category=services]').focus()`);
await key("ArrowRight", "ArrowRight", 39);
s = await state();
check("ArrowRight wraps to All", s.active === "all" && s.focus === "all", `${s.active}/${s.focus}`);
await key("End", "End", 35);
s = await state();
check("End selects last tab", s.active === "services", s.active);
await key("Home", "Home", 36);
s = await state();
check("Home selects first tab", s.active === "all", s.active);

await evaluate(`document.querySelector('.popular-pill[data-query="Library"]').click()`);
s = await state();
check("popular pill searches", s.query === "Library" && s.cards >= 1, `${s.query} ${s.count}`);
await evaluate(`document.querySelector('.clear-search').click()`);

await evaluate(`document.querySelector('button[data-location-id="C-302"]').focus(); document.querySelector('button[data-location-id="C-302"]').click()`);
await sleep(200);
s = await state();
const dialogData = await evaluate(`({ name: document.querySelector('[data-details-name]').textContent, cat: document.querySelector('[data-details-category-label]').textContent, floor: document.querySelector('[data-details-floor]').textContent, ver: document.querySelector('[data-details-verification-label]').textContent, color: getComputedStyle(document.querySelector('[data-details-category]')).color })`);
check("details dialog opens with data", s.dialogOpen && dialogData.name === "Chemistry Lab C3.02" && dialogData.floor === "Floor 3" && dialogData.ver === "Unverified", JSON.stringify(dialogData));
check("details category colour from data", dialogData.color === "rgb(14, 124, 134)", dialogData.color);
check("focus moves to close button", (await evaluate(`document.activeElement.hasAttribute('data-details-close')`)) === true);
await shot("desktop-dialog");
await key("/", "Slash", 191);
check('"/" ignored while dialog open', (await state()).dialogOpen);
await key("Escape", "Escape", 27);
s = await state();
check("Esc closes dialog and restores focus to opener", !s.dialogOpen && s.focus === "C-302", s.focus);

// Backdrop click
await evaluate(`document.querySelector('button[data-location-id="A-001"]').click()`);
await sleep(150);
await send("Input.dispatchMouseEvent", { type: "mousePressed", x: 100, y: 400, button: "left", clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: 100, y: 400, button: "left", clickCount: 1 });
await sleep(150);
check("backdrop click closes dialog", !(await state()).dialogOpen);

// ---- Shareable URLs (roadmap task 2) --------------------------------------
const urlInfo = () => evaluate(`({ search: decodeURIComponent(location.search.replace(/\\+/g, ' ')), length: history.length, title: document.title })`);
const base = url.replace(/[?#].*$/, "");

await load(1280, 900, false, `${base}?q=lab&category=lab`);
s = await state();
check("URL ?q=&category= restores search and filter", s.query === "lab" && s.active === "lab" && s.cards === 2, `${s.query}|${s.active}|${s.count}`);

await evaluate(`document.querySelector('#campus-search').focus()`);
await evaluate(`document.querySelector('#campus-search').select()`);
const lengthBeforeTyping = (await urlInfo()).length;
await typeText("chemistry");
let u = await urlInfo();
check("typing updates the URL without adding history entries", u.search === "?q=chemistry&category=lab" && u.length === lengthBeforeTyping, `${u.search} len ${u.length}/${lengthBeforeTyping}`);

await evaluate(`document.querySelector('[role=tab][data-category=all]').click()`);
u = await urlInfo();
check("choosing All removes ?category=", u.search === "?q=chemistry", u.search);

// Click on the card body (not the Details button) opens the dialog.
const cardPoint = await evaluate(`(() => { const r = document.querySelector('.location-card .location-name').getBoundingClientRect(); return { x: r.left + 10, y: r.top + r.height / 2 }; })()`);
await send("Input.dispatchMouseEvent", { type: "mousePressed", x: cardPoint.x, y: cardPoint.y, button: "left", clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: cardPoint.x, y: cardPoint.y, button: "left", clickCount: 1 });
await sleep(200);
s = await state();
u = await urlInfo();
check("clicking anywhere on a card opens its details", s.dialogOpen);
check("open location is in the URL and title", u.search === "?q=chemistry&location=C-302" && u.title.startsWith("Chemistry Lab C3.02"), `${u.search} | ${u.title}`);

await send("Browser.grantPermissions", { permissions: ["clipboardReadWrite", "clipboardSanitizedWrite"] }).catch(() => {});
await evaluate(`document.querySelector('[data-details-share]').click()`);
await sleep(300);
const share = await evaluate(`({ status: document.querySelector('[data-details-share-status]').textContent, clip: navigator.clipboard.readText().catch(() => null) })`);
const clipboard = await evaluate(`navigator.clipboard.readText().catch(() => null)`);
check("Copy link copies the location URL", share.status === "Link copied" && typeof clipboard === "string" && clipboard.includes("location=C-302"), `${share.status} | ${clipboard}`);

await evaluate(`history.back()`);
await sleep(300);
s = await state();
u = await urlInfo();
check("browser Back closes the dialog", !s.dialogOpen && u.search === "?q=chemistry" && !u.title.startsWith("Chemistry"), `${s.dialogOpen} ${u.search}`);

await evaluate(`history.forward()`);
await sleep(300);
check("browser Forward reopens it", (await state()).dialogOpen);
await key("Escape", "Escape", 27);
await sleep(200);
u = await urlInfo();
check("Esc after Forward removes ?location=", !(await state()).dialogOpen && u.search === "?q=chemistry", u.search);

await evaluate(`document.querySelector('button[data-location-id="C-302"]').focus(); document.querySelector('button[data-location-id="C-302"]').click()`);
await sleep(150);
await key("Escape", "Escape", 27);
await sleep(300);
u = await urlInfo();
s = await state();
check("Esc closes and leaves no ?location= behind", !s.dialogOpen && u.search === "?q=chemistry" && s.focus === "C-302", `${u.search} focus ${s.focus}`);

await load(1280, 900, false, `${base}?location=D-012`);
s = await state();
check("shared ?location= link opens the dialog on load", s.dialogOpen && (await evaluate(`document.querySelector('[data-details-name]').textContent`)) === "International Office");
await key("Escape", "Escape", 27);
await sleep(200);
u = await urlInfo();
s = await state();
check("closing a shared link cleans the URL and focuses search", !s.dialogOpen && u.search === "" && s.focus === "campus-search", `${u.search} focus ${s.focus}`);

await load(1280, 900, false, `${base}?category=ghost&location=NOPE`);
s = await state();
u = await urlInfo();
check("unknown category/location in a link fall back safely", s.active === "all" && !s.dialogOpen && s.cards === 9 && u.search === "", `${s.active} ${u.search}`);

check("no console errors or warnings", consoleMessages.length === 0, consoleMessages.join(" | "));

// ---- Resilience: one bad record must not break the page -------------------------
consoleMessages.length = 0;
await send("Fetch.enable", { patterns: [{ urlPattern: "*locations.json*", requestStage: "Response" }] });
const fetchHandler = async (event) => {
  const msg = JSON.parse(event.data);
  if (msg.method !== "Fetch.requestPaused") return;
  const original = await send("Fetch.getResponseBody", { requestId: msg.params.requestId });
  const json = JSON.parse(original.result.base64Encoded ? Buffer.from(original.result.body, "base64").toString() : original.result.body);
  json.locations.push({ id: "BAD-1", name: "Broken", category: "ghost", building: "X", floor: 0 });
  json.locations[0].name = "<img src=x onerror=alert(1)>";
  await send("Fetch.fulfillRequest", { requestId: msg.params.requestId, responseCode: 200, responseHeaders: [{ name: "Content-Type", value: "application/json" }], body: Buffer.from(JSON.stringify(json)).toString("base64") });
};
ws.addEventListener("message", fetchHandler);
await load(1280, 900, false);
s = await state();
check("bad record skipped, other 9 still render", s.cards === 9, s.count);
check("data problem reported as a warning", consoleMessages.some((m) => m.startsWith("warning") && m.includes("ghost")), consoleMessages.join(" | "));
check("HTML in data is rendered as text", await evaluate(`document.querySelector('.location-name').textContent === '<img src=x onerror=alert(1)>' && !document.querySelector('.location-name img')`));
ws.removeEventListener("message", fetchHandler);
await send("Fetch.disable");

// ---- Load error -------------------------------------------------------------
await send("Fetch.enable", { patterns: [{ urlPattern: "*locations.json*", requestStage: "Request" }] });
const failHandler = async (event) => {
  const msg = JSON.parse(event.data);
  if (msg.method === "Fetch.requestPaused") await send("Fetch.fulfillRequest", { requestId: msg.params.requestId, responseCode: 500, body: "" });
};
ws.addEventListener("message", failHandler);
await load(1280, 900, false);
s = await state();
check("load error state on HTTP 500", (await evaluate(`!document.querySelector('[data-load-error]').hidden`)) && s.count === "Locations unavailable", s.count);
ws.removeEventListener("message", failHandler);
await send("Fetch.disable");

// ---- Mobile ---------------------------------------------------------------
for (const width of [390, 320]) {
  await load(width, 844, true);
  const overflow = await evaluate(`({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth })`);
  check(`no horizontal page overflow at ${width}px`, overflow.scroll <= overflow.client, JSON.stringify(overflow));
  check(`cards render at ${width}px`, (await state()).cards === 9);
  await shot(`mobile-${width}`);
}

ws.close();
chrome.kill();
console.log(failures ? `\n${failures} check(s) failed` : "\nAll checks passed");
process.exitCode = failures ? 1 : 0;
