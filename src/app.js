const dataUrl = "./src/smart-campus-handoff/data/locations.json";
const assetRoot = "./src/smart-campus-handoff/assets/icons/";
const categoryIconNames = {
  lecture: "cat-lecture",
  lab: "cat-lab",
  office: "cat-office",
  services: "cat-services",
};

const locationGrid = document.querySelector("[data-location-grid]");
const loadingState = document.querySelector("[data-loading]");
const emptyState = document.querySelector("[data-empty-state]");
const loadError = document.querySelector("[data-load-error]");
const resultCount = document.querySelector("[data-result-count]");
const emptyTitle = document.querySelector("[data-empty-title]");
const emptyDescription = document.querySelector("[data-empty-description]");
const searchInput = document.querySelector("#campus-search");
const clearSearchButton = document.querySelector(".clear-search");
const clearEmptySearchButton = document.querySelector("[data-clear-empty-search]");
const resetFiltersButton = document.querySelector("[data-reset-filters]");
const searchForm = document.querySelector(".search-form");
const categoryTabs = [...document.querySelectorAll(".filter-chip")];
const popularSearches = [...document.querySelectorAll(".popular-pill")];
const detailsDialog = document.querySelector("[data-details-dialog]");
const detailsCloseButton = document.querySelector("[data-details-close]");
const detailsName = document.querySelector("[data-details-name]");
const detailsCategory = document.querySelector("[data-details-category]");
const detailsCategoryIcon = document.querySelector("[data-details-category-icon]");
const detailsCategoryLabel = document.querySelector("[data-details-category-label]");
const detailsId = document.querySelector("[data-details-id]");
const detailsBuilding = document.querySelector("[data-details-building]");
const detailsFloor = document.querySelector("[data-details-floor]");
const detailsDescription = document.querySelector("[data-details-description]");
const detailsVerification = document.querySelector("[data-details-verification]");
const detailsVerificationLabel = document.querySelector("[data-details-verification-label]");
const state = {
  query: "",
  category: "all",
};

let directoryData = null;
let categoryById = new Map();
let selectedLocationId = null;
let detailsOpener = null;

function iconPath(name) {
  return `${assetRoot}${name}.svg`;
}

function makeIcon(name, className = "") {
  const image = document.createElement("img");
  image.src = iconPath(name);
  image.alt = "";
  image.width = 18;
  image.height = 18;
  if (className) image.className = className;
  return image;
}

function makeFloorIndicator(floor, categoryId) {
  const indicator = document.createElement("div");
  indicator.className = `floor-indicator category-${categoryId}`;
  indicator.setAttribute("aria-hidden", "true");

  for (let level = 3; level >= 0; level -= 1) {
    const bar = document.createElement("span");
    bar.className = level === floor ? "floor-bar is-current" : "floor-bar";
    indicator.append(bar);
  }

  return indicator;
}

function makeLocationCard(location, categoryById) {
  const category = categoryById.get(location.category);
  if (!category || !categoryIconNames[location.category]) {
    throw new Error(`Unknown category "${location.category}" for location "${location.id}".`);
  }

  const article = document.createElement("article");
  article.className = `location-card category-${location.category}`;

  const topRow = document.createElement("div");
  topRow.className = "card-top-row";
  const categoryInfo = document.createElement("div");
  categoryInfo.className = "card-category";
  const iconTile = document.createElement("span");
  iconTile.className = "category-icon-tile";
  iconTile.append(makeIcon(categoryIconNames[location.category]));
  const categoryLabel = document.createElement("span");
  categoryLabel.textContent = category.short;
  categoryInfo.append(iconTile, categoryLabel);
  const roomCode = document.createElement("span");
  roomCode.className = "room-code";
  roomCode.textContent = location.id;
  topRow.append(categoryInfo, roomCode);

  const heading = document.createElement("h2");
  heading.className = "location-name";
  heading.textContent = location.name;

  const building = document.createElement("p");
  building.className = "building-name";
  building.append(makeIcon("building"));
  const buildingLabel = document.createElement("span");
  buildingLabel.textContent = location.building;
  building.append(buildingLabel);

  const description = document.createElement("p");
  description.className = "location-description";
  description.textContent = location.description;

  const footer = document.createElement("div");
  footer.className = "card-footer";
  const floorInfo = document.createElement("div");
  floorInfo.className = "floor-info";
  floorInfo.append(makeFloorIndicator(location.floor, location.category));
  const floorLabel = document.createElement("span");
  floorLabel.className = "floor-label";
  floorLabel.textContent = location.floor === 0 ? "Ground floor" : `Floor ${location.floor}`;
  floorInfo.append(floorLabel);
  const details = document.createElement("button");
  details.className = "details-link";
  details.type = "button";
  details.dataset.locationId = location.id;
  details.setAttribute("aria-label", `View details for ${location.name}`);
  details.textContent = "Details";
  details.append(makeIcon("arrow-up-right"));
  footer.append(floorInfo, details);

  article.append(topRow, heading, building, description, footer);
  return article;
}

