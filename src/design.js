export const FONTS = [
  "Pirata One, Georgia, serif",
  "Georgia, serif",
  "Palatino, serif",
  "Garamond, serif",
  "Baskerville, serif",
  "Courier New, monospace",
  "Trebuchet MS, sans-serif",
  "Verdana, sans-serif",
  "system-ui, sans-serif",
  "cursive",
];
export const HAND_STYLES = [
  "theme",
  "spoon",
  "classic",
  "legacy-curved",
  "standalone-pointed",
  "arrow",
  "leaf",
  "sword",
  "cathedral",
  "filigree",
  "skeleton",
  "quill",
  "compass",
];
export const MATERIALS = [
  "color",
  "brass",
  "aged-brass",
  "copper",
  "silver",
  "steel",
  "wood",
  "ivory",
  "obsidian",
  "glass",
];
export const finite = (value, fallback, min, max) =>
  value !== null &&
  value !== undefined &&
  value !== "" &&
  Number.isFinite(Number(value))
    ? Math.max(min, Math.min(max, Number(value)))
    : fallback;
export const color = (value, fallback = "") =>
  /^#[\da-f]{6}$/i.test(String(value)) ? value : fallback;
export function effectDefaults() {
  return Object.fromEntries(
    ["face", "frame", "hands", "portraits", "bezel"].map((target) => [
      target,
      {
        shadow: target === "hands" ? 0.55 : 0.25,
        bevel: 0.5,
        reflection: target === "hands" ? 0.35 : 0.1,
        glare: 0,
        patina: 0.15,
        wear: 0.15,
      },
    ]),
  );
}
export function normalizeDesign(c) {
  for (const kind of ["title", "caption"]) {
    c[kind] = String(c[kind] ?? "").slice(0, 150);
    c[kind + "_x"] = finite(c[kind + "_x"], 50, 5, 95);
    c[kind + "_y"] = finite(c[kind + "_y"], null, 5, 95);
    c[kind + "_size"] = finite(
      c[kind + "_size"],
      kind === "title" ? 23 : 12,
      6,
      48,
    );
    c[kind + "_opacity"] = finite(c[kind + "_opacity"], 1, 0, 1);
    c[kind + "_color"] = color(c[kind + "_color"]);
    c[kind + "_font"] = String(c[kind + "_font"] || c.font);
  }
  c.scene_motion = c.scene_motion !== false;
  c.scene_intensity = finite(c.scene_intensity, 0.65, 0, 1);
  c.motion_speed = finite(c.motion_speed, 1, 0.25, 3);
  const effects = effectDefaults();
  for (const target of Object.keys(effects))
    for (const key of Object.keys(effects[target]))
      effects[target][key] = finite(
        c.effects?.[target]?.[key],
        effects[target][key],
        0,
        1,
      );
  c.effects = effects;
  c.bezel = {
    enabled: false,
    width: 32,
    material: "brass",
    color: "#b58b4b",
    items: [],
    ...c.bezel,
  };
  c.bezel.width = finite(c.bezel.width, 32, 18, 70);
  c.bezel.color = color(c.bezel.color, "#b58b4b");
  if (!MATERIALS.includes(c.bezel.material)) c.bezel.material = "brass";
  c.bezel.items = (Array.isArray(c.bezel.items) ? c.bezel.items : [])
    .slice(0, 16)
    .map((x, i) => ({
      ...x,
      id: String(x.id || "readout-" + i),
      kind: ["sensor", "time", "date", "text"].includes(x.kind)
        ? x.kind
        : "sensor",
      angle: finite(x.angle, -90 + i * 45, -360, 360),
      size: finite(x.size, 11, 7, 24),
      opacity: finite(x.opacity, 1, 0, 1),
      color: color(x.color, "#f7e9c4"),
      font: String(x.font || "system-ui, sans-serif"),
      label: String(x.label || "").slice(0, 40),
      text: String(x.text || "").slice(0, 80),
      icon: String(x.icon || "").slice(0, 8),
      fallback: String(x.fallback ?? "—").slice(0, 40),
    }));
  c.carousel = {
    enabled: false,
    remember: true,
    auto: false,
    interval: 30,
    transition: 500,
    templates: [],
    ...c.carousel,
  };
  c.carousel.interval = finite(c.carousel.interval, 30, 10, 3600);
  c.carousel.transition = finite(c.carousel.transition, 500, 0, 3000);
  c.carousel.templates = (
    Array.isArray(c.carousel.templates) ? c.carousel.templates : []
  )
    .slice(0, 12)
    .map((x, i) => ({
      ...x,
      id: String(x.id || "template-" + i),
      label: String(x.label || "Face " + (i + 1)).slice(0, 80),
    }));
  return c;
}
export function handName(member) {
  return member.hand_label !== undefined
    ? String(member.hand_label)
    : member.nickname || member.name || "";
}
export function locationName(location, states) {
  if (location.label_mode !== "sensor") return location.name;
  const entity = states[location.label_entity];
  const value = location.label_attribute
    ? entity?.attributes?.[location.label_attribute]
    : entity?.state;
  return value == null ||
    typeof value === "object" ||
    ["unknown", "unavailable", ""].includes(String(value))
    ? (location.label_fallback ?? location.name)
    : String(value).slice(0, 80);
}
export function labelPosition(location) {
  const a = (location.angle * Math.PI) / 180,
    r = location.radius ?? 213;
  return {
    x: location.x == null ? 300 + Math.cos(a) * r : location.x * 6,
    y: location.y == null ? 300 + Math.sin(a) * r : location.y * 6,
  };
}
const TEMPLATE_KEYS = [
  "theme",
  "artwork",
  "face_image",
  "center_image",
  "hand_design",
  "colors",
  "background_opacity",
  "brightness",
  "pivot_x",
  "pivot_y",
  "title_x",
  "title_y",
  "caption_x",
  "caption_y",
  "effects",
];
export function presentationFor(base, index) {
  const template = base.carousel?.enabled
    ? base.carousel.templates[index]
    : null;
  if (!template) return base;
  const result = { ...base };
  for (const key of TEMPLATE_KEYS)
    if (template[key] !== undefined) result[key] = template[key];
  if (template.hand_design) result.template_hand_design = template.hand_design;
  // A face template controls presentation only. Sensors, people, matching and bezel readings always come from the clock.
  return result;
}
export function textPosition(c, kind) {
  const castle = c.artwork === "castle" && !c.face_image;
  return {
    x: c[kind + "_x"] * 6,
    y:
      c[kind + "_y"] == null
        ? castle
          ? kind === "title"
            ? 146
            : 170
          : kind === "title"
            ? 410
            : 380
        : c[kind + "_y"] * 6,
  };
}
