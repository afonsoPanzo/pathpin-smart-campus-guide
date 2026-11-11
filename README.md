# Pathpin — Smart Campus Guide

Pathpin is a lightweight campus directory prototype designed to help students find locations at a university campus. This project explores how a simple, accessible digital directory could support campus orientation.

> **Prototype notice:** This is an unofficial student project. It uses fictional, unverified sample locations and is not affiliated with or endorsed by the University of Nyíregyháza. It does not provide maps, routes, GPS, or real-time navigation.

## Features

- Responsive campus location directory.
- Real-time search across location names, buildings, descriptions, and IDs.
- Category filters with query-relative result counts.
- Location cards and an accessible details side panel.
- Location data loaded from a local JSON file.
- Keyboard support, including `/` to focus search and `Esc` to clear it or close the details panel.

## Technologies

- HTML5
- CSS and Tailwind CSS via CDN
- Vanilla JavaScript using ES modules
- JSON sample data

GitHub Copilot was used as a development aid; it is not a runtime dependency. The Tailwind CDN and Google Fonts are loaded over the internet, so an internet connection is needed for those external resources.

## Run locally

The application loads its data with `fetch()` and uses JavaScript modules, so serve it over HTTP rather than opening `index.html` directly with `file://`.

1. Make sure Python 3 is installed.
2. From the project root, start a local static server:

   ```sh
   python -m http.server 8000
   ```

   On Windows, `py -m http.server 8000` can be used if the `python` command is unavailable.

3. Open [http://localhost:8000](http://localhost:8000) in a browser.
4. Stop the server with `Ctrl+C` in the terminal when you are finished.

There is no package installation or build step.

## Project structure

```text
.
├── index.html
├── README.md
└── src/
    ├── app.js
    ├── style.css
    └── smart-campus-handoff/
        ├── assets/
        └── data/
            └── locations.json
```

`src/smart-campus-handoff/data/locations.json` is the directory's location and category data source. Its entries are fictional sample data and must not be treated as verified university information.

## Project scope

Pathpin is a front-end prototype. It has no backend, authentication, campus map, indoor directions, GPS, or real-time university data. Location details such as building and floor are displayed as supplied sample data; a location ID is a reference identifier, not a room number.
