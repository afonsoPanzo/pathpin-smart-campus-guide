import { test } from "node:test";
import assert from "node:assert/strict";
import { parseUrlState, serializeUrlState } from "../src/core/url-state.js";

test("an empty URL gives the default state", () => {
  assert.deepEqual(parseUrlState(""), { query: "", category: "all", location: null });
});

test("parses query, category and location", () => {
  assert.deepEqual(parseUrlState("?q=computer+lab&category=lab&location=B-108"), {
    query: "computer lab",
    category: "lab",
    location: "B-108",
  });
});

test("decodes accents and special characters", () => {
  const search = serializeUrlState({ query: "Tanulmányi & Co" });
  assert.equal(parseUrlState(search).query, "Tanulmányi & Co");
});

test("defaults are omitted from the URL", () => {
  assert.equal(serializeUrlState({ query: "  ", category: "all", location: null }), "");
});

test("serializes only non-default values", () => {
  assert.equal(serializeUrlState({ query: " library ", category: "services" }), "?q=library&category=services");
  assert.equal(serializeUrlState({ location: "L-101" }), "?location=L-101");
});

test("keeps unrelated parameters and replaces its own", () => {
  const search = serializeUrlState({ query: "lab" }, "?lang=hu&q=old&location=X-1");
  assert.equal(search, "?lang=hu&q=lab");
});

test("round-trips", () => {
  const state = { query: "seminar room", category: "lecture", location: "B-214" };
  assert.deepEqual(parseUrlState(serializeUrlState(state)), state);
});

test("caps overly long values", () => {
  const parsed = parseUrlState(`?q=${"a".repeat(500)}&location=${"b".repeat(500)}`);
  assert.equal(parsed.query.length, 200);
  assert.equal(parsed.location.length, 64);
});
