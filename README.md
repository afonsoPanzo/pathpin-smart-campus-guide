# Pathpin — Smart Campus Navigation & Information Platform

*Find your place. Understand your campus.*

Pathpin connects students to the physical campus and to the context of its places: where things are, what they are and how to reach them. It extends existing university systems rather than replacing them. The first development environment is the University of Nyíregyháza, Hungary.

> **Prototype notice:** This is an independent student project. It uses fictional, unverified sample locations and is not affiliated with or endorsed by the University of Nyíregyháza. It does not yet provide maps, routes, GPS or real-time information.

## Current features

- Responsive campus location directory with an accessible details side panel; the whole card is clickable.
- Search across names, buildings, descriptions, IDs and categories; accent-insensitive, any word order.
- Category filters rendered from the data, with query-relative counts.
- Data validated on load: a broken record is skipped instead of breaking the page.
- Verification status on every location.
- Shareable links: search, category and the open location are kept in the URL (`?q=`, `?category=`, `?location=`); "Copy link" in the details panel; browser Back closes the panel.
- Keyboard support: `/` focuses search, `Esc` clears it or closes the panel, arrow keys and Home/End move between category tabs.

## Run locally

The app uses ES modules and `fetch()`, so serve it over HTTP rather than opening `index.html` from the file system.

```sh
python -m http.server 8000      # on Windows: py -m http.server 8000
```

Open <http://localhost:8000>. There is no build step and nothing to install. The Tailwind CDN and Google Fonts currently need an internet connection.

## Checks

Node.js 20 or newer is needed for the checks only (no dependencies to install).

```sh
npm run check                            # validate data + unit tests
npm run smoke -- http://127.0.0.1:8000/  # real-browser flows (server running, Chrome or Edge installed)
```

## Project structure

```text
index.html                 Page shell
src/
├── app.js                 Entry point: state and wiring
├── config.js              Data and asset paths
├── core/                  Pure logic (data contract, search), tested in Node
├── ui/                    Rendering modules (cards, filters, dialog, icons)
├── style.css              All styling
├── data/campusData.js     Deprecated, unused — do not import (see docs/DECISIONS.md, ADR-007)
└── smart-campus-handoff/  Design handoff: spec, assets, sample data (data/locations.json)
scripts/                   Data validator and browser smoke test
tests/                     Unit tests
docs/                      Product and engineering documentation
```

`src/smart-campus-handoff/data/locations.json` is the data source. Its entries are fictional and must not be treated as verified university information.

## Documentation

| Document | Purpose |
| --- | --- |
| [Product vision](docs/PRODUCT_VISION.md) | Positioning, non-goals, principles |
| [Feature Universe](docs/FEATURE_UNIVERSE.md) | Every feature idea, classified |
| [Roadmap](docs/PRODUCT_ROADMAP.md) | Order of work and status |
| [Architecture](docs/ARCHITECTURE.md) | How the code and data are organised |
| [Decisions](docs/DECISIONS.md) | Why things are the way they are |
| [Development log](docs/DEVELOPMENT_LOG.md) | What changed and how it was verified |

GitHub Copilot and Claude are used as development aids; neither is a runtime dependency.
