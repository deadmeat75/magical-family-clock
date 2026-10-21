import { test } from "node:test";
import assert from "node:assert/strict";
import { defaults } from "../src/engine.js";
import {
  sceneFor,
  periodFor,
  seasonFor,
  SEASONS,
  PERIODS,
} from "../src/scenes.js";
test("sixteen season and period combinations select distinct atlas cells", () => {
  const c = defaults();
  const seen = new Set();
  for (const season of SEASONS)
    for (const period of PERIODS) {
      const scene = sceneFor(
        { ...c, season_override: season, period_override: period },
        {},
        new Date(),
      );
      seen.add(scene.row + ":" + scene.column);
      assert.equal(scene.key, season + "-" + period);
    }
  assert.equal(seen.size, 16);
});
test("sunrise window is inclusive and survives next-event rollover", () => {
  const c = defaults();
  const history = [];
  let states = {
    "sun.sun": {
      state: "below_horizon",
      attributes: { next_rising: "2026-03-29T06:00:00Z" },
    },
  };
  assert.equal(
    periodFor(c, states, new Date("2026-03-29T05:29:59Z"), {}, history),
    "night",
  );
  assert.equal(
    periodFor(c, states, new Date("2026-03-29T05:30:00Z"), {}, history),
    "dawn",
  );
  states = {
    "sun.sun": {
      state: "above_horizon",
      attributes: { next_rising: "2026-03-30T05:58:00Z" },
    },
  };
  assert.equal(
    periodFor(c, states, new Date("2026-03-29T06:15:00Z"), {}, history),
    "dawn",
  );
  assert.equal(
    periodFor(c, states, new Date("2026-03-29T06:30:00Z"), {}, history),
    "dawn",
  );
  assert.equal(
    periodFor(c, states, new Date("2026-03-29T06:30:01Z"), {}, history),
    "day",
  );
});
test("sunset and midnight use timestamp arithmetic rather than local hour math", () => {
  const c = defaults();
  const history = [];
  const states = {
    "sun.sun": {
      state: "above_horizon",
      attributes: { next_setting: "2026-10-25T23:55:00Z" },
    },
  };
  assert.equal(
    periodFor(c, states, new Date("2026-10-25T23:40:00Z"), {}, history),
    "dusk",
  );
  states["sun.sun"] = {
    state: "below_horizon",
    attributes: { next_setting: "2026-10-26T23:54:00Z" },
  };
  assert.equal(
    periodFor(c, states, new Date("2026-10-26T00:20:00Z"), {}, history),
    "dusk",
  );
  assert.equal(
    periodFor(c, states, new Date("2026-10-26T00:26:00Z"), {}, history),
    "night",
  );
});
test("fresh reload uses local solar calculations when the preceding event is absent", () => {
  const c = defaults();
  const states = {
    "sun.sun": {
      state: "above_horizon",
      attributes: { next_rising: "2026-03-22T06:04:00Z" },
    },
  };
  assert.equal(
    periodFor(
      c,
      states,
      new Date("2026-03-21T06:15:00Z"),
      { latitude: 0, longitude: 0 },
      [],
    ),
    "dawn",
  );
});
test("missing solar data has a stable fallback; seasons respect HA timezone and hemisphere", () => {
  const c = defaults();
  assert.equal(periodFor(c, {}, new Date("2026-06-01T00:00:00Z")), "day");
  const now = new Date("2026-06-01T00:30:00Z");
  assert.equal(seasonFor(c, now, "America/Los_Angeles"), "spring");
  assert.equal(
    seasonFor({ ...c, hemisphere: "south" }, now, "America/Los_Angeles"),
    "autumn",
  );
  assert.equal(seasonFor(c, now, "UTC"), "summer");
});
