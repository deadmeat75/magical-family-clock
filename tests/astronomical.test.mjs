import test from "node:test";
import assert from "node:assert/strict";
import { astronomicalReading } from "../src/astronomical-model.js";
import { windReading, weatherMarkup } from "../src/weather.js";
import { bezelArc } from "../src/bezel.js";
const config = {
  world: {
    moon: {
      enabled: true,
      source: "entity",
      entity: "sensor.moon",
      format: "named",
      fallback: "hide",
    },
  },
};
test("astronomical dials use local calendar, leap day and configured lunar sensor", () => {
  const result = astronomicalReading(
    config,
    { "sensor.moon": { state: "first_quarter" } },
    new Date("2024-03-01T07:30:00Z"),
    "America/Los_Angeles",
  );
  assert.equal(result.day, 29);
  assert.equal(result.month, 2);
  assert.equal(result.daysInMonth, 29);
  assert.equal(result.daysInYear, 366);
  assert.equal(result.hourAngle, 345);
  assert.equal(result.minuteAngle, 180);
  assert.equal(result.moon.phase, 0.25);
  assert.equal(result.moon.source, "sensor.moon");
  assert.equal(result.weekday, 4);
});
test("missing moon sensor respects hide instead of inventing a phase", () => {
  const result = astronomicalReading(
    config,
    {},
    new Date("2026-10-22T12:00:00Z"),
    "UTC",
  );
  assert.equal(result.moon.phase, null);
  assert.equal(result.moon.visible, false);
});
test("wind uses weather sensor speed units and handles unavailable data", () => {
  const read = (speed, unit) =>
    windReading(
      { weather_entity: "weather.home" },
      {
        "weather.home": {
          attributes: {
            wind_speed: speed,
            wind_speed_unit: unit,
            wind_bearing: 90,
          },
        },
      },
    );
  assert.equal(read(36, "km/h").speed, 10);
  assert.equal(read(10, "m/s").speed, 10);
  assert.equal(read("unavailable", "mph").speed, null);
  assert.equal(read(0, "m/s").speed, 0);
  assert.equal(read(12, "mph").bearing, 90);
});
test("bezel readouts receive bounded arcs between neighbouring data items", () => {
  const items = [
    { angle: -90, size: 15 },
    { angle: -30, size: 15 },
    { angle: 90, size: 15 },
  ];
  const arc = bezelArc(items[0], items, 330, 40);
  assert.ok(arc.length < (330 * Math.PI) / 3);
  assert.ok(arc.path.includes("A"));
  assert.equal(arc.size, 15);
  assert.ok(bezelArc(items[2], items, 330, 16).size <= 8);
});

test("a calm sensor does not animate airborne wind debris", () => {
  assert.ok(
    !weatherMarkup("wind", 1, false, { speed: 0 }).includes(
      'class="wind-leaf"',
    ),
  );
  assert.ok(
    weatherMarkup("wind", 1, false, { speed: null }).includes(
      'class="wind-leaf"',
    ),
  );
});
