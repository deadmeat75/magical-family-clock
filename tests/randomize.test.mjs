import test from "node:test";
import assert from "node:assert/strict";
import { defaults, normalize } from "../src/engine.js";
import { randomAppearance } from "../src/randomize.js";
test("random appearance preserves all people, locations, sensor sources and saved design", () => {
  const original = normalize({
    ...defaults(),
    weather_entity: "weather.home",
    sun_entity: "sun.sun",
    members: [
      {
        id: "rowan",
        name: "Rowan",
        entity: "person.rowan",
        battery_entity: "sensor.battery",
      },
    ],
    world: { moon: { source: "entity", entity: "sensor.moon" } },
    bezel: { enabled: true, items: [{ id: "speed", entity: "sensor.speed" }] },
  });
  const snapshot = structuredClone(original);
  const allowed = new Set([
    "theme",
    "artwork",
    "face_image",
    "period_override",
    "season_override",
    "weather_effect",
    "colors",
    "brass_age",
    "world",
  ]);
  for (let i = 0; i < 100; i++) {
    const next = normalize(randomAppearance(original));
    for (const key of Object.keys(original))
      if (!allowed.has(key)) assert.deepEqual(next[key], original[key], key);
    assert.deepEqual(next.world.moon, original.world.moon);
    assert.equal(next.world.quality, original.world.quality);
    assert.notEqual(next.theme, original.theme);
    assert.notEqual(next.period_override, original.period_override);
    assert.ok(next.world.objects.length >= 1 && next.world.objects.length <= 3);
    assert.ok(
      next.world.objects.every(
        (o) =>
          !["cottage", "mushrooms", "lantern", "crystals"].includes(o.kind),
      ),
    );
  }
  assert.deepEqual(original, snapshot);
});
