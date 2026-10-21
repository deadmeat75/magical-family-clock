import test from "node:test";
import assert from "node:assert/strict";
import {
  normalize,
  demo,
  legacyLayout,
  exportConfig,
  clone,
} from "../src/engine.js";
import { panelGeometry, graphicFor, panelMarkup } from "../src/panels.js";
import {
  moonReading,
  MOON_PHASES,
  worldObject,
  objectActive,
  worldPreset,
} from "../src/world-config.js";
test("castle panels follow the raised opening and retain every destination without altering hand angles", () => {
  const locations = legacyLayout().locations,
    angles = locations.map((l) => l.angle),
    panels = panelGeometry(locations);
  assert.equal(panels.length, locations.length);
  assert.deepEqual(
    locations.map((l) => l.angle),
    angles,
  );
  for (const p of panels) {
    const mid = p.point(p.radius);
    assert.ok(p.contains(mid.x, mid.y));
    assert.equal(p.origin.y, 282);
    assert.ok(!/NaN|Infinity/.test(p.path));
    assert.ok(p.bounds.width > 0 && p.bounds.height > 0);
    assert.ok(Math.hypot(mid.x - 300, mid.y - 282) > 180);
    assert.ok(Math.hypot(mid.x - 300, mid.y - 300) < 278);
  }
  const coincident = panelGeometry(
    Array.from({ length: 12 }, (_, i) => ({ id: "same-" + i, angle: 0 })),
  );
  assert.equal(coincident.length, 12);
  assert.equal(new Set(coincident.map((p) => p.path)).size, 12);
});
test("panels support custom images, independent textures and escaped live sensor labels", () => {
  const c = normalize({
    artwork: "castle",
    locations: [
      {
        id: "home",
        name: "Home",
        angle: -90,
        slot: {
          graphic: "custom",
          image: "/local/house.png",
          background_image: "/local/glass.jpg",
          texture: "wood",
          background: "#144c73",
        },
        label_mode: "sensor",
        label_entity: "sensor.destination",
      },
    ],
  });
  const svg = panelMarkup(c, c.locations, {
    "sensor.destination": { state: "<script>unsafe</script>" },
  });
  assert.ok(svg.includes("url(#wood)"));
  assert.ok(svg.includes("/local/house.png"));
  assert.ok(svg.includes("/local/glass.jpg"));
  assert.ok(!svg.includes("<script>"));
  assert.ok(svg.includes("&lt;script&gt;"));
  assert.equal(
    graphicFor({ id: "work", name: "Office", slot: { graphic: "auto" } }),
    "work",
  );
});
test("all eight Home Assistant moon phases preserve waxing and waning information", () => {
  const c = normalize({
    world: { moon: { source: "entity", entity: "sensor.moon" } },
  });
  for (const [index, name] of MOON_PHASES.entries()) {
    const v = moonReading(c.world, { "sensor.moon": { state: name } });
    assert.equal(v.phase, index / 8);
    assert.equal(v.source, "sensor.moon");
    assert.equal(v.label, name);
    assert.equal(v.visible, true);
  }
  assert.equal(
    moonReading(c.world, { "sensor.moon": { state: "full_moon" } })
      .illumination,
    1,
  );
});
test("moon formats, attributes, fallback and manual override are explicit and do not confuse illumination with cycle", () => {
  const c = normalize({
    world: {
      moon: {
        source: "entity",
        entity: "sensor.moon",
        attribute: "age",
        format: "age-days",
      },
    },
  });
  assert.equal(
    moonReading(c.world, {
      "sensor.moon": { state: "on", attributes: { age: 29.53059 / 2 } },
    }).phase,
    0.5,
  );
  c.world.moon.format = "cycle-percent";
  assert.equal(
    moonReading(c.world, { "sensor.moon": { attributes: { age: 75 } } }).phase,
    0.75,
  );
  c.world.moon.format = "cycle";
  assert.equal(
    moonReading(c.world, { "sensor.moon": { attributes: { age: 0.25 } } })
      .phase,
    0.25,
  );
  c.world.moon.fallback = "hide";
  assert.equal(moonReading(c.world, {}).visible, false);
  c.world.moon.fallback = "calculated";
  const fallback = moonReading(c.world, {}, new Date("2026-10-21T12:00:00Z"));
  assert.equal(fallback.source, "calculated");
  assert.equal(fallback.fallback, true);
  assert.ok(fallback.phase >= 0 && fallback.phase < 1);
  c.world.moon.source = "calculated";
  assert.equal(
    moonReading(c.world, { "sensor.moon": { attributes: { age: 0.75 } } })
      .source,
    "calculated",
  );
  c.world.moon.source = "manual";
  c.world.moon.manual = "new_moon";
  assert.equal(moonReading(c.world, {}).phase, 0);
});
test("auto moon selection uses an existing phase sensor and updates with live readings", () => {
  const c = normalize({ world: { moon: { source: "auto" } } }),
    states = {
      "sensor.moon_phase": { state: "waxing_crescent" },
      "sensor.battery": { state: 65 },
    };
  assert.equal(moonReading(c.world, states).phase, 0.125);
  states["sensor.moon_phase"].state = "last_quarter";
  assert.equal(moonReading(c.world, states).phase, 0.75);
  states["sensor.moon_phase"].state = "unavailable";
  assert.equal(moonReading(c.world, states).source, "calculated");
});
test("inhabitant time, season and weather filters compose and copies remain independent", () => {
  const o = {
    ...worldObject("dragon", "dragon"),
    period: "night",
    season: "winter",
    weather: "snow",
  };
  assert.equal(
    objectActive(o, { period: "night", season: "winter" }, "snow"),
    true,
  );
  for (const args of [
    [{ period: "day", season: "winter" }, "snow"],
    [{ period: "night", season: "summer" }, "snow"],
    [{ period: "night", season: "winter" }, "rain"],
  ])
    assert.equal(objectActive(o, ...args), false);
  const c = normalize({ world: { objects: [o] } }),
    copy = normalize(clone(c));
  copy.world.objects[0].scale = 2;
  assert.equal(c.world.objects[0].scale, 1.2);
  assert.ok(worldPreset("enchanted").some((o) => o.kind === "sea-monster"));
});
test("world configuration bounds, unsafe image guards and privacy exports cover new sensor and artwork fields", () => {
  const c = normalize({
    world: {
      moon: { entity: "sensor.private_moon" },
      objects: Array.from({ length: 50 }, (_, i) => ({
        ...worldObject("custom", "custom-" + i),
        name: "Private creature",
        image: "javascript:alert(1)",
        scale: 99,
        x: -99,
        interval: 0,
      })),
    },
    locations: [
      {
        name: "Secret location",
        angle: -90,
        slot: {
          image: "/local/private-graphic.png",
          background_image: "/local/private-texture.png",
        },
      },
    ],
  });
  assert.equal(c.world.objects.length, 32);
  assert.equal(c.world.objects[0].scale, 3);
  assert.equal(c.world.objects[0].x, 0);
  assert.equal(c.world.objects[0].interval, 8);
  assert.equal(c.world.objects[0].image, "");
  const output = JSON.stringify(exportConfig(c));
  for (const value of [
    "sensor.private_moon",
    "Private creature",
    "private-graphic",
    "private-texture",
    "Secret location",
  ])
    assert.ok(!output.includes(value));
  const untouched = demo();
  assert.ok(normalize(clone(untouched)).world.clouds);
});
