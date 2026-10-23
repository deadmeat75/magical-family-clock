import { test } from "node:test";
import assert from "node:assert/strict";
import {
  defaults,
  normalize,
  legacyLayout,
  positions,
  exportConfig,
} from "../src/engine.js";
import {
  handStyle,
  handRadius,
  legacyHandPath as handPath,
  legacyTextRotation,
  LEGACY_SCALE,
} from "../src/hands.js";
test("new card configuration never uses the installed legacy element name", () => {
  assert.equal(defaults().type, "custom:magical-family-clock-card");
  assert.equal(
    normalize({ type: "custom:magical-family-clock" }).type,
    "custom:magical-family-clock-card",
  );
});
test("verified source layouts preserve six destinations without embedding the household", () => {
  const c = legacyLayout();
  assert.equal(c.members.length, 0);
  assert.deepEqual(
    Object.fromEntries(c.locations.map((l) => [l.name, l.angle])),
    { Home: -90, Work: 180, School: 0, Gym: 90, Away: 45, Travelling: -135 },
  );
  assert.equal(c.separation, 12);
  assert.equal(c.pivot_y, 50);
  assert.equal(c.hand_design, "legacy-curved");
  const standalone = legacyLayout("standalone");
  assert.equal(standalone.separation, 17);
  assert.equal(standalone.pivot_y, 329 / 7);
  assert.equal(standalone.hand_design, "standalone-pointed");
});
test("canvas curve control points and length match a 700 to 600 coordinate conversion", () => {
  const c = legacyLayout();
  const m = normalize({ members: [{}] }).members[0];
  assert.equal(handStyle(m, c), "legacy-curved");
  assert.equal(handRadius(m, c), (252 * 6) / 7);
  const values = handPath("legacy-curved", handRadius(m, c))
    .match(/-?\d+(?:\.\d+)?/g)
    .map(Number);
  const source = [
    350, 350, 368, 224, 368, 161, 353.6, 148.4, 350, 98, 346.4, 148.4, 332, 161,
    332, 224, 350, 350,
  ];
  assert.equal(values.length, source.length);
  values.forEach((n, i) =>
    assert.ok(Math.abs(n - source[i] * LEGACY_SCALE) < 1e-10),
  );
});
test("curved lettering has the same upright flip rule at destinations and fan offsets", () => {
  for (let angle = -720; angle < 720; angle += 0.5) {
    const textAngle = (((angle + 180) % 360) + 360) % 360;
    assert.equal(
      legacyTextRotation(angle),
      textAngle > 90 && textAngle < 270 ? 270 : 90,
    );
    const total =
      (((angle + 90 + legacyTextRotation(angle)) % 360) + 360) % 360;
    assert.ok(total <= 90 || total >= 270);
  }
});
test("four shared-location hands preserve supplied 12-degree offsets and remain present for missing states", () => {
  const c = legacyLayout();
  c.members = normalize({
    members: Array.from({ length: 4 }, (_, i) => ({
      id: "person-" + i,
      entity: "sensor.test_" + i,
      priority: i,
    })),
  }).members;
  const states = Object.fromEntries(
    c.members.map((m) => [m.entity, { state: "home" }]),
  );
  assert.deepEqual(
    positions(c, states).map((p) => p.angle),
    [-108, -96, -84, -72],
  );
  assert.equal(positions(c, {}).length, 4);
  assert.ok(positions(c, {}).every((p) => p.location.id === "away"));
});
test("private custom face path is omitted in default sharing exports", () => {
  const c = legacyLayout();
  assert.equal(exportConfig(c).face_image, "");
  assert.equal(exportConfig(c, true).face_image, c.face_image);
});
