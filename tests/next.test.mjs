import test from "node:test";
import assert from "node:assert/strict";
import {
  normalize,
  demo,
  positions,
  safeImage,
  exportConfig,
} from "../src/engine.js";
import { metricText, runtimeConfig } from "../src/data.js";
import { ClockLibrary } from "../src/library.js";
import { weatherFor, weatherMarkup, WEATHER } from "../src/weather.js";
test("sensor rules override ordinary states while missing optional values disappear", () => {
  const c = demo();
  c.members[0].rules = [
    {
      entity: "sensor.speed",
      operator: "above",
      value: "5",
      location: "travelling",
    },
  ];
  const states = {
    "sensor.mfc_demo_0": { state: "home" },
    "sensor.speed": {
      state: "12.34",
      attributes: { unit_of_measurement: "km/h" },
    },
  };
  assert.equal(positions(c, states)[0].location.id, "travelling");
  assert.equal(
    metricText({ entity: "sensor.speed", label: "Speed", decimals: 1 }, states),
    "Speed: 12.3 km/h",
  );
  assert.equal(metricText({ entity: "sensor.missing" }, states), "");
  states["sensor.speed"].state = "unavailable";
  assert.equal(positions(c, states)[0].location.id, "home");
});
test("dynamic locations are ephemeral, deduplicated and resolve current sensor states", () => {
  const c = demo();
  c.dynamic_locations = true;
  const states = {
    "zone.office": { state: "0", attributes: { friendly_name: "Office" } },
    "sensor.mfc_demo_0": { state: "Office" },
  };
  assert.equal(
    runtimeConfig(c, states).locations.filter((l) => l.name === "Office")
      .length,
    1,
  );
  assert.equal(positions(c, states)[0].location.name, "Office");
  assert.equal(c.locations.length, 4);
});
test("embedded uploads reject active formats and privacy export removes new data sources", () => {
  assert.equal(safeImage("data:image/svg+xml;base64,PHN2Zz4="), "");
  assert.equal(
    safeImage("data:image/png;base64,YWJjZA=="),
    "data:image/png;base64,YWJjZA==",
  );
  const c = demo();
  c.members[0].metrics = [{ entity: "sensor.private" }];
  c.members[0].rules = [{ entity: "sensor.private" }];
  c.caption = "Private family";
  const out = exportConfig(c);
  assert.deepEqual(out.members[0].metrics, []);
  assert.deepEqual(out.members[0].rules, []);
  assert.equal(out.caption, "Magical Family Clock");
  assert.equal(
    normalize({ ...c, members: [{ name: "A", width: 100 }] }).members[0].width,
    2.5,
  );
});
test("saved clocks persist full independent copies, serialize updates, rename and delete", async () => {
  let value = null;
  const hass = {
    callWS: async (message) => {
      if (message.type === "frontend/get_user_data") return { value };
      value = structuredClone(message.value);
    },
  };
  const a = new ClockLibrary(hass),
    b = new ClockLibrary(hass),
    c = demo();
  const [first] = await Promise.all([a.save("Hall", c), b.save("Kitchen", c)]);
  c.members[0].name = "Changed";
  assert.equal((await a.read())[0].config.members[0].name, "Rowan");
  await a.rename(first.id, "Entry");
  assert.equal((await b.read())[0].name, "Entry");
  await b.remove(first.id);
  assert.equal((await a.read()).length, 1);
  const broken = new ClockLibrary({
    callWS: async () => {
      throw Error("offline");
    },
  });
  await assert.rejects(() => broken.save("Fail", c), /offline/);
  assert.equal((await a.read()).length, 1);
});
test("all manual weather conditions render safely and automatic conditions map distinctly", () => {
  for (const weather_effect of WEATHER.filter((x) => x !== "auto"))
    assert.ok(weatherMarkup(weatherFor({ weather_effect }, {})).length > 0);
  const c = { weather_effect: "auto", weather_entity: "weather.home" };
  assert.equal(weatherFor(c, { "weather.home": { state: "pouring" } }), "rain");
  assert.equal(
    weatherFor(c, { "weather.home": { state: "rainy" } }),
    "light-rain",
  );
  assert.equal(weatherFor(c, { "weather.home": { state: "snowy" } }), "snow");
});
test("configuration size protects Home Assistant transport and invalid numeric thresholds never match", async () => {
  assert.throws(
    () => normalize({ ...demo(), caption: "x".repeat(2500001) }),
    /2.5 MB/,
  );
  const c = demo();
  c.members[0].rules = [
    {
      entity: "sensor.speed",
      operator: "above",
      value: "",
      location: "travelling",
    },
  ];
  assert.equal(
    positions(c, {
      "sensor.speed": { state: "4" },
      "sensor.mfc_demo_0": { state: "home" },
    })[0].location.id,
    "home",
  );
});
