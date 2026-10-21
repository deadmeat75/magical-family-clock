export function sourceValue(source, states, fallbackEntity = "") {
  const entity = states[source.entity || fallbackEntity];
  return entity
    ? source.attribute
      ? entity.attributes?.[source.attribute]
      : entity.state
    : undefined;
}
export function matchesRule(rule, states, entity) {
  const value = sourceValue(rule, states, entity);
  if (value == null || ["unknown", "unavailable"].includes(String(value)))
    return false;
  const expected = String(rule.value ?? "");
  if (
    ["above", "below"].includes(rule.operator) &&
    (!expected.trim() || !Number.isFinite(Number(expected)))
  )
    return false;
  switch (rule.operator) {
    case "above":
      return Number.isFinite(Number(value)) && Number(value) > Number(expected);
    case "below":
      return Number.isFinite(Number(value)) && Number(value) < Number(expected);
    case "contains":
      return String(value).toLowerCase().includes(expected.toLowerCase());
    default:
      return String(value).toLowerCase() === expected.toLowerCase();
  }
}
export function metricText(metric, states, entity) {
  const value = sourceValue(metric, states, entity);
  if (value == null || ["unknown", "unavailable", ""].includes(String(value)))
    return "";
  const numeric = typeof value !== "object" && Number.isFinite(Number(value));
  const text =
    numeric && metric.decimals !== "" && metric.decimals != null
      ? Number(value).toFixed(
          Math.max(0, Math.min(3, Number(metric.decimals) || 0)),
        )
      : typeof value === "object"
        ? ""
        : String(value).slice(0, 60);
  if (!text) return "";
  const unit =
    metric.unit ??
    states[metric.entity || entity]?.attributes?.unit_of_measurement ??
    "";
  return `${metric.label ? metric.label + ": " : ""}${text}${unit ? " " + unit : ""}`;
}
export function discoveredLocations(config, states) {
  const names = new Set();
  Object.entries(states)
    .filter(([id]) => id.startsWith("zone."))
    .sort(([a], [b]) => a.localeCompare(b))
    .forEach(([, s]) => {
      if (s.attributes?.friendly_name) names.add(s.attributes.friendly_name);
    });
  config.members.forEach((m) => {
    const value = sourceValue(m, states);
    if (
      value != null &&
      !["unknown", "unavailable", "not_home", ""].includes(String(value))
    )
      names.add(String(value));
  });
  const existing = new Set(
    config.locations
      .flatMap((l) => [l.name, ...l.states, ...l.aliases])
      .map((s) => s.toLowerCase()),
  );
  return [...names]
    .filter((n) => !existing.has(n.toLowerCase()))
    .slice(0, 24)
    .map((name) => ({
      id: "dynamic-" + encodeURIComponent(name),
      name,
      states: [name],
      aliases: [],
    }));
}
export function runtimeConfig(config, states) {
  if (!config.dynamic_locations) return config;
  const extra = discoveredLocations(config, states);
  if (!extra.length) return config;
  const locations = [...config.locations, ...extra].map((l, i, all) => ({
    ...l,
    angle: -90 + (i * 360) / all.length,
  }));
  return { ...config, locations };
}
