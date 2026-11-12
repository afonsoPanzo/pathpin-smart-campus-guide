// Pathpin entry point: owns application state and wires data, search, URL and
// UI modules together. Rendering details live in src/ui/, pure logic in src/core/.

import { DATA_URL } from "./config.js";
import { validateDirectory } from "./core/directory-schema.js";
import { buildSearchIndex, countByCategory, filterLocations } from "./core/search.js";
import { parseUrlState, serializeUrlState } from "./core/url-state.js";
import { createCategoryFilters } from "./ui/category-filters.js";
import { createDetailsDialog } from "./ui/details-dialog.js";
import { hydrateIcons } from "./ui/icons.js";
import { createLocationCard } from "./ui/location-card.js";

const $ = (selector) => document.querySelector(selector);

const elements = {
  grid: $("[data-location-grid]"),
  loading: $("[data-loading]"),
  empty: $("[data-empty-state]"),
  emptyTitle: $("[data-empty-title]"),
  emptyDescription: $("[data-empty-description]"),
  loadError: $("[data-load-error]"),
  resultCount: $("[data-result-count]"),
  searchForm: $(".search-form"),
  searchInput: $("#campus-search"),
  clearSearch: $(".clear-search"),
  keyboardHint: $(".keyboard-hint"),
  clearEmptySearch: $("[data-clear-empty-search]"),
  resetFilters: $("[data-reset-filters]"),
  popularSearches: [...document.querySelectorAll(".popular-pill")],
  filterList: $(".filter-list"),
  dialog: $("[data-details-dialog]"),
};

const BASE_TITLE = document.title;

// The URL is part of the state: search, category and the open location can be
// shared as a link (docs/ROADMAP.md, task 2).
const initialUrlState = parseUrlState(window.location.search);

const state = {
  query: initialUrlState.query,
  category: initialUrlState.category,
};

/** Loaded, validated data plus lookups derived from it. */
let directory = null;

/** Location shown in the details dialog, mirrored in the URL as ?location=. */
let openLocationId = null;
/** True when opening the dialog added a history entry that closing should undo. */
let dialogAddedHistoryEntry = false;
/** True while the dialog is being closed because the user navigated (Back). */
let closingFromHistory = false;

// --- URL --------------------------------------------------------------------

function currentUrlState() {
  return { query: state.query, category: state.category, location: openLocationId };
}

function urlFor(urlState) {
  const { pathname, search, hash } = window.location;
  return `${pathname}${serializeUrlState(urlState, search)}${hash}`;
}

/** Updates the address bar without adding a history entry (typing, filters). */
function replaceUrl() {
  const url = urlFor(currentUrlState());
  const { pathname, search, hash } = window.location;
  if (url !== `${pathname}${search}${hash}`) history.replaceState(null, "", url);
}

// --- Rendering ----------------------------------------------------------------

const filters = createCategoryFilters(elements.filterList, (category) => setState({ category }));
const details = createDetailsDialog(elements.dialog, {
  fallbackFocus: elements.searchInput,
  onClose: handleDialogClosed,
  getShareUrl: () => new URL(urlFor(currentUrlState()), window.location.href).href,
});

function setState(patch) {
  Object.assign(state, patch);
  render();
}

function renderEmptyState() {
  const category = directory.categoryById.get(state.category);
  const query = state.query.trim();
  if (query) {
    elements.emptyTitle.textContent = `No results for “${query}”`;
    elements.emptyDescription.textContent =
      "Check the spelling, try a room code like “B-214”, or search by building instead.";
  } else if (category) {
    elements.emptyTitle.textContent = `No locations in ${category.label}`;
    elements.emptyDescription.textContent = "Choose another category or show all locations.";
  } else {
    elements.emptyTitle.textContent = "No locations available";
    elements.emptyDescription.textContent = "There are no sample locations to display right now.";
  }
}

function render({ updateUrl = true } = {}) {
  // Search input always reflects state (pills, "clear" and links change it).
  if (elements.searchInput.value !== state.query) elements.searchInput.value = state.query;
  const hasQuery = state.query.length > 0;
  elements.clearSearch.hidden = !hasQuery;
  elements.keyboardHint.hidden = hasQuery;

  if (!directory) return;

  const { queryMatches, results } = filterLocations(directory.locations, directory.searchIndex, state);

  // Re-rendering replaces every card; keep keyboard focus on the same card.
  const focusedLocationId = elements.grid.contains(document.activeElement)
    ? document.activeElement.dataset.locationId
    : undefined;

  const fragment = document.createDocumentFragment();
  for (const location of results) {
    fragment.append(createLocationCard(location, directory.categoryById.get(location.category)));
  }
  elements.grid.replaceChildren(fragment);
  if (focusedLocationId) {
    elements.grid.querySelector(`button[data-location-id="${CSS.escape(focusedLocationId)}"]`)?.focus();
  }
  elements.grid.hidden = results.length === 0;
  elements.empty.hidden = results.length !== 0;
  elements.resultCount.textContent = `${results.length} ${results.length === 1 ? "location" : "locations"}`;
  renderEmptyState();

  filters.update({ active: state.category, counts: countByCategory(queryMatches, directory.categories) });
  elements.loading.hidden = true;
  if (updateUrl) replaceUrl();
}

