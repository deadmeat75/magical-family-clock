import SunCalc from "suncalc";
import { finite, color } from "./design.js";
export const MOON_PHASES = [
  "new_moon",
  "waxing_crescent",
  "first_quarter",
  "waxing_gibbous",
  "full_moon",
  "waning_gibbous",
  "last_quarter",
  "waning_crescent",
];
export const CREATURES = [
  ["bird", "Swallow"],
  ["owl", "Owl"],
  ["witch", "Witch on a broom"],
  ["wizard", "Wizard on a broom"],
  ["dragon", "Dragon"],
  ["phoenix", "Phoenix"],
  ["fairy", "Pixie"],
  ["sea-monster", "Lake serpent"],
  ["mermaid", "Mermaid"],
  ["merman", "Merman"],
  ["sailboat", "Sailing boat"],
  ["unicorn", "Unicorn"],
  ["custom", "Custom image prop"],
];
const aquatic = ["sea-monster", "mermaid", "merman"];
const stationary = ["cottage", "mushrooms", "crystals", "unicorn", "custom"];
export function worldObject(kind = "bird", id = "world-bird") {
  return {
    id,
    kind,
    name: CREATURES.find((x) => x[0] === kind)?.[1] || kind,
    enabled: true,
    tint: false,
    behind_castle:
      !aquatic.includes(kind) &&
      !stationary.includes(kind) &&
      !["sailboat", "lantern"].includes(kind),
    x: kind === "unicorn" ? 41 : 50,
    y:
      kind === "fairy"
        ? 60
        : kind === "unicorn"
          ? 61
          : aquatic.includes(kind)
            ? 77
            : stationary.includes(kind)
              ? 66
              : kind === "sailboat"
                ? 85
                : kind === "lantern"
                  ? 40
                  : 20,
    scale: kind === "dragon" ? 1.2 : kind === "fairy" ? 0.65 : 1,
    color:
      {
        dragon: "#599b87",
        phoenix: "#f0a345",
        merman: "#53acb2",
        mermaid: "#58a796",
        "sea-monster": "#568374",
        wizard: "#536c9d",
        witch: "#826796",
        bird: "#283e4d",
        owl: "#a99578",
        sailboat: "#e5dcc2",
        lantern: "#efc477",
        cottage: "#b2a17b",
        mushrooms: "#927cc1",
        unicorn: "#b4a3c8",
        crystals: "#b0a1d6",
      }[kind] || "#b997d0",
    motion: aquatic.includes(kind)
      ? "surface"
      : stationary.includes(kind)
        ? kind === "unicorn"
          ? "idle"
          : "still"
        : ["sailboat", "lantern"].includes(kind)
          ? "drift"
          : "fly",
    interval: kind === "dragon" ? 70 : aquatic.includes(kind) ? 45 : 26,
    span: kind === "dragon" ? 115 : 80,
    period: kind === "owl" || kind === "lantern" ? "night" : "any",
    season: "any",
    weather: "any",
    facing: "right",
  };
}
export function normalizeWorld(c) {
  const incoming = c.world || {};
  c.world = {
    enabled: true,
    clouds: true,
    trees: true,
    seasonal_debris: true,
    water: true,
    waterfalls: true,
    windows: true,
    fireflies: true,
    stars: true,
    shooting_stars: true,
    quality: "rich",
    ...incoming,
  };
  const w = c.world;
  w.quality = ["rich", "balanced", "light"].includes(w.quality)
    ? w.quality
    : "rich";
  w.moon = {
    enabled: true,
    source: "auto",
    entity: "",
    attribute: "",
    format: "named",
    fallback: "calculated",
    manual: "full_moon",
    x: 74,
    y: 18,
    size: 14,
    show_in_daylight: false,
    ...incoming.moon,
  };
  const m = w.moon;
  m.source = ["auto", "entity", "calculated", "manual"].includes(m.source)
    ? m.source
    : "auto";
  m.entity = String(m.entity || "").slice(0, 150);
  m.attribute = String(m.attribute || "").slice(0, 100);
  m.format = ["named", "cycle", "cycle-percent", "age-days"].includes(m.format)
    ? m.format
    : "named";
  m.fallback = m.fallback === "hide" ? "hide" : "calculated";
  m.manual = MOON_PHASES.includes(m.manual) ? m.manual : "full_moon";
  m.x = finite(m.x, 74, 0, 100);
  m.y = finite(m.y, 18, 0, 100);
  m.size = finite(m.size, 14, 6, 32);
  w.objects = (
    Array.isArray(incoming.objects) ? incoming.objects : [worldObject()]
  )
    .slice(0, 32)
    .filter((o) => o && CREATURES.some(([k]) => k === o.kind))
    .map((o, i) => {
      const base = worldObject(o.kind, `world-${i}`),
        v = { ...base, ...o };
      v.id = String(v.id || base.id).slice(0, 100);
      v.name = String(v.name || base.name).slice(0, 80);
      v.enabled = v.enabled !== false;
      v.tint = v.tint === true;
      v.behind_castle =
        v.kind === "fairy" || v.kind === "unicorn"
          ? false
          : v.behind_castle === true;
      v.x = finite(v.x, base.x, 0, 100);
      v.y = finite(v.y, base.y, 0, 100);
      v.scale = finite(v.scale, 1, 0.25, 3);
      v.color = color(v.color, base.color);
      v.interval = finite(v.interval, base.interval, 8, 240);
      v.span = finite(v.span, base.span, 0, 180);
      v.motion = ["fly", "surface", "drift", "bob", "still", "idle"].includes(
        v.motion,
      )
        ? v.motion
        : base.motion;
      if (v.kind === "unicorn")
        v.motion = v.motion === "still" ? "still" : "idle";
      v.period = ["any", "day", "night", "dawn", "dusk"].includes(v.period)
        ? v.period
        : "any";
      v.season = ["any", "spring", "summer", "autumn", "winter"].includes(
        v.season,
      )
        ? v.season
        : "any";
      v.weather = String(v.weather || "any").slice(0, 30);
      v.facing = v.facing === "left" ? "left" : "right";
      return v;
    });
  return c;
}
function namedPhase(value) {
  const text = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[ -]/g, "_");
  const index = MOON_PHASES.indexOf(
    text === "third_quarter" ? "last_quarter" : text,
  );
  return index < 0 ? null : index / 8;
}
export function moonReading(world, states = {}, now = new Date()) {
  const m = world.moon;
  let phase = null,
    source = "",
    fallback = false;
  const read = (id) => {
    const e = states[id];
    if (!e) return null;
    const value = m.attribute ? e.attributes?.[m.attribute] : e.state;
    if (
      value == null ||
      typeof value === "object" ||
      ["unknown", "unavailable", ""].includes(String(value))
    )
      return null;
    if (m.format === "named") return namedPhase(value);
    if (!Number.isFinite(Number(value))) return null;
    const n = Number(value);
    return m.format === "age-days" && n >= 0 && n <= 29.53059
      ? n / 29.53059
      : m.format === "cycle-percent" && n >= 0 && n <= 100
        ? n / 100
        : m.format === "cycle" && n >= 0 && n <= 1
          ? n
          : null;
  };
  if (m.source === "manual") {
    phase = namedPhase(m.manual);
    source = "manual";
  } else if (m.source === "entity" || (m.source === "auto" && m.entity)) {
    phase = read(m.entity);
    source = m.entity;
  } else if (m.source === "auto") {
    const candidates = Object.keys(states)
      .filter(
        (id) =>
          id.startsWith("sensor.") &&
          (/moon/.test(id) ||
            /moon.phase/i.test(states[id]?.attributes?.friendly_name || "")),
      )
      .sort();
    const id = candidates.find((id) => read(id) != null);
    if (id) {
      phase = read(id);
      source = id;
    }
  }
  if (phase == null) {
    if (
      (m.source === "entity" || (m.source === "auto" && m.entity)) &&
      m.fallback === "hide"
    )
      return {
        visible: false,
        phase: null,
        source: m.entity,
        label: "Unavailable moon sensor",
      };
    phase = SunCalc.getMoonIllumination(now).phase;
    source = "calculated";
    fallback =
      m.source === "entity" || (m.source === "auto" && Boolean(m.entity));
  }
  const label = MOON_PHASES[Math.round(phase * 8) % 8];
  return {
    visible: m.enabled !== false,
    phase,
    source,
    fallback,
    label,
    illumination: (1 - Math.cos(phase * Math.PI * 2)) / 2,
  };
}
export function objectActive(object, scene, weather) {
  return (
    object.enabled !== false &&
    ["any", scene.period].includes(object.period) &&
    ["any", scene.season].includes(object.season) &&
    ["any", weather].includes(object.weather)
  );
}
export function worldPreset(name) {
  if (name === "quiet")
    return [
      worldObject("bird", "world-swallow"),
      worldObject("sailboat", "world-sailboat"),
    ];
  return [
    worldObject("bird", "world-swallow"),
    { ...worldObject("witch", "world-witch"), x: 46, y: 23, interval: 38 },
    { ...worldObject("dragon", "world-dragon"), y: 18, interval: 85 },
    {
      ...worldObject("sea-monster", "world-serpent"),
      x: 70,
      y: 79,
      interval: 46,
    },
    { ...worldObject("fairy", "world-pixie"), x: 34, y: 57, scale: 1.25 },
    {
      ...worldObject("unicorn", "world-unicorn"),
      x: 41,
      y: 61,
      scale: 0.85,
    },
  ];
}
