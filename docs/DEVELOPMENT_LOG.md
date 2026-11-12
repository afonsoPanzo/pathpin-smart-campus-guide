# Pathpin — Development Log

Newest first. What changed, why, and how it was verified.

## 2026-11-12 · v0.3.0 — Foundation task 2: shareable URLs

**Why:** nothing in Pathpin could be linked. Stable links are the prerequisite for QR codes (N5), event venue links (I2) and issue reports (P5).

**Changed**
- New `src/core/url-state.js` (pure, unit-tested): parses and writes `?q=`, `?category=`, `?location=`, keeps unknown parameters.
- `app.js`: reads the URL on load, updates it as state changes, opens the panel from `?location=`, handles Back/Forward (`popstate`). The page title shows the open location.
- Details panel: "Copy link" button with a polite status message (`role="status"`).
- The whole card is now clickable, as the design spec requires (stretched Details button; one focusable control per card; visible focus ring on the card).
- Fixed a focus bug found by the new tests: closing the panel moved focus to `<body>` because the Back navigation re-rendered the grid. `render()` now restores focus to the same card, and `popstate` only re-renders when the state changed.
- `.gitignore` for the generated `graphify-out/`.
- ADR-010 records the URL design.

**Verified**
- `npm run check`: data valid; 25/25 unit tests pass (8 new for URL state).
- `npm run smoke`: 43/43 checks pass, in 4 consecutive runs. New: link restores search and filter; typing updates the URL without new history entries; card body click opens details; URL and title show the location; Copy link puts the right URL on the clipboard; Back closes, Forward reopens; Esc cleans the URL and returns focus to the card; a shared `?location=` link opens the panel and closing it focuses search; unknown category/location fall back safely.
- One earlier smoke run failed once with a null element during this work and did not reproduce in the next four runs; noted as possible test flakiness.

**Not verified:** Safari/Firefox, screen readers, real mobile Back gesture.

## 2026-11-12 · AI assistant instructions aligned with decisions

**Why:** a knowledge-graph pass flagged that `src/smart-campus-handoff/.github/copilot-instructions.md` told assistants to use Tailwind utilities and inline SVGs, contradicting ADR-008 and ADR-005.

**Changed:** rewrote the file as tool-agnostic guidance that points to `docs/` and the current rules (plain CSS, mask icons, data-driven categories, data validation, `textContent` only). Copilot is no longer the main tool; the file stays so it cannot mislead. Note that GitHub only reads `.github/` at the repository root, so this file is inactive where it sits.

## 2026-11-12 · v0.2.0 — Foundation task 1: modular core and data contract

**Why:** Every planned feature (shareable links, real data, i18n, multiple universities) needs a codebase where logic is testable, data is validated and categories aren't hardcoded. The interface had to stay exactly as approved.

**Changed**
- Split `src/app.js` (one 377-line module) into `src/core/` (pure logic) and `src/ui/` (rendering); `app.js` now only holds state and wiring.
- Added the data contract `src/core/directory-schema.js`: per-record validation; bad records are skipped with a warning instead of breaking the page.
- Search ignores accents ("nyiregyhaza" finds "Nyíregyháza"), matches category labels (a gap against the design spec), and matches multi-word queries in any order.
- Category tabs, colours and icons are rendered from the data. Removed four hardcoded tabs from `index.html` and the per-category CSS colour and `filter` rules.
- Icons in category tiles, tabs and the details panel use CSS masks; the details panel icon now uses the category colour, as the design spec intends (it was black).
- Tabs support Home/End in addition to the arrow keys.
- Added `package.json` (scripts only, no dependencies), `scripts/validate-data.js`, `scripts/browser-smoke.js`, and unit tests in `tests/`.
- Added `docs/` with vision, Feature Universe v0.2, roadmap, architecture and decisions.

**Verified**
- `npm run check`: data file valid (4 categories, 9 locations, all unverified); 17/17 unit tests pass.
- `npm run smoke` against a local server in headless Chrome: all checks pass. Covered: initial render and counts, `/` shortcut, search by category label, multi-word search, Esc, empty state and reset, tab filtering, arrow/Home/End keys, popular searches, dialog content, colours and focus management, backdrop click, a bad record (skipped, rest renders), HTML in data rendered as text, HTTP 500 error state, no horizontal overflow at 390 and 320 px.
- Desktop and mobile screenshots compared with the pre-change baseline: no visual change except the icon colour fixes above.

**Not verified**
- Safari and Firefox (no browsers available locally). CSS masks are supported in current versions of both (`-webkit-mask` included for older Safari).
- Screen reader output (only ARIA attributes were checked programmatically).

**Known:** the Tailwind Play CDN logs a production warning (tracked as roadmap task 3).
