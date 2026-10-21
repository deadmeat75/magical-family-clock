import test from "node:test";
import assert from "node:assert/strict";
import { normalize, demo, locationFor, exportConfig } from "../src/engine.js";
import {
  handName,
  locationName,
  labelPosition,
  textPosition,
  presentationFor,
} from "../src/design.js";
import { PeopleLibrary, addProfile } from "../src/library.js";
import { bezelText } from "../src/bezel.js";
import { HAND_STYLES } from "../src/design.js";
import { handPath } from "../src/hands.js";
test("blank hand lettering and name survive round trips without a Person fallback", () => {
  const c = normalize({
    members: [{ name: "", hand_label: "", editor_label: "Private label" }],
  });
  assert.equal(c.members[0].name, "");
  assert.equal(handName(c.members[0]), "");
  assert.equal(
    handName(normalize(JSON.parse(JSON.stringify(c))).members[0]),
    "",
  );
});
test("sensor label updates never change fixed matching or explicit coordinates", () => {
  const c = normalize({
    members: [{ id: "a", name: "A", entity: "person.a" }],
    locations: [
      {
        id: "room",
        name: "Room",
        states: ["home"],
        angle: 20,
        label_mode: "sensor",
        label_entity: "sensor.room",
        label_fallback: "No room",
        x: 42,
        y: 28,
      },
    ],
  });
  const states = {
    "person.a": { state: "home" },
    "sensor.room": { state: "Kitchen" },
  };
  assert.equal(locationName(c.locations[0], states), "Kitchen");
  assert.equal(locationFor(c.members[0], c, states).angle, 20);
  assert.deepEqual(labelPosition(c.locations[0]), { x: 252, y: 168 });
  states["sensor.room"].state = "unavailable";
  assert.equal(locationName(c.locations[0], states), "No room");
});
test("titles have higher castle defaults, explicit positioning and independent opacity", () => {
  const c = normalize({
    artwork: "castle",
    title: "",
    caption: "",
    title_y: 23,
    caption_opacity: 0,
  });
  assert.equal(c.title, "");
  assert.equal(c.caption, "");
  assert.equal(textPosition(c, "title").y, 138);
  assert.equal(textPosition(c, "caption").y, 170);
  assert.equal(c.caption_opacity, 0);
});
test("face templates cannot overwrite people, sensors, locations or bezel data", () => {
  const c = demo();
  c.carousel = {
    enabled: true,
    templates: [
      {
        theme: "brass-clockwork",
        members: [],
        locations: [],
        bezel: { items: [] },
        hand_design: "skeleton",
      },
    ],
  };
  const x = presentationFor(c, 0);
  assert.equal(x.members, c.members);
  assert.equal(x.locations, c.locations);
  assert.equal(x.bezel, c.bezel);
  assert.equal(x.theme, "brass-clockwork");
  assert.equal(x.template_hand_design, "skeleton");
});
test("all additional hand silhouettes are finite, distinct and support dimensional surfaces", () => {
  const paths = HAND_STYLES.filter((s) => s !== "theme").map((s) =>
    handPath(s, 200),
  );
  assert.equal(new Set(paths).size, paths.length);
  paths.forEach((path) => assert.ok(!/NaN|undefined|Infinity/.test(path)));
});
test("people profiles persist sensors once and add independent copies with remapped destinations", async () => {
  const data = {};
  const hass = {
    callWS: async (m) => {
      if (m.type === "frontend/get_user_data") return { value: data[m.key] };
      data[m.key] = structuredClone(m.value);
    },
  };
  const library = new PeopleLibrary(hass),
    c = demo();
  const person = c.members[0];
  person.rules = [
    {
      entity: "sensor.speed",
      operator: "above",
      value: 5,
      location: "travelling",
    },
  ];
  const entry = await library.save("Rowan profile", person, c.locations);
  const target = normalize({
    members: [],
    locations: [
      { id: "travel-new", name: "Travelling", states: ["moving"], angle: 80 },
    ],
  });
  const copy = addProfile(target, (await new PeopleLibrary(hass).read())[0]);
  assert.notEqual(copy.members[0].id, person.id);
  assert.equal(copy.members[0].entity, person.entity);
  assert.equal(copy.members[0].rules[0].location, "travel-new");
  copy.members[0].entity = "sensor.other";
  assert.equal((await library.read())[0].member.entity, person.entity);
  await library.rename(entry.id, "New profile name");
  assert.equal((await library.read())[0].name, "New profile name");
  await library.remove(entry.id);
  assert.deepEqual(await library.read(), []);
});
test("bezel supports scalar attributes, formatting, unavailable values and timezone-aware time", () => {
  const states = {
    "weather.home": { state: "sunny", attributes: { temperature: 23.456 } },
  };
  assert.equal(
    bezelText(
      {
        kind: "sensor",
        entity: "weather.home",
        attribute: "temperature",
        label: "Outside",
        unit: "°C",
        decimals: 1,
      },
      states,
    ),
    "Outside 23.5 °C",
  );
  assert.equal(
    bezelText(
      { kind: "sensor", entity: "sensor.absent", fallback: "" },
      states,
    ),
    "",
  );
  const now = new Date("2026-10-21T08:15:00Z");
  assert.match(
    bezelText({ kind: "time" }, states, now, "en-US", "America/Los_Angeles"),
    /01:15/,
  );
});
test("privacy export removes profile metadata, dynamic label sources, bezel sensors and template images", () => {
  const c = demo();
  c.members[0].saved_profile_id = "secret";
  c.members[0].editor_label = "private";
  c.members[0].hand_label = "hidden";
  c.bezel.items = [{ entity: "sensor.secret" }];
  c.locations[0].label_entity = "sensor.private";
  c.carousel.templates = [
    { face_image: "/local/private.png", label: "Private" },
  ];
  const output = JSON.stringify(exportConfig(c));
  for (const word of [
    "sensor.secret",
    "sensor.private",
    "/local/private.png",
    "Private",
    "hidden",
    "secret",
  ])
    assert.ok(!output.includes(word), word);
});
