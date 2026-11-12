import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { DirectoryFormatError, validateDirectory } from "../src/core/directory-schema.js";

const category = { id: "lab", label: "Laboratories", short: "Laboratory", color: "#0E7C86", tint: "#E7F5F6", icon: "cat-lab" };
const location = { id: "X-001", name: "Sample Lab", category: "lab", building: "Building X", floor: 1, description: "Sample.", verified: false };

function directory(overrides = {}) {
  return { categories: [category], locations: [location], ...overrides };
}

test("accepts the shipped sample data without issues", async () => {
  const raw = JSON.parse(await readFile(new URL("../src/smart-campus-handoff/data/locations.json", import.meta.url), "utf8"));
  const result = validateDirectory(raw);
  assert.deepEqual(result.issues, []);
  assert.equal(result.categories.length, 4);
  assert.equal(result.locations.length, 9);
  assert.ok(result.locations.every((entry) => entry.verified === false), "sample data must stay unverified");
});

test("throws on an unusable top-level structure", () => {
  assert.throws(() => validateDirectory(null), DirectoryFormatError);
  assert.throws(() => validateDirectory([]), DirectoryFormatError);
  assert.throws(() => validateDirectory({ categories: [] }), DirectoryFormatError);
});

test("skips a location with an unknown category instead of failing everything", () => {
  const result = validateDirectory(directory({
    locations: [location, { ...location, id: "X-002", category: "ghost" }],
  }));
  assert.deepEqual(result.locations.map((entry) => entry.id), ["X-001"]);
  assert.equal(result.issues.length, 1);
  assert.match(result.issues[0], /unknown category "ghost"/);
});

test("rejects duplicate ids, keeping the first record", () => {
  const result = validateDirectory(directory({
    locations: [location, { ...location, name: "Duplicate" }],
  }));
  assert.equal(result.locations.length, 1);
  assert.equal(result.locations[0].name, "Sample Lab");
  assert.match(result.issues[0], /duplicate location id/);
});

test("rejects required fields that are missing or of the wrong type", () => {
  const broken = [
    { ...location, id: "A", name: "" },
    { ...location, id: "B", building: 42 },
    { ...location, id: "C", floor: 1.5 },
    { ...location, id: "D", floor: "2" },
    { ...location, id: "has spaces" },
    "not an object",
  ];
  const result = validateDirectory(directory({ locations: broken }));
  assert.equal(result.locations.length, 0);
  assert.equal(result.issues.length, broken.length);
});

test("anything other than verified: true is treated as unverified", () => {
  const result = validateDirectory(directory({
    locations: [
      { ...location, id: "A", verified: true },
      { ...location, id: "B", verified: "yes" },
      { ...location, id: "C", verified: undefined },
    ],
  }));
  assert.deepEqual(result.locations.map((entry) => entry.verified), [true, false, false]);
  assert.equal(result.issues.length, 1, "a non-boolean value is reported");
});

test("drops unsafe category colours and icon names but keeps the category", () => {
  const result = validateDirectory(directory({
    categories: [{ ...category, color: "red; background: url(x)", icon: "../../secret" }],
  }));
  assert.equal(result.categories.length, 1);
  assert.equal(result.categories[0].color, null);
  assert.equal(result.categories[0].icon, null);
  assert.equal(result.categories[0].tint, "#E7F5F6");
  assert.equal(result.issues.length, 2);
});

test("allows basements and an optional description", () => {
  const { description, ...withoutDescription } = location;
  const result = validateDirectory(directory({ locations: [{ ...withoutDescription, floor: -1 }] }));
  assert.deepEqual(result.issues, []);
  assert.equal(result.locations[0].floor, -1);
  assert.equal(result.locations[0].description, "");
});
