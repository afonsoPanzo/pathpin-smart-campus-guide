// Directory state <-> URL query string. Pure functions: no DOM, no history.
//
//   ?q=library&category=services&location=L-101
//
// Defaults are omitted so the plain page URL stays clean. Unknown parameters
// (e.g. a future ?lang= or campaign tags) are preserved untouched.

const KEYS = { query: "q", category: "category", location: "location" };
const MAX_QUERY_LENGTH = 200;
const MAX_ID_LENGTH = 64;

/**
 * @param {string} search e.g. window.location.search
 * @returns {{ query: string, category: string, location: string | null }}
 */
export function parseUrlState(search) {
  const params = new URLSearchParams(search);
  const query = (params.get(KEYS.query) ?? "").slice(0, MAX_QUERY_LENGTH);
  const category = (params.get(KEYS.category) ?? "").slice(0, MAX_ID_LENGTH) || "all";
  const location = (params.get(KEYS.location) ?? "").slice(0, MAX_ID_LENGTH) || null;
  return { query, category, location };
}

/**
 * @param {{ query?: string, category?: string, location?: string | null }} state
 * @param {string} [baseSearch] current search string whose other params are kept
 * @returns {string} "" or "?..."
 */
export function serializeUrlState({ query = "", category = "all", location = null }, baseSearch = "") {
  const params = new URLSearchParams(baseSearch);
  for (const key of Object.values(KEYS)) params.delete(key);

  const trimmedQuery = query.trim();
  if (trimmedQuery) params.set(KEYS.query, trimmedQuery);
  if (category && category !== "all") params.set(KEYS.category, category);
  if (location) params.set(KEYS.location, location);

  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}
