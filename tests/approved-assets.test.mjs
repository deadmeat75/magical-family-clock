import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { approvedShapes } from "../src/approved-shapes.js";
import { normalize, demo } from "../src/engine.js";
const hash = (p) => createHash("sha256").update(readFileSync(p)).digest("hex");
test("runtime derivatives retain provenance of every approved source and omit rejected elements", () => {
  const rows = JSON.parse(readFileSync("src/assets/approved/manifest.json")),
    decisions = JSON.parse(
      readFileSync("docs/visual-review/approvals.json"),
    ).items;
  assert.equal(rows.length, 67);
  for (const r of rows) {
    assert.equal(
      decisions.find((d) => d.id === r.id).decision,
      "approved",
      r.id,
    );
    assert.equal(hash("docs/visual-review/" + r.source), r.source_sha256, r.id);
    assert.equal(hash(r.runtime), r.sha256, r.id);
    assert.ok(r.width > 40 && r.height > 40);
  }
  for (const id of ["F01", "F03", "C13", "C14", "C15", "C16"])
    assert.ok(!rows.some((r) => r.id === id));
});
test("optimized deployment images preserve native dimensions and original-source hashes", () => {
  const rows = JSON.parse(readFileSync("src/assets/optimized/manifest.json"));
  for (const r of rows) {
    assert.equal(hash(r.source), r.source_sha256);
    assert.equal(hash(r.runtime), r.sha256);
    assert.ok(r.width >= 100 && r.height >= 100);
  }
  for (const name of ["castle-day-hd", "castle-winter-hd"]) {
    const r = rows.find((r) => r.source.includes(name));
    assert.equal(r.width, 1254);
    assert.equal(r.height, 1254);
  }
});
test("approved hand mattes have registered pivot holes and separate closed contours", () => {
  assert.equal(Object.keys(approvedShapes).length, 12);
  for (const [name, shape] of Object.entries(approvedShapes)) {
    assert.ok(shape.pivot[0] > 0.2 && shape.pivot[0] < 0.8, name);
    assert.ok(shape.pivot[1] > 0.6 && shape.pivot[1] < 0.95, name);
    assert.ok(shape.contours.length >= 2, name);
    assert.ok(
      shape.contours.some((p) => p.some(([, y]) => y < -0.9)),
      name,
    );
  }
});
test("omitted inhabitants cannot be added and a wild unicorn stays grounded", () => {
  const c = demo();
  c.world = {
    objects: [
      { id: "u", kind: "unicorn", motion: "fly" },
      { id: "m", kind: "mushrooms" },
      { id: "p", kind: "fairy", behind_castle: true },
    ],
  };
  const world = normalize(c).world;
  assert.deepEqual(
    world.objects.map((o) => o.kind),
    ["unicorn", "fairy"],
  );
  assert.equal(world.objects[0].motion, "idle");
  assert.equal(world.objects[0].behind_castle, false);
  assert.equal(world.objects[1].behind_castle, false);
});
