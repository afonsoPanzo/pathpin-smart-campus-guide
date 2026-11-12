# Pathpin — Feature Universe v0.2

Catalogue of every feature idea, classified against the positioning in [PRODUCT_VISION.md](PRODUCT_VISION.md). This is an inventory, not a plan: order and commitment live in [PRODUCT_ROADMAP.md](PRODUCT_ROADMAP.md).

- **v0.1** (2026-11-12) was a long-form exploration document with scenarios and technical notes for every feature. It remains the reference for *why* each feature exists.
- **v0.2** (this file) realigns v0.1 with the final positioning: it adds the **Future** tier, splits feasibility into Independent / Institutional / Integration, renames *Campus Life* to *Campus Information*, and reframes or excludes features that conflicted with the non-goals.

Legend: ★ exists in the prototype (fully or partly) · Tier: Core / Supporting / Experimental / Future · Feasibility: Independent / Institutional / Integration.

## Changes from v0.1 (contradictions with the positioning)

| v0.1 feature | Problem | v0.2 decision |
| --- | --- | --- |
| C1 Events with locations | Drifts into event management | **Reframed** as I2 *Event venue links*: events published elsewhere link to Pathpin location pages. No calendar, no event creation, no RSVP. |
| C3 Student organisation directory | Drifts into a social network | **Out of scope** as a directory. Organisations may appear only as the occupants of a place. |
| C5 Facilities booking | Pathpin must not own booking | **Reframed** as links to the existing booking system; live availability is Future (Integration). |
| C6 Safety and emergency | Alerts are not Pathpin's role and are high-stakes | Static safety points only (defibrillators, assembly points), **Future**, Institutional. Alerts are out of scope. |
| C4 Onboarding guide, D7 Task finder | Risk of replacing official procedures and websites | **Reframed** as place-centric guides: *where* to go for a task, linking to the official procedure. Pathpin never authors procedures. |
| M2 Timetable | Risk of becoming a student information system | Personal calendar import only (Experimental); no student-information-system integration in scope. |
| X6 Student tips | User-generated content leads to social features and moderation | Experimental and **team-curated only**; no open submissions. |
| T6 AI assistant | Paid API, hallucination risk | Experimental, Integration; needs a cost decision from the founder before any work. |
| v0.1 positioning "vs the official website" | Framed Pathpin as an alternative | Pathpin is an **extension**: it links to official sources and never competes with them. |

## Navigate — *How do I get there?*

| ID | Feature | Tier | Feasibility | Note |
| --- | --- | --- | --- | --- |
| N1 | Campus overview map (sites, buildings, entrances, stops) | Core | Independent | OpenStreetMap or a stylised SVG; entrances verified on site |
| N2 | Interactive floor plans with highlighted rooms | Core | Institutional | Plans can be security-sensitive; publish only with approval |
| N3 | Indoor route guidance | Future | Institutional | Needs N2 and a hand-authored routing graph |
| N4 | Step-free routing | Future | Institutional | Needs N3 and verified accessibility data; wrong data causes harm |
| N5 | QR wayfinding anchors ("You are here") | Core | Institutional | Permission to post codes; stable URLs from D2 |
| N6 | Connected-building passages | Supporting | Independent | Observed on site; hours may need confirmation |
| N7 | Landmark-based text directions | Core | Independent | Cheapest navigation; works offline and with screen readers |
| N8 | Arrival and inter-campus directions | Supporting | Independent | Hand off live routing to existing map apps |

## Directory — *What exists, and where is it?*

| ID | Feature | Tier | Feasibility | Note |
| --- | --- | --- | --- | --- |
| D1 | Location directory ★ | Core | Independent | Fictional data today |
| D2 | Shareable location pages (stable URLs) ★ | Core | Independent | `?location=` links since v0.3.0; enables QR, venue links, issue reports |
| D3 | Opening hours and "open now" | Core | Institutional | Stale hours are worse than none; show last-checked date |
| D4 | Office contact cards | Supporting | Institutional | Role contacts only; link to official pages |
| D5 | Accessibility profiles | Core | Institutional | Structured checklist; survey independently, confirm institutionally |
| D6 | Tolerant, multilingual search ★ | Core | Independent | Accent-insensitive and category-aware since v0.2.0 |
| D7 | "Where do I go for…" task finder | Supporting | Independent | Maps tasks to places; links to the official procedure |
| D8 | Room facilities and capacity | Supporting | Institutional | Facilities data usually lives in internal systems |

