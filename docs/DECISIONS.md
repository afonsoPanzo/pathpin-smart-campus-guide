# Pathpin — Decision Log

Important product and engineering decisions. Newest last. Status: **Proposed**, **Accepted** or **Superseded**.

---

## ADR-001 · Keep the prototype and its stack

- **Status:** Accepted (2026-11-12)
- **Decision:** Evolve the existing HTML + CSS + vanilla JavaScript ES modules prototype. No framework, no build step.
- **Context:** The approved interface and its behaviour already work and are accessible. The app is small (one page, a few hundred lines of JS).
- **Alternatives:** React/Vue/Svelte with a bundler; a static site generator.
- **Rationale:** A framework would add a toolchain, dependencies and a rewrite without solving any current problem. ES modules already give us structure. We will revisit if we reach many pages with shared, complex state.
- **Consequences:** Rendering is manual DOM code, so modules must stay small and focused. The site needs HTTP serving.

## ADR-002 · Product scope: a specialised, place-centric extension

- **Status:** Accepted (2026-11-12)
- **Decision:** Adopt the positioning in [PRODUCT_VISION.md](PRODUCT_VISION.md), including its non-goals. Realign the Feature Universe to v0.2.
- **Context:** Feature Universe v0.1 included features that would make Pathpin own processes (event calendars, booking, organisation directories, alerts, procedures).
- **Alternatives:** Keep v0.1 as is; a broad "campus super-app".
- **Rationale:** Specialisation makes Pathpin feasible for a two-person team, avoids competing with institutional systems, and makes a future partnership easier.
- **Consequences:** Six v0.1 features were reframed, reduced or excluded (see FEATURE_UNIVERSE.md, "Changes from v0.1").

## ADR-003 · Documentation lives in the repository, in English

- **Status:** Accepted (2026-11-12)
- **Decision:** `README.md` and `docs/` are the source of truth for product and engineering decisions. They are written in English. Founder–partner conversation can be in Portuguese.
- **Rationale:** Code, data and the target audience (international students, other universities) are English-first; docs next to the code are versioned with it.
- **Consequences:** The "Feature Universe v0.1" shared document is historical; v0.2 in the repo supersedes its classification.

## ADR-004 · Validate data per record; never fail the whole directory

- **Status:** Accepted (2026-11-12)
- **Decision:** A schema module validates every category and location. A broken structure shows the error state; a broken record is dropped and reported as a console warning.
- **Context:** Before, one unknown category threw an error and showed "could not be loaded" for the whole directory.
- **Alternatives:** JSON Schema with a validator library; no validation.
- **Rationale:** A small hand-written validator has no dependency, runs in the browser and in Node, and can sanitise values (colours, icon names) that reach CSS and URLs.
- **Consequences:** The contract is code. Changes to the data model must update `directory-schema.js`, its tests and ARCHITECTURE.md together.

## ADR-005 · Categories are data-driven; icons use CSS masks

- **Status:** Accepted (2026-11-12)
- **Decision:** Category tabs, colours and icons come from the data file. Category icons are drawn with a CSS mask filled with `currentColor`.
- **Context:** Adding a category required editing four files, and icon colours were approximated with hand-tuned CSS `filter` chains per colour.
- **Alternatives:** Inline SVG markup in JS; keep the filter rules.
- **Rationale:** Masks keep the SVG files as the single source, give exact colours and work for any colour a university configures. Inline SVG would require fetching and parsing each file.
- **Consequences:** Icons need same-origin hosting (already the case). Fixed-colour icons can migrate to masks gradually.

## ADR-006 · Zero-dependency testing

- **Status:** Accepted (2026-11-12)
- **Decision:** Unit tests use Node's built-in test runner. Browser smoke tests drive Chrome directly over the DevTools Protocol. `package.json` holds scripts only, with no dependencies.
- **Alternatives:** Jest/Vitest; Playwright/Puppeteer.
- **Rationale:** Real coverage without installing anything, keeping the "no install" property of the project.
- **Consequences:** The smoke test is less ergonomic than Playwright. If browser tests grow large, revisit (Playwright is the likely choice).

## ADR-007 · Sample data policy

- **Status:** Accepted (2026-11-12)
- **Decision:** Fictional data stays labelled fictional and unverified. `src/data/campusData.js` is never merged into the live data and will be deleted in roadmap task 4. Real data enters only with provenance (task 4) and starts as "observed", never "confirmed by the institution" without an agreement.
- **Rationale:** Trust is the product's main promise and the project has no institutional authorisation.

## ADR-008 · Replace Tailwind Play CDN with plain CSS

- **Status:** Accepted (2026-11-12), implementation in roadmap task 3
- **Decision:** Remove the Tailwind Play CDN and its inline config. Keep design tokens as CSS custom properties in `style.css` as the single source.
- **Context:** Tailwind's own runtime warns it is not for production. The page uses Tailwind utilities on one element only. Tokens are defined three times.
- **Alternatives:** Tailwind CLI build (adds a build step and Node toolchain); keep the CDN.
- **Rationale:** All real styling is already hand-written CSS. Removing the CDN deletes a large third-party script for almost no loss.
- **Consequences:** `src/smart-campus-handoff/tailwind.config.js` remains as a design reference only.

## ADR-009 · Static first; personal data on the device

- **Status:** Accepted (2026-11-12)
- **Decision:** No backend until a feature cannot work without one (non-developer editors, push notifications, AI assistant). MyCampus preferences and saved places stay in the browser.
- **Rationale:** Lower cost, no personal data processing, simpler GDPR position, works offline.

## ADR-010 · State in the query string; only opening a location adds history

- **Status:** Accepted (2026-11-12)
- **Decision:** Search, category and the open location live in query parameters (`?q=`, `?category=`, `?location=`). Typing and filtering replace the current history entry; opening a location pushes one.
- **Alternatives:** Hash routing (`#/location/C-302`); path routing (`/location/C-302`); pushing an entry for every change.
- **Rationale:** Query parameters work on any static host with no server rewrites, unlike path routing, and are easier to extend than hash routes (a future `?lang=` sits beside them). Pushing on every keystroke would make Back unusable; pushing on open makes Back behave like closing a page, which matches user expectations on mobile.
- **Consequences:** Location IDs become part of public links, so they must stay stable (to be enforced by the v2 data model, task 4). A location page is still the directory with a panel open, not a separate page; good enough for QR codes and sharing.

---

## Pending founder decisions

| Question | Why it matters | Recommendation | If postponed |
| --- | --- | --- | --- |
| May we collect and publish on-site observations (rooms, amenities, directions) of one real building, without university involvement? | Gates Phase 1 (first real data) | Yes, for publicly accessible spaces, labelled "observed, not confirmed", without floor plans or staff names | Development continues on fictional data through Phase 0; nothing real ships |
