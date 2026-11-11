# Copilot instructions — Smart Campus Mini-Guide

- Stack: HTML5, Tailwind CSS, vanilla JavaScript ES modules. No frameworks, no backend.
- The full spec is in `README.md`; the visual reference is `design/Smart Campus Case Study.html`. Match it exactly but do not copy its inline styles — use Tailwind utilities from `tailwind.config.js` (e.g. `bg-navy`, `text-muted`, `rounded-card`, `shadow-focus`, `font-mono text-meta`).
- Data comes from `data/locations.json` (fictional, unverified). Never invent real room numbers or facilities.
- Icons: inline the SVGs from `assets/icons/` (they use `currentColor`). Logo/favicon from `assets/logo` and `assets/favicon`.
- Fonts: Plus Jakarta Sans for UI, JetBrains Mono only for codes/metadata.
- Accessibility is required: ≥44px touch targets, `:focus-visible` rings, `role="tablist"` filters, `aria-live` result count, `prefers-reduced-motion`.
- Mobile first in CSS, desktop is the showcase: 1 → 2 (sm) → 3 (lg) columns.
