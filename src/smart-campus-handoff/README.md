# Smart Campus Mini-Guide — Design Handoff

Campus directory web app for the University of Nyíregyháza (unofficial student project, MLH Global Hack Week). Stack: **HTML5 + Tailwind CSS + Vanilla JS (ES Modules)**. No backend.

## What's in here
| Path | What |
|---|---|
| `design/Smart Campus Case Study.html` | Full design case study, self-contained, opens offline in a browser. **Visual reference — do not ship it.** The desktop dashboard in it is interactive. |
| `assets/logo/` | Primary (stacked), horizontal, reversed, mono lockups + standalone symbol SVGs |
| `assets/favicon/` | `favicon.svg` (32), `favicon-16.svg` (simplified, no dot), `app-icon-512.svg` |
| `assets/icons/` | 24px stroke icons (1.8 stroke, `currentColor`). Lucide-compatible — you can swap in `lucide` |
| `data/locations.json` | Categories + 9 **fictional, unverified** sample locations |
| `tailwind.config.js` | All design tokens as a Tailwind theme |
| `.github/copilot-instructions.md` | Instructions GitHub Copilot picks up automatically |

> Logo text uses Plus Jakarta Sans / JetBrains Mono via `<text>`. For print or apps without these fonts, convert text to outlines in Figma/Illustrator.

## Fonts
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
```
Plus Jakarta Sans for everything; JetBrains Mono **only** for room codes, floor labels and metadata.

## Tokens
**Colours** — navy `#123B70` (brand, hero bg, active chip) · blue `#2563EB` (buttons, links, focus; hover `#1D4ED8`, active `#1E40AF`) · sky `#60A5FA` (accents on navy) · ink `#0F172A` · body `#475569` · muted `#64748B` (lightest allowed text on white) · placeholder `#94A3B8` · canvas `#F8FAFC` · surface `#FFFFFF` · border `#E2E8F0` / strong `#CBD5E1` · success `#16A34A` (text `#15803D`, tint `#DCFCE7`) · notice `#B45309` / `#FDF3E4` · error `#DC2626` / `#FEE2E2`.

**Category hues** (text / tint): Lecture `#2563EB`/`#EFF4FF` · Lab `#0E7C86`/`#E7F5F6` · Office `#123B70`/`#EAF0F8` · Services `#B45309`/`#FDF3E4`.

**Type** — display 48/52 800 −3.5% · title 32/40 800 −3% · section 22/28 700 −2% · card 18/24 700 −1% · body 15/24 400 · label 14/20 600 · meta mono 12/16 500. Hero H1 on desktop: 52px/1.05, 800, −4%; mobile 34px.

**Spacing** — Tailwind default 4pt scale (1,2,3,4,6,8,12,16).
**Radius** — 6 badge/kbd · 10 button/icon tile · 14 card/search · 20 panel · full chips.
**Shadow** — rest `0 1px 2px rgba(15,23,42,.06)` · hover lift `0 8px 24px -10px rgba(18,59,112,.25)` · focus ring `0 0 0 4px rgba(37,99,235,.18)`. Cards at rest: border only, no shadow.

