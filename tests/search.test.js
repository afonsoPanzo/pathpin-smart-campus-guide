import { test } from "node:test";
import assert from "node:assert/strict";
import {
  buildSearchIndex,
  countByCategory,
  filterLocations,
  normalizeText,
  tokenize,
} from "../src/core/search.js";

const categories = [
  { id: "lab", label: "Laboratories", short: "Laboratory" },
  { id: "office", label: "Offices", short: "Office" },
];
const categoryById = new Map(categories.map((category) => [category.id, category]));
const locations = [
  { id: "B-108", name: "Computer Lab B1.08", category: "lab", building: "Building B", floor: 1, description: "Workstations." },
  { id: "C-302", name: "Chemistry Teaching Room", category: "lab", building: "Building C", floor: 3, description: "Practical sessions." },
  { id: "A-110", name: "Tanulmányi Osztály", category: "office", building: "Building A", floor: 1, description: "Enrolment certificates." },
];
const index = buildSearchIndex(locations, categoryById);
const search = (query, category = "all") =>
  filterLocations(locations, index, { query, category }).results.map((location) => location.id);

test("normalizeText strips Hungarian diacritics and case", () => {
  assert.equal(normalizeText("Nyíregyháza ŐSZ Ű"), "nyiregyhaza osz u");
  assert.equal(normalizeText("  many   spaces "), "many spaces");
  assert.equal(normalizeText(undefined), "");
});

test("tokenize splits a query into normalized words", () => {
  assert.deepEqual(tokenize("  Computer   LAB "), ["computer", "lab"]);
  assert.deepEqual(tokenize("   "), []);
});

test("an empty query returns every location", () => {
  assert.deepEqual(search(""), ["B-108", "C-302", "A-110"]);
});

test("matches without accents", () => {
  assert.deepEqual(search("tanulmanyi osztaly"), ["A-110"]);
});

test("matches category labels, not only names", () => {
  assert.deepEqual(search("laboratory"), ["B-108", "C-302"]);
});

test("every word must match, in any order", () => {
  assert.deepEqual(search("lab computer"), ["B-108"]);
  assert.deepEqual(search("computer chemistry"), []);
});

test("matches ids and descriptions", () => {
  assert.deepEqual(search("c-302"), ["C-302"]);
  assert.deepEqual(search("enrolment"), ["A-110"]);
});

test("category filter narrows results but counts use all query matches", () => {
  const { queryMatches, results } = filterLocations(locations, index, { query: "building", category: "office" });
  assert.deepEqual(results.map((location) => location.id), ["A-110"]);
  const counts = countByCategory(queryMatches, categories);
  assert.equal(counts.get("all"), 3);
  assert.equal(counts.get("lab"), 2);
  assert.equal(counts.get("office"), 1);
});

test("countByCategory reports zero for empty categories", () => {
  const counts = countByCategory([], categories);
  assert.equal(counts.get("lab"), 0);
  assert.equal(counts.get("all"), 0);
});
