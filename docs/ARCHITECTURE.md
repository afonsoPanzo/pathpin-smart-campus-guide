# Pathpin — Architecture

Current state of the technical architecture. Decisions behind it are in [DECISIONS.md](DECISIONS.md).

## Overview

Pathpin is a **static web app**: HTML, CSS and vanilla JavaScript ES modules, served by any static file server. There is no framework, no build step and no backend. Data is JSON loaded at runtime.

```text
index.html  ──loads──▶  src/app.js (entry, state, wiring)
                          ├── src/config.js            paths and defaults (future per-university config)
                          ├── src/core/                pure logic: no DOM, runs in Node and the browser
                          │     ├── directory-schema.js   data contract + per-record validation
                          │     ├── search.js             normalisation, search index, filtering, counts
                          │     └── url-state.js          state <-> query string (?q=, ?category=, ?location=)
                          └── src/ui/                  DOM rendering, one responsibility per module
                                ├── icons.js              mask icons (currentColor) and <img> icons
                                ├── category-style.js     category colours from data, floor labels
                                ├── category-filters.js   tabs rendered from data, ARIA tabs keyboard
                                ├── location-card.js      directory card
                                └── details-dialog.js     <dialog> side panel, focus management
```

## Runtime flow

1. `index.html` renders the static shell: header, hero, search, the "All Locations" tab, loading skeleton, empty and error states, and an empty `<dialog>`.
2. `app.js` fetches `DATA_URL` and passes the JSON to `validateDirectory()`.
3. Validation throws only when the structure is unusable (load error state). Invalid records are dropped and listed in a console warning; the rest renders.
4. `app.js` builds lookups (`categoryById`, `locationById`) and a precomputed search index, renders category tabs from the data, then calls `render()`.
5. All user actions call `setState()`, which re-renders from `state = { query, category }`. One state object, one render path.

## URL and history

The address bar mirrors the state, so any view can be shared: `?q=library&category=services&location=L-101`. Defaults are omitted and unknown parameters are kept.

| Action | History |
| --- | --- |
| Typing, choosing a category, popular searches | `replaceState`: the URL updates, no new Back step |
| Opening a location | `pushState`: browser Back closes the panel |
| Closing the panel (✕, Esc, backdrop) | `history.back()` if we added the entry; otherwise `replaceState` to drop `?location=` |
| Back / Forward (`popstate`) | The URL is read back into state; the panel opens or closes to match |
| Page load | Query and category applied at once; `?location=` opens the panel once data is loaded; unknown values fall back to defaults |

Re-rendering replaces every card, so `render()` returns keyboard focus to the card that had it.

## Data contract (v1)

Defined and enforced in `src/core/directory-schema.js`. Source file: `src/smart-campus-handoff/data/locations.json` (fictional sample data).

| Entity | Field | Rule |
| --- | --- | --- |
| Category | `id` | Required, `[A-Za-z0-9._:-]`, unique |
| | `label` | Required text; `short` falls back to it |
| | `color`, `tint` | Optional hex colour; anything else is ignored (no CSS injection) |
| | `icon` | Optional lowercase icon name from `assets/icons/`; falls back to `cat-all` |
| Location | `id` | Required, same pattern, unique |
| | `name`, `building` | Required text |
| | `category` | Must reference an existing category |
| | `floor` | Whole number from −5 to 99 |
| | `description` | Optional text |
| | `verified` | Only an explicit `true` counts as verified |

All data is written to the DOM with `textContent`, never as HTML.

## Styling

- Each card's Details button stretches its hit area over the whole card (`.details-link::after`), so the card is clickable while keeping one focusable control. Side effect: card text cannot be selected with the mouse.

- `src/style.css` holds all real styling: hand-written classes and CSS custom properties.
- Category colours arrive from data as `--category-color` / `--category-tint` on the element.
- Category icons use a CSS mask painted with `currentColor` (`.mask-icon`), so any colour works without per-colour rules. Fixed-colour icons (search, building, close) are still `<img>`.
- Tailwind is loaded from the Play CDN but used only on `<body>`. Its removal is roadmap task 3.

## Quality checks

| Command | What it checks | Needs |
| --- | --- | --- |
| `npm run validate:data` | Data files against the contract | Node ≥ 20 |
| `npm test` | Unit tests for `src/core/` (Node built-in test runner) | Node ≥ 20 |
| `npm run check` | Both of the above | Node ≥ 20 |
| `npm run smoke -- <url>` | Real-browser flows over the Chrome DevTools Protocol: search, filters, keyboard, dialog, bad data, load error, mobile overflow | Running local server, Chrome or Edge |

There are no runtime or development dependencies. `package.json` exists only for scripts.

## Constraints and known limitations

- Must be served over HTTP (ES modules and `fetch` do not work from `file://`).
- The floor indicator draws floors 0–3; other floors show only the text label until the buildings model (task 4).
- Interface text is English only and hardcoded (task 5).
- Runtime data and icons still live under `src/smart-campus-handoff/`, the design handoff folder (task 4).
- `src/data/campusData.js` is unused and conflicts with the real data; it must not be imported (removal in task 4).
- Google Fonts and the Tailwind CDN are third-party requests: no offline support, GDPR consideration (task 3).
