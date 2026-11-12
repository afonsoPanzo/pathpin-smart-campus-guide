import { createMaskIcon } from "./icons.js";
import { categoryIconName } from "./category-style.js";

/**
 * Category filter tabs, rendered from data. The "All Locations" tab stays in
 * index.html so the toolbar is not empty while data loads.
 *
 * @param {HTMLElement} list element with role="tablist"
 * @param {(categoryId: string) => void} onSelect
 */
export function createCategoryFilters(list, onSelect) {
  let tabs = [...list.querySelectorAll('[role="tab"]')];
  const countElements = new Map();

  function registerTab(tab) {
    countElements.set(tab.dataset.category, tab.querySelector(".filter-count"));
  }
  tabs.forEach(registerTab);

  function render(categories) {
    const staticTabs = tabs.filter((tab) => tab.dataset.category === "all");
    const fragment = document.createDocumentFragment();
    const created = categories.map((category) => {
      const tab = document.createElement("button");
      tab.className = "filter-chip";
      tab.type = "button";
      tab.setAttribute("role", "tab");
      tab.setAttribute("aria-selected", "false");
      tab.tabIndex = -1;
      tab.dataset.category = category.id;

      const label = document.createElement("span");
      label.textContent = category.label;
      const count = document.createElement("span");
      count.className = "filter-count";
      count.textContent = "—";

      tab.append(createMaskIcon(categoryIconName(category)), label, count);
      fragment.append(tab);
      return tab;
    });

    for (const tab of tabs) {
      if (!staticTabs.includes(tab)) tab.remove();
    }
    list.append(fragment);
    tabs = [...staticTabs, ...created];
    countElements.clear();
    tabs.forEach(registerTab);
  }

  function update({ active, counts }) {
    for (const tab of tabs) {
      const isActive = tab.dataset.category === active;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    }
    for (const [id, countElement] of countElements) {
      if (countElement) countElement.textContent = String(counts.get(id) ?? 0);
    }
  }

  list.addEventListener("click", (event) => {
    const tab = event.target instanceof Element ? event.target.closest('[role="tab"]') : null;
    if (tab && list.contains(tab)) onSelect(tab.dataset.category);
  });

  // Roving focus with automatic activation (WAI-ARIA tabs pattern).
  list.addEventListener("keydown", (event) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    let next;
    if (event.key === "ArrowRight") next = (current + 1) % tabs.length;
    else if (event.key === "ArrowLeft") next = (current - 1 + tabs.length) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    onSelect(tabs[next].dataset.category);
    tabs[next].focus();
  });

  return { render, update };
}
