// Directory search and filtering. Pure functions: no DOM.

/**
 * Lowercases text and strips diacritics so "Nyíregyháza", "nyiregyhaza" and
 * "NYÍREGYHÁZA" all match each other.
 */
export function normalizeText(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

export function tokenize(query) {
  const normalized = normalizeText(query);
  return normalized ? normalized.split(" ") : [];
}

/**
 * Precomputes one normalized search string per location, including the
 * category's labels, so searching "laboratory" finds every lab.
 * @returns {Map<string, string>} location id -> searchable text
 */
export function buildSearchIndex(locations, categoryById) {
  const index = new Map();
  for (const location of locations) {
    const category = categoryById.get(location.category);
    const fields = [
      location.name,
      location.building,
      location.description,
      location.id,
      category?.label,
      category?.short,
    ];
    index.set(location.id, normalizeText(fields.filter(Boolean).join(" ")));
  }
  return index;
}

/** Every query word must appear somewhere in the location's text (AND). */
export function matchesQuery(searchText, tokens) {
  return tokens.every((token) => searchText.includes(token));
}

/**
 * @returns {{ queryMatches: object[], results: object[] }}
 *   queryMatches: locations matching the query, any category (used for counts)
 *   results: queryMatches narrowed to the selected category
 */
export function filterLocations(locations, searchIndex, { query = "", category = "all" } = {}) {
  const tokens = tokenize(query);
  const queryMatches = tokens.length
    ? locations.filter((location) => matchesQuery(searchIndex.get(location.id) ?? "", tokens))
    : locations.slice();
  const results =
    category === "all"
      ? queryMatches
      : queryMatches.filter((location) => location.category === category);
  return { queryMatches, results };
}

/** @returns {Map<string, number>} category id -> count, plus "all". */
export function countByCategory(locations, categories) {
  const counts = new Map(categories.map((category) => [category.id, 0]));
  for (const location of locations) {
    counts.set(location.category, (counts.get(location.category) ?? 0) + 1);
  }
  counts.set("all", locations.length);
  return counts;
}
