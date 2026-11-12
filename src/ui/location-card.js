import { createImageIcon, createMaskIcon } from "./icons.js";
import { applyCategoryColors, categoryIconName, formatFloor } from "./category-style.js";

const INDICATOR_LEVELS = [3, 2, 1, 0];

function createFloorIndicator(floor) {
  const indicator = document.createElement("div");
  indicator.className = "floor-indicator";
  indicator.setAttribute("aria-hidden", "true");
  // The indicator shows floors 0-3. Other floors still get the text label;
  // a building-aware indicator comes with the buildings data model.
  for (const level of INDICATOR_LEVELS) {
    const bar = document.createElement("span");
    bar.className = level === floor ? "floor-bar is-current" : "floor-bar";
    indicator.append(bar);
  }
  return indicator;
}

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

/**
 * Builds one directory card. All data goes through textContent, never HTML.
 * @param {object} location validated location
 * @param {object} category validated category
 */
export function createLocationCard(location, category) {
  const article = element("article", "location-card");
  article.dataset.category = category.id;
  applyCategoryColors(article, category);

  const topRow = element("div", "card-top-row");
  const categoryInfo = element("div", "card-category");
  const iconTile = element("span", "category-icon-tile");
  iconTile.append(createMaskIcon(categoryIconName(category)));
  categoryInfo.append(iconTile, element("span", "", category.short));
  topRow.append(categoryInfo, element("span", "room-code", location.id));

  const heading = element("h2", "location-name", location.name);

  const building = element("p", "building-name");
  building.append(createImageIcon("building"), element("span", "", location.building));

  const description = element("p", "location-description", location.description);

  const footer = element("div", "card-footer");
  const floorInfo = element("div", "floor-info");
  floorInfo.append(createFloorIndicator(location.floor), element("span", "floor-label", formatFloor(location.floor)));

  const details = element("button", "details-link", "Details");
  details.type = "button";
  details.dataset.locationId = location.id;
  details.setAttribute("aria-label", `View details for ${location.name}`);
  details.append(createImageIcon("arrow-up-right"));
  footer.append(floorInfo, details);

  article.append(topRow, heading, building, description, footer);
  return article;
}
