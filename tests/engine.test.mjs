import { test } from "node:test";
import assert from "node:assert/strict";
import {
  normalize,
  defaults,
  demo,
  demoStates,
  locationFor,
  positions,
  backgroundFor,
  exportConfig,
  importConfig,
  safeImage,
} from "../src/engine.js";
test("four coincident people retain distinct centered hand angles", () => {
  const c = demo();
  const p = positions(c, demoStates());
  assert.equal(p.length, 4);
  assert.equal(new Set(p.map((x) => x.angle)).size, 4);
  assert.equal(p.reduce((a, x) => a + x.angle, 0) / 4, -90);
  assert.deepEqual(positions(c, demoStates()), p);
});
for (const entity of [
  "person.example",
  "device_tracker.example",
  "sensor.example",
])
  test(entity + " maps direct states", () => {
    const c = normalize(defaults());
    assert.equal(
      locationFor({ entity }, c, { [entity]: { state: "home" } }).id,
      "home",
    );
    assert.equal(
      locationFor({ entity }, c, { [entity]: { state: "not_home" } }).id,
      "away",
    );
  });
test("missing, unexpected, unavailable and empty states use fallback", () => {
  const c = normalize(defaults());
  for (const value of ["surprise", "unavailable", "unknown", ""])
    assert.equal(
      locationFor({ entity: "person.x" }, c, { "person.x": { state: value } })
        .id,
      "unknown",
    );
  assert.equal(locationFor({ entity: "missing" }, c, {}).id, "unknown");
});
test("attributes, aliases, case folding, member overrides and travelling", () => {
  const c = normalize(defaults());
  c.locations[0].aliases = ["Residence"];
  const m = {
    entity: "sensor.x",
    attribute: "place",
    overrides: { office: "away" },
    travelling_entity: "binary_sensor.moving",
  };
  const states = {
    "sensor.x": { state: "ignored", attributes: { place: "RESIDENCE" } },
  };
  assert.equal(locationFor(m, c, states).id, "home");
  states["sensor.x"].attributes.place = "office";
  assert.equal(locationFor(m, c, states).id, "away");
  states["binary_sensor.moving"] = { state: "on" };
  assert.equal(locationFor(m, c, states).id, "travelling");
});
test("zones match actual friendly state, never assume zone ID", () => {
  const c = normalize(defaults());
  c.locations[0].zone = "zone.office";
  const states = {
    "zone.office": { state: "0", attributes: { friendly_name: "Office" } },
    "person.x": { state: "Office" },
  };
  assert.equal(locationFor({ entity: "person.x" }, c, states).id, "home");
  states["person.x"].state = "zone.office";
  assert.equal(locationFor({ entity: "person.x" }, c, states).id, "unknown");
});
test("disabled members excluded, priority ordering, stack radii bounded", () => {
  const c = demo();
  c.members[1].enabled = false;
  c.members[2].priority = -1;
  c.collision = "stack";
  const p = positions(c, demoStates());
  assert.equal(p.length, 3);
  assert.equal(p[0].member.name, "Robin");
  assert.ok(p.every((x) => x.radius >= 0.5));
});
test("instance configuration and cloning are independent", () => {
  const input = demo();
  const a = normalize(input),
    b = normalize(input);
  a.members[0].name = "Changed";
  a.locations[0].angle = 0;
  assert.equal(b.members[0].name, "Rowan");
  assert.equal(input.locations[0].angle, -90);
});
test("import validation rejects malformed versions, arrays, duplicate IDs and dangerous URLs", () => {
  assert.throws(() => importConfig("[]"));
  assert.throws(() => importConfig('{"version":2}'));
  assert.throws(() => normalize({ members: {} }));
  assert.throws(() => normalize({ members: [{ id: "x" }, { id: "x" }] }));
  assert.equal(safeImage("javascript:alert(1)"), "");
  assert.equal(safeImage("//evil.test/a"), "");
  assert.equal(safeImage("/local/portrait.png"), "/local/portrait.png");
  assert.equal(
    normalize({ members: [{ portrait: "javascript:alert(1)" }] }).members[0]
      .portrait,
    "",
  );
});
test("privacy export removes personal values including custom locations", () => {
  const c = demo();
  c.members[0].portrait = "/local/private.png";
  c.locations[0].name = "Private house";
  c.locations[0].zone = "zone.private";
  c.background_images = { day: "/local/private.jpg" };
  const out = exportConfig(c);
  const s = JSON.stringify(out);
  for (const v of ["Rowan", "sensor.mfc_demo_0", "private", "Private house"])
    assert.ok(!s.includes(v));
  assert.equal(
    importConfig(JSON.stringify(exportConfig(c, true))).members[0].name,
    "Rowan",
  );
});
test("background day, night, low sun, seasons, weather and southern hemisphere", () => {
  const c = normalize(defaults());
  const states = {
    "sun.sun": {
      state: "above_horizon",
      attributes: { elevation: 30, rising: true },
    },
  };
  assert.equal(backgroundFor(c, states, new Date(2026, 0, 1)), "winter");
  c.hemisphere = "south";
  assert.equal(backgroundFor(c, states, new Date(2026, 0, 1)), "summer");
  c.seasonal = false;
  assert.equal(backgroundFor(c, states), "day");
  states["sun.sun"].attributes.elevation = 5;
  assert.equal(backgroundFor(c, states), "sunrise");
  states["sun.sun"].attributes.rising = false;
  assert.equal(backgroundFor(c, states), "sunset");
  states["sun.sun"].state = "below_horizon";
  assert.equal(backgroundFor(c, states), "night");
  c.weather_entity = "weather.x";
  states["weather.x"] = { state: "rainy" };
  assert.equal(backgroundFor(c, states), "rain");
  c.background_mode = "manual";
  c.background = "spring";
  assert.equal(backgroundFor(c, states), "spring");
});
test("practical limits and finite geometry", () => {
  assert.throws(() =>
    normalize({ members: Array.from({ length: 251 }, () => ({})) }),
  );
  const c = normalize({
    members: [{ length: -100, head_size: 100 }],
    separation: Infinity,
    duration: -1,
  });
  assert.equal(c.members[0].length, 0.5);
  assert.equal(c.members[0].head_size, 1.5);
  assert.equal(c.duration, 0);
  assert.equal(c.separation, 18);
});
