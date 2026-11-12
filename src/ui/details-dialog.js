import { createMaskIcon } from "./icons.js";
import { applyCategoryColors, categoryIconName, formatFloor } from "./category-style.js";

/**
 * Location details side panel built on the native <dialog> element:
 * showModal() gives focus trapping, inert background and Esc handling.
 *
 * @param {HTMLDialogElement} dialog
 * @param {object} options
 * @param {HTMLElement} options.fallbackFocus focused on close when the opener
 *   no longer exists (or the dialog was opened from a shared link)
 * @param {() => void} [options.onClose] called after the dialog has closed
 * @param {() => string} [options.getShareUrl] link copied by "Copy link"
 */
export function createDetailsDialog(dialog, { fallbackFocus, onClose, getShareUrl }) {
  const field = (name) => dialog.querySelector(`[data-details-${name}]`);
  const closeButton = field("close");
  const nameElement = field("name");
  const categoryElement = field("category");
  const categoryIcon = field("category-icon");
  const categoryLabel = field("category-label");
  const idElement = field("id");
  const buildingElement = field("building");
  const floorElement = field("floor");
  const descriptionElement = field("description");
  const verification = field("verification");
  const verificationLabel = field("verification-label");
  const shareButton = field("share");
  const shareStatus = field("share-status");

  let opener = null;
  let shareStatusTimer = 0;

  function setShareStatus(message) {
    clearTimeout(shareStatusTimer);
    shareStatus.textContent = message;
    if (message) shareStatusTimer = setTimeout(() => (shareStatus.textContent = ""), 4000);
  }

  shareButton.addEventListener("click", async () => {
    const url = getShareUrl?.() ?? window.location.href;
    try {
      // Clipboard API needs a secure context (https or localhost).
      await navigator.clipboard.writeText(url);
      setShareStatus("Link copied");
    } catch {
      setShareStatus("Copy failed. Use the address bar to share this location.");
    }
  });

  function open(location, category, openerElement) {
    if (dialog.open) return;
    opener = openerElement ?? null;
    dialog.dataset.locationId = location.id;

    nameElement.textContent = location.name;
    applyCategoryColors(categoryElement, category);
    categoryIcon.replaceChildren(createMaskIcon(categoryIconName(category)));
    categoryLabel.textContent = category.label;
    idElement.textContent = location.id;
    buildingElement.textContent = location.building;
    floorElement.textContent = formatFloor(location.floor);
    descriptionElement.textContent = location.description;

    verification.classList.toggle("is-verified", location.verified);
    verification.classList.toggle("is-unverified", !location.verified);
    verificationLabel.textContent = location.verified ? "Verified" : "Unverified";
    setShareStatus("");

    document.body.classList.add("details-open");
    dialog.showModal();
    closeButton.focus();
  }

  function close() {
    if (dialog.open) dialog.close();
  }

  closeButton.addEventListener("click", close);

  // Esc fires "cancel"; route it through close() so cleanup runs once.
  dialog.addEventListener("cancel", (event) => {
    event.preventDefault();
    close();
  });

  dialog.addEventListener("close", () => {
    const previous = opener;
    opener = null;
    delete dialog.dataset.locationId;
    document.body.classList.remove("details-open");
    if (previous?.isConnected && !previous.disabled) previous.focus();
    else fallbackFocus.focus();
    onClose?.();
  });

  // A click on the ::backdrop targets the dialog itself, outside its box.
  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;
    const bounds = dialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside) close();
  });

  return { open, close, isOpen: () => dialog.open };
}
