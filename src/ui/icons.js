import { ICON_ROOT } from "../config.js";

// Icons are drawn with a CSS mask filled with `currentColor` (see .mask-icon
// in style.css). Any colour coming from data or CSS applies directly, so no
// per-colour CSS filter rules are needed.

export function iconUrl(name) {
  // Absolute URL: a relative url() inside a CSS custom property would be
  // resolved against the stylesheet, not the page.
  return new URL(`${ICON_ROOT}${name}.svg`, document.baseURI).href;
}

export function setMaskIcon(element, name) {
  element.classList.add("mask-icon");
  element.style.setProperty("--icon", `url("${iconUrl(name)}")`);
  element.setAttribute("aria-hidden", "true");
  return element;
}

export function createMaskIcon(name, className = "") {
  const icon = setMaskIcon(document.createElement("span"), name);
  if (className) icon.classList.add(...className.split(" "));
  return icon;
}

/** Plain <img> icon, for icons whose colour is fixed by existing CSS. */
export function createImageIcon(name, className = "") {
  const image = document.createElement("img");
  image.src = `${ICON_ROOT}${name}.svg`;
  image.alt = "";
  image.width = 18;
  image.height = 18;
  if (className) image.className = className;
  return image;
}

/** Turns static `<span data-icon="name">` placeholders in markup into icons. */
export function hydrateIcons(root = document) {
  for (const element of root.querySelectorAll("[data-icon]")) {
    setMaskIcon(element, element.dataset.icon);
  }
}
