import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { parse } from "acorn";
test("HACS manifest points to self-contained matching compiled bundle", () => {
  const hacs = JSON.parse(readFileSync("hacs.json"));
  assert.equal(hacs.filename, "magical-family-clock.js");
  assert.ok(existsSync(hacs.filename));
  const code = readFileSync(hacs.filename, "utf8");
  assert.ok(code.includes("magical-family-clock-card-editor"));
  parse(code, { ecmaVersion: 2018, sourceType: "script" });
  assert.ok(!code.includes("crypto.randomUUID"));
  // Script-mode parsing above rejects module declarations; help text may legitimately contain the words import/export.
});