## Discover — *What useful places don't I know about?*

| ID | Feature | Tier | Feasibility | Note |
| --- | --- | --- | --- | --- |
| X1 | Self-guided campus tour | Supporting | Independent | Ordered list of locations plus narrative |
| X2 | Study spot finder | Supporting | Independent | Attribute filters on directory data |
| X3 | Everyday amenities (toilets, water, printers, lockers…) | Core | Independent | Directly answers "resources people don't know about" |
| X4 | Points of interest and campus stories | Experimental | Institutional | Archive material needs permission and sources |
| X5 | City essentials for students | Experimental | Independent | Keep to student-administration places; not a city guide |
| X6 | Curated student tips | Experimental | Independent | Team-curated only |

## Translate — *What does this mean, in my language?*

| ID | Feature | Tier | Feasibility | Note |
| --- | --- | --- | --- | --- |
| T1 | Bilingual interface (EN/HU) | Core | Independent | Native-speaker review for Hungarian |
| T2 | Multilingual place content | Core | Independent | Official names stay Hungarian, explained in English |
| T3 | Administrative glossary | Core | Independent | Explains institutional terms, linked to places |
| T4 | Phrase cards for service desks | Supporting | Independent | Static, native-speaker reviewed |
| T5 | Sign and document translation helper | Experimental | Independent | Hand off to OS translation; add glossary context |
| T6 | AI campus assistant (grounded in Pathpin data) | Experimental | Integration | Paid API; answers only from verified data, with citations |

## Campus Information — *What is happening at this place?*

| ID | Feature | Tier | Feasibility | Note |
| --- | --- | --- | --- | --- |
| I1 | Location-based notices (moves, closures, outages) | Core | Institutional | Team-posted observed changes are possible; authority needs the university |
| I2 | Event venue links (v0.1 C1, reframed) | Supporting | Independent | Pathpin provides the "where" for events published elsewhere |
| I3 | Arrival guide: places for the first weeks (v0.1 C4, reframed) | Supporting | Independent | Links to official procedures; reviewed each semester |
| I4 | Booking links (v0.1 C5, reframed) | Supporting | Independent | Links only; live availability is Future (Integration) |
| I5 | Static safety points (v0.1 C6, reduced) | Future | Institutional | Must be official and dated, or not shown |
| — | Student organisation directory (v0.1 C3) | Out of scope | — | See "Changes from v0.1" |

## MyCampus — *What matters to me?*

| ID | Feature | Tier | Feasibility | Note |
| --- | --- | --- | --- | --- |
| M1 | Saved places | Supporting | Independent | On-device storage, no account |
| M2 | Personal calendar import with room links | Experimental | Independent | User's own .ics file, kept on device |
| M3 | Arrival checklist progress | Supporting | Independent | Depends on I3 |
| M4 | Role-based home view | Experimental | Independent | Test with users before investing |
| M5 | Accessibility preferences | Supporting | Independent | Sensitive: never leaves the device |
| M6 | Updates for saved places (push) | Future | Integration | Needs a push service and reliable I1 |

## Platform & Data — *Correct, adaptable, trustworthy*

| ID | Feature | Tier | Feasibility | Note |
| --- | --- | --- | --- | --- |
| P1 | University configuration | Core | Independent | One config per university; no multi-tenant backend |
| P2 | Structured campus data model | Core | Independent | v1 contract in code since v0.2.0; v2 adds buildings, floors, languages |
| P3 | Verification and provenance ★ | Core | Independent | Levels: unverified / observed / confirmed by institution (last one is Institutional) |
| P4 | Content editing console | Future | Institutional | Only when non-developer editors exist |
| P5 | Issue reporting ("this is wrong") | Core | Independent | Start with a pre-filled link carrying the location ID |
| P6 | QR code generator and registry | Supporting | Independent | Physical posting is the Institutional part (N5) |
| P7 | Offline and installable web app | Supporting | Independent | Requires removing remote CSS and font dependencies |
| P8 | Privacy-respecting usage insights | Supporting | Integration | Hosting or a service choice; cost decision needed |

## Ambitious ideas (parked, unclassified by priority)

Open campus data standard · crowdsourced mapping days · live space occupancy · photo-based "where am I" · AR directions · voice-first guidance for visually impaired users · procedure-change tracker for official pages · aggregated campus insights for the university · exam-day mode · Pathpin for on-campus conferences. Details and obstacles are in v0.1, section 5.