// --- Location details -----------------------------------------------------------

/**
 * @param {string} locationId
 * @param {HTMLElement | null} opener element that gets focus back on close
 * @param {{ addHistoryEntry?: boolean }} options false when the URL already
 *   names this location (page load, Back/Forward)
 */
function openLocation(locationId, opener, { addHistoryEntry = true } = {}) {
  const location = directory?.locationById.get(locationId);
  if (!location || details.isOpen()) return false;

  details.open(location, directory.categoryById.get(location.category), opener);
  openLocationId = location.id;
  document.title = `${location.name} · ${BASE_TITLE}`;

  dialogAddedHistoryEntry = addHistoryEntry;
  // A new entry means the browser's Back button closes the panel.
  if (addHistoryEntry) history.pushState(null, "", urlFor(currentUrlState()));
  return true;
}

function handleDialogClosed() {
  if (details.isOpen()) {
    closingFromHistory = false; // reopened by Back/Forward before "close" fired
    return;
  }
  const addedEntry = dialogAddedHistoryEntry;
  openLocationId = null;
  dialogAddedHistoryEntry = false;
  document.title = BASE_TITLE;

  if (closingFromHistory) {
    closingFromHistory = false; // the URL is already correct
  } else if (addedEntry) {
    history.back(); // remove our entry; popstate finds the dialog already closed
  } else {
    replaceUrl(); // opened from a link: drop ?location= in place
  }
}

function validCategory(category) {
  return category === "all" || directory?.categoryById.has(category) ? category : "all";
}

// Back / Forward: the URL is the source of truth.
window.addEventListener("popstate", () => {
  const urlState = parseUrlState(window.location.search);
  const changed = urlState.query !== state.query || validCategory(urlState.category) !== state.category;
  state.query = urlState.query;
  state.category = validCategory(urlState.category);

  if (urlState.location !== openLocationId) {
    if (details.isOpen()) {
      closingFromHistory = true;
      openLocationId = null;
      details.close();
    }
    if (urlState.location) openLocation(urlState.location, null, { addHistoryEntry: false });
  }
  if (changed) render({ updateUrl: false });
});

// --- Loading ----------------------------------------------------------------

function showLoadError(error) {
  elements.loading.hidden = true;
  elements.grid.hidden = true;
  elements.empty.hidden = true;
  elements.loadError.hidden = false;
  elements.resultCount.textContent = "Locations unavailable";
  console.error("Unable to load campus location data.", error);
}

async function loadDirectory() {
  try {
    const response = await fetch(DATA_URL, { cache: "no-store" });
    if (!response.ok) throw new Error(`Location data request failed with status ${response.status}.`);

    const { categories, locations, issues } = validateDirectory(await response.json());
    if (issues.length) {
      console.warn(`Pathpin skipped or corrected ${issues.length} data problem(s):\n- ${issues.join("\n- ")}`);
    }

    const categoryById = new Map(categories.map((category) => [category.id, category]));
    directory = {
      categories,
      locations,
      categoryById,
      locationById: new Map(locations.map((location) => [location.id, location])),
      searchIndex: buildSearchIndex(locations, categoryById),
    };

    // A shared link may name a category or location that no longer exists.
    state.category = validCategory(state.category);
    filters.render(categories);
    if (initialUrlState.location) openLocation(initialUrlState.location, null, { addHistoryEntry: false });
    render();
  } catch (error) {
    showLoadError(error);
  }
}

// --- Events -----------------------------------------------------------------

elements.grid.addEventListener("click", (event) => {
  const button = event.target instanceof Element ? event.target.closest("button[data-location-id]") : null;
  if (button) openLocation(button.dataset.locationId, button);
});

elements.searchInput.addEventListener("input", () => setState({ query: elements.searchInput.value }));

elements.searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  setState({ query: elements.searchInput.value });
});

function clearSearch() {
  setState({ query: "" });
  elements.searchInput.focus();
}

elements.clearSearch.addEventListener("click", clearSearch);
elements.clearEmptySearch.addEventListener("click", clearSearch);

elements.resetFilters.addEventListener("click", () => {
  setState({ query: "", category: "all" });
  elements.searchInput.focus();
});

for (const pill of elements.popularSearches) {
  pill.addEventListener("click", () => {
    setState({ query: pill.dataset.query, category: "all" });
    elements.searchInput.focus();
  });
}

function isTypingTarget(target) {
  return (
    target instanceof HTMLElement &&
    (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName))
  );
}

// Global shortcuts: "/" focuses search, Esc clears it. The dialog handles its
// own Esc through the native "cancel" event.
document.addEventListener("keydown", (event) => {
  if (details.isOpen()) return;
  if (event.key === "/" && !isTypingTarget(event.target)) {
    event.preventDefault();
    elements.searchInput.focus();
  } else if (event.key === "Escape" && state.query) {
    clearSearch();
  }
});

hydrateIcons();
render({ updateUrl: false }); // show a query from the URL while data loads
loadDirectory();
