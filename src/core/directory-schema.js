// Directory data contract (schema v1).
//
// validateDirectory() never trusts the JSON it receives. A structural problem
// (missing arrays) is fatal; a problem in a single category or location only
// removes that record and is reported in `issues`, so one bad entry cannot
// take the whole directory down.
//
// Pure module: no DOM, no fetch. Used by the browser app, the tests and
// scripts/validate-data.js.

const ID_PATTERN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,63}$/;
const ICON_PATTERN = /^[a-z0-9][a-z0-9-]{0,63}$/;
const HEX_COLOR_PATTERN = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const MIN_FLOOR = -5;
const MAX_FLOOR = 99;

export class DirectoryFormatError extends Error {
  constructor(message) {
    super(message);
    this.name = "DirectoryFormatError";
  }
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function describe(kind, index, record) {
  const id = record && typeof record === "object" && typeof record.id === "string" ? record.id : "?";
  return `${kind}[${index}] (id "${id}")`;
}

function validateCategory(raw, index, seenIds, issues) {
  const where = describe("categories", index, raw);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    issues.push(`${where}: must be an object.`);
    return null;
  }
  if (typeof raw.id !== "string" || !ID_PATTERN.test(raw.id)) {
    issues.push(`${where}: "id" is missing or has invalid characters.`);
    return null;
  }
  if (seenIds.has(raw.id)) {
    issues.push(`${where}: duplicate category id.`);
    return null;
  }
  if (!isNonEmptyString(raw.label)) {
    issues.push(`${where}: "label" is required.`);
    return null;
  }

  const category = {
    id: raw.id,
    label: raw.label.trim(),
    short: isNonEmptyString(raw.short) ? raw.short.trim() : raw.label.trim(),
    color: null,
    tint: null,
    icon: null,
  };

  for (const key of ["color", "tint"]) {
    if (raw[key] === undefined) continue;
    if (typeof raw[key] === "string" && HEX_COLOR_PATTERN.test(raw[key])) {
      category[key] = raw[key];
    } else {
      issues.push(`${where}: "${key}" must be a hex colour such as #2563EB; ignored.`);
    }
  }

  if (raw.icon !== undefined) {
    if (typeof raw.icon === "string" && ICON_PATTERN.test(raw.icon)) {
      category.icon = raw.icon;
    } else {
      issues.push(`${where}: "icon" must be a lowercase icon name; ignored.`);
    }
  }

  seenIds.add(category.id);
  return category;
}

function validateLocation(raw, index, categoryIds, seenIds, issues) {
  const where = describe("locations", index, raw);
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    issues.push(`${where}: must be an object.`);
    return null;
  }
  if (typeof raw.id !== "string" || !ID_PATTERN.test(raw.id)) {
    issues.push(`${where}: "id" is missing or has invalid characters.`);
    return null;
  }
  if (seenIds.has(raw.id)) {
    issues.push(`${where}: duplicate location id.`);
    return null;
  }
  for (const key of ["name", "building"]) {
    if (!isNonEmptyString(raw[key])) {
      issues.push(`${where}: "${key}" is required.`);
      return null;
    }
  }
  if (!categoryIds.has(raw.category)) {
    issues.push(`${where}: unknown category "${raw.category}".`);
    return null;
  }
  if (!Number.isInteger(raw.floor) || raw.floor < MIN_FLOOR || raw.floor > MAX_FLOOR) {
    issues.push(`${where}: "floor" must be a whole number between ${MIN_FLOOR} and ${MAX_FLOOR}.`);
    return null;
  }
  if (raw.description !== undefined && typeof raw.description !== "string") {
    issues.push(`${where}: "description" must be text.`);
    return null;
  }
  if (raw.verified !== undefined && typeof raw.verified !== "boolean") {
    issues.push(`${where}: "verified" must be true or false; treated as unverified.`);
  }

  seenIds.add(raw.id);
  return {
    id: raw.id,
    name: raw.name.trim(),
    category: raw.category,
    building: raw.building.trim(),
    floor: raw.floor,
    description: typeof raw.description === "string" ? raw.description.trim() : "",
    // Anything other than an explicit `true` is shown as unverified.
    verified: raw.verified === true,
  };
}

/**
 * @param {unknown} raw Parsed JSON.
 * @returns {{ categories: object[], locations: object[], issues: string[] }}
 * @throws {DirectoryFormatError} when the top-level structure is unusable.
 */
export function validateDirectory(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new DirectoryFormatError("Directory data must be a JSON object.");
  }
  if (!Array.isArray(raw.categories) || !Array.isArray(raw.locations)) {
    throw new DirectoryFormatError('Directory data needs "categories" and "locations" arrays.');
  }

  const issues = [];
  const categoryIds = new Set();
  const categories = raw.categories
    .map((entry, index) => validateCategory(entry, index, categoryIds, issues))
    .filter(Boolean);

  const locationIds = new Set();
  const locations = raw.locations
    .map((entry, index) => validateLocation(entry, index, categoryIds, locationIds, issues))
    .filter(Boolean);

  return { categories, locations, issues };
}