## Screen: Directory (single page)
1. **Header** (68px desktop / 60 tablet / compact mobile, white, bottom border): symbol 34px + "Smart Campus" (17/800 navy) over "University of Nyíregyháza" (11/500 muted) · divider · nav (Directory active: `bg-navy-tint text-navy`, others muted, hover `bg-slate-100`) · right: "Prototype · sample data" notice badge + language button (globe, "EN", chevron; 40px, border, radius 10).
2. **Hero** (bg navy + dot grid `radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)` 22px; padding 56/40/64): H1 "Find your way around campus." · sub 18/1.55 `#C9D8EE` "Discover classrooms, laboratories, offices and student services at the University of Nyíregyháza." · **Search**: 64px tall, white, radius 14, 2px border white → focus `#60A5FA` + `focus-on-navy` ring; search icon blue; input 17/500; placeholder "Search rooms, buildings or services..."; right side: `/` kbd hint (hidden when typing → replaced by clear ✕ button 36px) + "Search" primary button 46px. · "Popular:" pill buttons (30px, white 22% border, 6% fill).
3. **Filters row**: chips (42px, radius full, icon 17 + label 14/600 + count pill mono 11). Inactive: white, border `#E2E8F0`, hover border `#94A3B8`. Active: bg navy, white text, count pill `rgba(255,255,255,.16)`. Right: result count "N locations" (aria-live).
4. **Grid**: 3 cols desktop / 2 tablet / 1 mobile, gap 20 (16 mobile). Container max 1200.
5. **Location card** (white, border, radius 14, padding 20, gap 14): top row = 34px tinted icon tile + category label in hue (13/600) · room code badge (mono 12, `bg-slate-100`) right. Name (card style) + building line with building icon (13/500 muted). Description 14/1.55 body, clamp 2 lines. Footer (top border `#F1F5F9`, pt 14): **floor stack** (4 bars 20×4, gap 2, top = floor 3; current floor in category hue, others `#E2E8F0`) + "Ground floor"/"Floor N" mono 12; right "Details ↗" 13/700 blue. Hover: border `#BFD3F6`, lift shadow, translateY(-2px), 150ms. Focus-visible: blue border + focus ring. Whole card is clickable.
6. **Empty state** (white, dashed `#CBD5E1` border, radius 14, padding 64): 88px circle `#EFF4FF` with outlined pin + dashed S + "?" bubble · "No results for “{query}”" (22/700) · "Check the spelling, try a room code like "B-214", or search by building instead." · buttons: "Show all locations" (primary) + "Clear search" (secondary).
7. **Loading**: 6 skeleton cards, blocks `#EEF2F7`, opacity pulse 1→.45, 1.4s.
8. **Footer**: "All locations shown are fictional sample data and have not been verified." · "Independent student project · not an official University of Nyíregyháza service".

## Mobile (<640)
Compact header (symbol 28 + wordmark, EN button 44×44). Search **sticky under header** (52px, canvas bg; focus = 2px blue border + ring). Chips scroll horizontally (`overflow-x-auto`, no wrap, bleed to edge). Cards single column, horizontal layout: 40px tile left, name/building·floor middle, code badge right, description below. Hero shrinks to H1 34px (or hides once user scrolls/searches).

Breakpoints: `<640` 1 col · `640–1023` 2 col · `≥1024` 3 col + full nav · `≥1280` container caps at 1200.

## Behaviour (vanilla JS)
- State: `{ query: '', category: 'all' }`. Filter = case-insensitive `includes` over name, building, id, description, category label. Category counts reflect the current query.
- `/` focuses search (unless already in an input); `Esc` clears it. Clear ✕ refocuses input.
- Popular pill → sets query, resets category to all.
- Zero results → empty state; "Show all locations" resets both.
- Filters: `role="tablist"`, chips `role="tab"` + `aria-selected`. Result count `aria-live="polite"`.
- Respect `prefers-reduced-motion` (no lift, no pulse).

## Components & states
Primary button 44px, radius 10, `bg-brand` → hover `#1D4ED8` → active `#1E40AF` → focus `0 0 0 2px #fff, 0 0 0 4px #2563EB` → disabled `bg #E2E8F0 text #94A3B8`. Secondary: white, border `#E2E8F0` → hover `bg canvas, border #CBD5E1` → focus blue border + ring → disabled canvas/placeholder text. Chip disabled (0 results): dashed border, placeholder text. Badges: category (hue on tint, 12/600, radius 6), code (mono), Verified (success), Unverified (dashed notice border).

## Accessibility
Text ≥4.5:1 · touch targets ≥44px · visible focus everywhere (`:focus-visible`) · category never by colour alone (icon + label) · floor stack always paired with text · `lang` switches with EN/HU selector.

## Rules
- Never use the university coat of arms or imply official endorsement.
- All locations are fictional; keep `verified: false` and the disclaimer visible.
