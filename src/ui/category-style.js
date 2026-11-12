import { FALLBACK_CATEGORY_ICON } from "../config.js";

/** Applies a category's colours (from data) as CSS custom properties. */
export function applyCategoryColors(element, category) {
  if (category.color) element.style.setProperty("--category-color", category.color);
  else element.style.removeProperty("--category-color");
  if (category.tint) element.style.setProperty("--category-tint", category.tint);
  else element.style.removeProperty("--category-tint");
}

export function categoryIconName(category) {
  return category.icon ?? FALLBACK_CATEGORY_ICON;
}

export function formatFloor(floor) {
  return floor === 0 ? "Ground floor" : `Floor ${floor}`;
}
