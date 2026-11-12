// Validates directory JSON files against the data contract.
// Usage: node scripts/validate-data.js [file ...]
// Exits with code 1 when a file is unusable or has record-level issues.

import { readFile } from "node:fs/promises";
import { validateDirectory } from "../src/core/directory-schema.js";

const DEFAULT_FILES = ["src/smart-campus-handoff/data/locations.json"];
const files = process.argv.length > 2 ? process.argv.slice(2) : DEFAULT_FILES;

let failed = false;

for (const file of files) {
  try {
    const raw = JSON.parse(await readFile(file, "utf8"));
    const { categories, locations, issues } = validateDirectory(raw);
    const unverified = locations.filter((location) => !location.verified).length;
    console.log(
      `${file}: ${categories.length} categories, ${locations.length} locations (${unverified} unverified)`,
    );
    if (issues.length) {
      failed = true;
      for (const issue of issues) console.error(`  ✗ ${issue}`);
    } else {
      console.log("  ✓ no issues");
    }
  } catch (error) {
    failed = true;
    console.error(`${file}: ✗ ${error.message}`);
  }
}

process.exitCode = failed ? 1 : 0;
