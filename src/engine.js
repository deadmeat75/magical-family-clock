import { matchesRule, runtimeConfig } from "./data.js";
export const THEMES = [
  "enchanted-spoons",
  "brass-clockwork",
  "living-magical",
  "whimsical-workshop",
];
export const clone = (v) => JSON.parse(JSON.stringify(v));
export const uid = () =>
  "mfc-" +
  Date.now().toString(36) +
  "-" +
  Math.random().toString(36).slice(2, 9);
const num = (v, d, min, max) =>
  v !== null && v !== undefined && Number.isFinite(Number(v))
    ? Math.min(max, Math.max(min, Number(v)))
    : d;
export function defaults() {
  return {
    type: "custom:magical-family-clock-card",
    version: 1,
    title: "Our whereabouts",
    caption: "Magical Family Clock",
    caption_size: 12,
    location_size: 17,
    name_size: 13,
    caption_font: "Georgia, serif",
    location_font: "Georgia, serif",
    name_font: "Georgia, serif",
    colors: {},
    dynamic_locations: false,
    weather_effect: "auto",
    weather_intensity: 1,
    weather_motion: true,
    theme: THEMES[0],
    members: [],
    locations: [
      { id: "home", name: "Home", angle: -90, states: ["home"] },
      { id: "away", name: "Away", angle: 90, states: ["not_home"] },
      {
        id: "travelling",
        name: "Travelling",
        angle: 180,
        states: ["travelling"],
      },
      {
        id: "unknown",
        name: "Unknown",
        angle: 0,
        states: ["unknown", "unavailable", ""],
      },
    ],
    separation: 18,
    collision: "fan",
    duration: 1000,
    case_insensitive: true,
    background_mode: "auto",
    background: "day",
    brightness: 1,
    seasonal: true,
    gears: true,
    gear_speed: 60,
    sun_entity: "sun.sun",
    weather_entity: "",
    unknown_location: "unknown",
    travelling_location: "travelling",
    reduced_motion: false,
    background_images: {},
    center_image: "",
    size: 640,
    aspect_ratio: 1,
    font: "Georgia, serif",
    detail: "rich",
    background_opacity: 0.4,
    background_transition: 1500,
    transparent: false,
    artwork: "vector",
    season_override: "auto",
    period_override: "auto",
    hand_design: "legacy-curved",
    pivot_x: 50,
    pivot_y: 50,
    face_image: "",
    show_location_labels: true,
    show_branding: true,
  };
}
export function safeImage(v) {
  if (
    typeof v === "string" &&
    v.length <= 2000000 &&
    /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/]+={0,2}$/.test(v)
  )
    return v;
  return typeof v === "string" &&
    !/[\u0000-\u0020\\]/.test(v) &&
    /^(https?:\/\/|\/(?!\/))/.test(v)
    ? v
    : "";
}
export function normalize(input) {
  if (!input || typeof input !== "object" || Array.isArray(input))
    throw Error("Choose a clock configuration object.");
  if (input.version && input.version !== 1)
    throw Error("Unsupported configuration version.");
  if (new TextEncoder().encode(JSON.stringify(input)).length > 2500000)
    throw Error(
      "Clock configuration exceeds 2.5 MB. Remove or reduce embedded images.",
    );
  const c = Object.assign(defaults(), clone(input));
  c.type = "custom:magical-family-clock-card";
  c.version = 1;
  if (!THEMES.includes(c.theme)) throw Error("Select a supported theme.");
  if (!Array.isArray(c.members) || !Array.isArray(c.locations))
    throw Error("People and locations must be lists.");
  if (c.members.length > 250 || c.locations.length > 250)
    throw Error("Use at most 250 people and locations per clock.");
  c.locations = c.locations.map((l) => {
    if (!l || typeof l !== "object") throw Error("Invalid location.");
    return Object.assign({}, l, {
      id: String(l.id || uid()),
      name: String(l.name || "Location"),
      angle: num(l.angle, 0, -360, 360),
      states: Array.isArray(l.states) ? l.states.map(String) : [],
      aliases: Array.isArray(l.aliases) ? l.aliases.map(String) : [],
    });
  });
  c.members = c.members.map((m) => {
    if (!m || typeof m !== "object") throw Error("Invalid person.");
    return Object.assign(
      {
        enabled: true,
        nickname: "",
        entity: "",
        travelling_entity: "",
        attribute: "",
        color: "#d5b46c",
        text_color: "#fff5dc",
        show_name: true,
        show_portrait: true,
        portrait_shape: "oval",
        portrait_frame: "brass",
        overrides: {},
        priority: 0,
        material: "color",
        hand_design: "theme",
        width: 1,
        metrics: [],
        rules: [],
      },
      m,
      {
        id: String(m.id || uid()),
        name: String(m.name || "Person"),
        length: num(m.length, 1, 0.5, 1.1),
        width: num(m.width, 1, 0.5, 2.5),
        metrics: Array.isArray(m.metrics)
          ? m.metrics
              .slice(0, 4)
              .filter((x) => x && typeof x === "object")
              .map((x) => ({ ...x }))
          : [],
        rules: Array.isArray(m.rules)
          ? m.rules
              .slice(0, 30)
              .filter((x) => x && typeof x === "object")
              .map((x) => ({ ...x }))
          : [],
        portrait: safeImage(m.portrait),
        portrait_zoom: num(m.portrait_zoom, 1, 1, 4),
        portrait_x: num(m.portrait_x, 50, 0, 100),
        portrait_y: num(m.portrait_y, 50, 0, 100),
        portrait_rotation: num(m.portrait_rotation, 0, -180, 180),
        head_size: num(m.head_size, 1, 0.6, 1.5),
      },
    );
  });
  for (const list of [c.locations, c.members])
    if (new Set(list.map((x) => x.id)).size !== list.length)
      throw Error("IDs must be unique.");
  if (
    !c.background_images ||
    typeof c.background_images !== "object" ||
    Array.isArray(c.background_images)
  )
    throw Error("Background images must be an object.");
  c.background_images = Object.keys(c.background_images).reduce((out, k) => {
    out[k] = safeImage(c.background_images[k]);
    return out;
  }, {});
  for (const m of c.members)
    if (
      !m.overrides ||
      typeof m.overrides !== "object" ||
      Array.isArray(m.overrides)
    )
      throw Error("Personal mappings must be an object.");
  c.caption = String(c.caption ?? "").slice(0, 150);
  c.caption_size = num(c.caption_size, 12, 6, 32);
  c.location_size = num(c.location_size, 17, 8, 32);
  c.name_size = num(c.name_size, 13, 7, 26);
  c.weather_intensity = num(c.weather_intensity, 1, 0.2, 2);
  if (!c.colors || typeof c.colors !== "object" || Array.isArray(c.colors))
    c.colors = {};
  c.colors = Object.fromEntries(
    Object.entries(c.colors).filter(
      ([k, v]) =>
        ["paper", "ink", "metal", "rim"].includes(k) &&
        /^#[0-9a-f]{6}$/i.test(v),
    ),
  );
  c.duration = num(c.duration, 1000, 0, 10000);
  c.separation = num(c.separation, 18, 0, 25);
  c.size = num(c.size, 640, 200, 2000);
  c.aspect_ratio = num(c.aspect_ratio, 1, 0.6, 1.6);
  c.background_opacity = num(c.background_opacity, 0.4, 0, 1);
  c.background_transition = num(c.background_transition, 1500, 0, 10000);
  c.brightness = num(c.brightness, 1, 0.15, 1.5);
  c.gear_speed = num(c.gear_speed, 60, 5, 300);
  c.center_image = safeImage(c.center_image);
  c.face_image = safeImage(c.face_image);
  c.pivot_x = num(c.pivot_x, 50, 10, 90);
  c.pivot_y = num(c.pivot_y, 50, 10, 90);
  return c;
}
export function legacyLayout(variant = "ha") {
  const c = defaults();
  c.theme = "living-magical";
  c.locations = [
    { id: "home", name: "Home", angle: -90, states: ["home"] },
    { id: "work", name: "Work", angle: 180, states: ["work"] },
    { id: "school", name: "School", angle: 0, states: ["school"] },
    { id: "gym", name: "Gym", angle: 90, states: ["gym"] },
    { id: "away", name: "Away", angle: 45, states: ["away", "not_home"] },
    {
      id: "travelling",
      name: "Travelling",
      angle: -135,
      states: ["travelling", "traveling"],
    },
  ];
  c.separation = variant === "standalone" ? 17 : 12;
  c.hand_design =
    variant === "standalone" ? "standalone-pointed" : "legacy-curved";
  c.pivot_y = variant === "standalone" ? 329 / 7 : 50;
  c.face_image = "/local/magical-clock/clock-face.png";
  c.show_location_labels = false;
  c.show_branding = false;
  c.unknown_location = "away";
  return normalize(c);
}
export function locationFor(m, c, states) {
  const travel = states[m.travelling_entity];
  if (travel && ["on", "true", "moving"].includes(travel.state))
    return c.locations.find((l) => l.id === c.travelling_location);
  const rule = (m.rules || []).find(
    (r) =>
      matchesRule(r, states, m.entity) &&
      c.locations.some((l) => l.id === r.location),
  );
  if (rule) return c.locations.find((l) => l.id === rule.location);
  const source = states[m.entity];
  const raw = source
    ? m.attribute
      ? (source.attributes || {})[m.attribute]
      : source.state
    : "unavailable";
  const state = raw == null ? "" : String(raw);
  const key = (v) => (c.case_insensitive ? String(v).toLowerCase() : String(v));
  const overrides = m.overrides || {};
  const override = Object.keys(overrides).find((k) => key(k) === key(state));
  if (override !== undefined)
    return c.locations.find((l) => l.id === overrides[override]);
  return (
    c.locations
      .slice()
      .sort((a, b) => (b.priority || 0) - (a.priority || 0))
      .find((l) => {
        const matches = [...l.states, ...l.aliases];
        if (l.zone && states[l.zone])
          matches.push((states[l.zone].attributes || {}).friendly_name || "");
        return matches.some((s) => key(s) === key(state));
      }) || c.locations.find((l) => l.id === c.unknown_location)
  );
}
export function positions(c, states) {
  c = runtimeConfig(c, states);
  const items = c.members
    .filter((m) => m.enabled !== false)
    .slice()
    .sort((a, b) => (a.priority || 0) - (b.priority || 0))
    .map((member) => ({ member, location: locationFor(member, c, states) }));
  const groups = new Map();
  items.forEach((p) => {
    const k = p.location ? p.location.id : "unknown";
    if (!groups.has(k)) groups.set(k, []);
    groups.get(k).push(p);
  });
  groups.forEach((group) =>
    group.forEach((p, i) => {
      const step =
        group.length < 2 ? 0 : Math.min(c.separation, 80 / (group.length - 1));
      p.angle =
        (p.location ? p.location.angle : 90) +
        (i - (group.length - 1) / 2) * step;
      p.radius = c.collision === "stack" ? Math.max(0.5, 1 - i * 0.035) : 1;
    }),
  );
  return items;
}
export function backgroundFor(c, states, now = new Date()) {
  if (c.background_mode === "manual") return c.background;
  const weather = states[c.weather_entity];
  if (
    weather &&
    ["rainy", "pouring", "lightning-rainy", "snowy", "fog", "cloudy"].includes(
      weather.state,
    )
  )
    return weather.state === "snowy" ? "winter" : "rain";
  const sun = states[c.sun_entity];
  if (sun && sun.state === "below_horizon") return "night";
  const elevation = sun && Number((sun.attributes || {}).elevation);
  if (sun && Number.isFinite(elevation) && elevation < 10)
    return sun.attributes.rising ? "sunrise" : "sunset";
  if (c.seasonal) {
    let month = now.getMonth();
    if (c.hemisphere === "south") month = (month + 6) % 12;
    return [
      "winter",
      "winter",
      "spring",
      "spring",
      "spring",
      "summer",
      "summer",
      "summer",
      "autumn",
      "autumn",
      "autumn",
      "winter",
    ][month];
  }
  return sun
    ? "day"
    : now.getHours() < 6 || now.getHours() > 19
      ? "night"
      : "day";
}
export function exportConfig(c, personal = false) {
  const out = clone(c);
  if (!personal) {
    out.demo = false;
    out.title = "Our whereabouts";
    out.caption = "Magical Family Clock";
    out.center_image = "";
    out.face_image = "";
    out.background_images = {};
    out.weather_entity = "";
    out.sun_entity = "sun.sun";
    out.members = out.members.map((m, i) =>
      Object.assign({}, m, {
        id: "person-" + i,
        name: "Person " + (i + 1),
        nickname: "",
        entity: "",
        travelling_entity: "",
        attribute: "",
        portrait: "",
        overrides: {},
        metrics: [],
        rules: [],
      }),
    );
    out.locations = out.locations.map((l, i) =>
      Object.assign({}, l, {
        id: "location-" + i,
        name: "Location " + (i + 1),
        states: [],
        aliases: [],
        zone: "",
      }),
    );
    out.unknown_location = "";
    out.travelling_location = "";
  }
  return out;
}
export function importConfig(text) {
  if (text.length > 12000000) throw Error("Configuration too large.");
  return normalize(JSON.parse(text));
}
export function demo() {
  const c = defaults();
  c.title = "The Wayfarers";
  c.demo = true;
  c.members = ["Rowan", "Sage", "Robin", "Ash"].map((name, i) => ({
    id: "demo-" + i,
    name,
    entity: "sensor.mfc_demo_" + i,
    color: ["#e6bc65", "#c97caa", "#79b8a2", "#87aedd"][i],
  }));
  return normalize(c);
}
export function demoStates() {
  const states = {};
  for (let i = 0; i < 4; i++)
    states["sensor.mfc_demo_" + i] = { state: "home", attributes: {} };
  return states;
}