function updateResults({ query = searchInput.value, category = state.category } = {}) {
  if (!directoryData) return;

  state.query = query.trim();
  state.category = category;
  const normalizedQuery = state.query.toLowerCase();
  const queryMatches = directoryData.locations.filter((location) => {
    if (!normalizedQuery) return true;
    return [location.name, location.building, location.description, location.id].some((value) =>
      value.toLowerCase().includes(normalizedQuery),
    );
  });
  const filteredLocations =
    state.category === "all"
      ? queryMatches
      : queryMatches.filter((location) => location.category === state.category);

  const fragment = document.createDocumentFragment();
  for (const location of filteredLocations) {
    fragment.append(makeLocationCard(location, categoryById));
  }

  locationGrid.replaceChildren(fragment);
  locationGrid.hidden = filteredLocations.length === 0;
  emptyState.hidden = filteredLocations.length !== 0;
  resultCount.textContent = `${filteredLocations.length} ${
    filteredLocations.length === 1 ? "location" : "locations"
  }`;

  const selectedCategory = categoryById.get(state.category);
  if (state.query) {
    emptyTitle.textContent = `No results for “${state.query}”`;
    emptyDescription.textContent =
      "Check the spelling, try a room code like “B-214”, or search by building instead.";
  } else if (selectedCategory) {
    emptyTitle.textContent = `No locations in ${selectedCategory.label}`;
    emptyDescription.textContent = "Choose another category or show all locations.";
  } else {
    emptyTitle.textContent = "No locations available";
    emptyDescription.textContent = "There are no sample locations to display right now.";
  }

  for (const categoryData of directoryData.categories) {
    const count = queryMatches.filter((location) => location.category === categoryData.id).length;
    const countElement = document.querySelector(`[data-count="${categoryData.id}"]`);
    if (countElement) countElement.textContent = String(count);
  }

  const allCount = document.querySelector('[data-count="all"]');
  if (allCount) allCount.textContent = String(queryMatches.length);

  for (const tab of categoryTabs) {
    const isActive = tab.dataset.category === state.category;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
    tab.tabIndex = isActive ? 0 : -1;
  }

  searchInput.value = query;
  const hasQuery = searchInput.value.length > 0;
  clearSearchButton.hidden = !hasQuery;
  document.querySelector(".keyboard-hint").hidden = hasQuery;
  loadingState.hidden = true;
}

function openLocationDetails(locationId, opener) {
  if (!directoryData || detailsDialog.open) return;

  const location = directoryData.locations.find((entry) => entry.id === locationId);
  if (!location) {
    console.error(`Unable to find location details for "${locationId}".`);
    return;
  }

  const category = categoryById.get(location.category);
  if (!category || !categoryIconNames[location.category]) {
    console.error(`Unable to find category details for location "${location.id}".`);
    return;
  }

  selectedLocationId = location.id;
  detailsDialog.dataset.locationId = selectedLocationId;
  detailsOpener = opener;
  detailsName.textContent = location.name;
  detailsCategory.className = `details-category category-${location.category}`;
  detailsCategoryIcon.replaceChildren(makeIcon(categoryIconNames[location.category]));
  detailsCategoryLabel.textContent = category.label;
  detailsId.textContent = location.id;
  detailsBuilding.textContent = location.building;
  detailsFloor.textContent = location.floor === 0 ? "Ground floor" : `Floor ${location.floor}`;
  detailsDescription.textContent = location.description;

  const verified = location.verified === true;
  detailsVerification.classList.toggle("is-verified", verified);
  detailsVerification.classList.toggle("is-unverified", !verified);
  detailsVerificationLabel.textContent = verified ? "Verified" : "Unverified";

  document.body.classList.add("details-open");
  detailsDialog.showModal();
  detailsCloseButton.focus();
}

