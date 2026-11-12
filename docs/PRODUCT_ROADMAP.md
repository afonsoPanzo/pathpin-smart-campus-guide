# Pathpin — Product Roadmap

Order of work, with the reasoning for the order. Feature IDs refer to [FEATURE_UNIVERSE.md](FEATURE_UNIVERSE.md). Updated as tasks finish; history goes to [DEVELOPMENT_LOG.md](DEVELOPMENT_LOG.md).

## Direction

Make the existing directory **trustworthy, linkable, bilingual and real** before making it bigger. Every Navigate, Discover and Campus Information feature depends on stable places with verified data, so the foundation comes first and stays small.

Phases 0–2 are fully independent. Phase 3 starts only once the founder decides to approach the university.

## Phase 0 — Foundation

| # | Task | Features | Status |
| --- | --- | --- | --- |
| 1 | Modular core, validated data contract, data-driven categories, automated tests | P2 (v1), D6 | **Done** (2026-11-12) |
| 2 | Shareable URLs: search, filter and open location live in the URL; back button works; whole card clickable | D2 | **Done** (2026-11-12) |
| 3 | Self-contained styling: remove Tailwind Play CDN, one token source in CSS, self-hosted fonts | P7 prerequisite | Next |
| 4 | Data model v2 and university configuration: buildings, floors, localised fields, provenance record; runtime data and assets moved out of the design handoff; retire `src/data/campusData.js` | P1, P2, P3 | Planned |
| 5 | Bilingual interface (EN/HU), language in the URL | T1, T2 | Planned |

**Why this order:** task 2 is small and unlocks QR codes, venue links and issue reports. Task 3 removes a production warning and two third-party requests, which offline support and GDPR both need. Task 4 is the largest change and benefits from tasks 1–3 being in place. Task 5 builds on the localised fields from task 4.

## Phase 1 — First real pilot (independent)

| # | Task | Features |
| --- | --- | --- |
| 6 | Pilot dataset: one building, observed on site, marked "observed", never "confirmed" | D1, P3 |
| 7 | Landmark text directions and everyday amenities for the pilot building | N7, X3 |
| 8 | Issue reporting on every entry | P5 |
| 9 | Offline and installable app | P7 |

**Gate:** the founder decides whether publishing on-site observations without university involvement is acceptable (see DECISIONS.md, pending questions).

## Phase 2 — Understand the campus (independent)

| # | Task | Features |
| --- | --- | --- |
| 10 | Campus overview map and arrival directions | N1, N8 |
| 11 | Administrative glossary linked to places | T3 |
| 12 | Saved places and accessibility preferences on device | M1, M5 |
| 13 | QR code generator and registry (codes not yet posted) | P6 |

## Phase 3 — Institutional pilot (needs a university contact)

QR anchors posted in one building (N5) · opening hours (D3) · accessibility profiles (D5) · floor plans (N2) · location-based notices (I1).

## Not scheduled

Experimental and Future features stay in the catalogue until evidence or resources justify them. The AI assistant (T6) and usage insights (P8) need a cost decision first.
