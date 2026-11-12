# AI assistant instructions — Pathpin

> Applies to any AI coding assistant. Copilot is no longer the project's main tool; this file is kept in line with the current decisions so that it cannot mislead anyone who still uses it. The source of truth is `docs/` at the repository root.

- Stack: HTML5, plain CSS, vanilla JavaScript ES modules. No framework, no build step, no backend (docs/DECISIONS.md, ADR-001, ADR-009).
- Styling: write plain CSS in `src/style.css` using the CSS custom properties defined in `:root`. Do **not** add Tailwind utility classes; the Tailwind CDN is being removed (ADR-008). `tailwind.config.js` in this folder is a design reference only.
- Icons: use the SVGs in `assets/icons/` through `src/ui/icons.js` (`createMaskIcon`, CSS mask painted with `currentColor`). Do not inline SVG markup (ADR-005).
- Categories: never hardcode category tabs, colours or icons; they come from the data file (ADR-005).
- Data: `data/locations.json` is fictional and unverified. Never invent real University of Nyíregyháza rooms, staff or facilities. Every data change must pass `npm run validate:data` (ADR-004, ADR-007). Do not import `src/data/campusData.js`.
- Code layout: pure logic in `src/core/` (no DOM, unit-tested), rendering in `src/ui/`, state and wiring in `src/app.js` (docs/ARCHITECTURE.md).
- Safety: write data to the DOM with `textContent`, never `innerHTML`.
- Accessibility is required: ≥44px touch targets, visible `:focus-visible`, `role="tablist"` filters, `aria-live` result count, `prefers-reduced-motion`.
- Fonts: Plus Jakarta Sans for UI, JetBrains Mono only for codes and metadata.
- Before finishing: `npm run check`, and `npm run smoke -- <url>` with a local server running.
- Design reference: `README.md` and `design/Smart Campus Case Study.html` in this folder, with the decisions above taking precedence where they differ.