function closeLocationDetails() {
  if (detailsDialog.open) detailsDialog.close();
}

function restoreDetailsFocus() {
  const opener = detailsOpener;
  detailsOpener = null;
  delete detailsDialog.dataset.locationId;
  selectedLocationId = null;
  document.body.classList.remove("details-open");

  if (opener?.isConnected && !opener.disabled) {
    opener.focus();
  } else {
    searchInput.focus();
  }
}

locationGrid.addEventListener("click", (event) => {
  if (!(event.target instanceof Element)) return;
  const detailsButton = event.target.closest("button[data-location-id]");
  if (!detailsButton || !locationGrid.contains(detailsButton)) return;
  openLocationDetails(detailsButton.dataset.locationId, detailsButton);
});

detailsCloseButton.addEventListener("click", closeLocationDetails);

detailsDialog.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeLocationDetails();
});

detailsDialog.addEventListener("close", restoreDetailsFocus);

detailsDialog.addEventListener("click", (event) => {
  if (event.target !== detailsDialog) return;
  const bounds = detailsDialog.getBoundingClientRect();
  const clickedOutside =
    event.clientX < bounds.left ||
    event.clientX > bounds.right ||
    event.clientY < bounds.top ||
    event.clientY > bounds.bottom;
  if (clickedOutside) closeLocationDetails();
});

searchInput.addEventListener("input", () => updateResults());

clearSearchButton.addEventListener("click", () => {
  updateResults({ query: "" });
  searchInput.focus();
});

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  updateResults();
});

for (const tab of categoryTabs) {
  tab.addEventListener("click", () => updateResults({ category: tab.dataset.category }));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const currentIndex = categoryTabs.indexOf(tab);
    const nextIndex = (currentIndex + direction + categoryTabs.length) % categoryTabs.length;
    const nextTab = categoryTabs[nextIndex];
    updateResults({ category: nextTab.dataset.category });
    nextTab.focus();
  });
}

for (const pill of popularSearches) {
  pill.addEventListener("click", () => {
    updateResults({ query: pill.dataset.query, category: "all" });
    searchInput.focus();
  });
}

clearEmptySearchButton.addEventListener("click", () => {
  updateResults({ query: "" });
  searchInput.focus();
});

resetFiltersButton.addEventListener("click", () => {
  updateResults({ query: "", category: "all" });
  searchInput.focus();
});

document.addEventListener("keydown", (event) => {
  if (detailsDialog.open) {
    if (event.key === "Escape") {
      event.preventDefault();
      closeLocationDetails();
    }
    return;
  }

  const target = event.target;
  const isTyping =
    target instanceof HTMLElement &&
    (target.isContentEditable ||
      target.closest("[contenteditable='true']") !== null ||
      ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

  if (event.key === "/" && !isTyping) {
    event.preventDefault();
    searchInput.focus();
  } else if (event.key === "Escape" && searchInput.value) {
    updateResults({ query: "" });
    searchInput.focus();
  }
});

function renderLocations(data) {
  if (!Array.isArray(data.categories) || !Array.isArray(data.locations)) {
    throw new Error("The locations data has an unexpected format.");
  }
  directoryData = data;
  categoryById = new Map(data.categories.map((category) => [category.id, category]));
  updateResults();
}

async function loadLocations() {
  try {
    const response = await fetch(dataUrl, { cache: "no-store" });
    if (!response.ok) {
      throw new Error(`Location data request failed with status ${response.status}.`);
    }

    const data = await response.json();
    renderLocations(data);
  } catch (error) {
    loadingState.hidden = true;
    locationGrid.hidden = true;
    emptyState.hidden = true;
    loadError.hidden = false;
    resultCount.textContent = "Locations unavailable";
    console.error("Unable to load campus location data.", error);
  }
}

loadLocations();