import { metricText } from "./data.js";
export function bezelText(item, states, now = new Date(), locale, zone) {
  let value = "";
  try {
    if (item.kind === "time")
      value = new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
        ...(item.seconds ? { second: "2-digit" } : {}),
        ...(zone ? { timeZone: zone } : {}),
      }).format(now);
    else if (item.kind === "date")
      value = new Intl.DateTimeFormat(locale, {
        month: "short",
        day: "numeric",
        ...(zone ? { timeZone: zone } : {}),
      }).format(now);
    else if (item.kind === "text") value = item.text || "";
    else value = metricText({ ...item, label: "" }, states);
  } catch {
    value = "";
  }
  if (!value) value = item.fallback ?? "—";
  return [item.icon, item.label, value].filter(Boolean).join(" ");
}

// Allocate each readout the arc between its neighbours; bottom text reads upright.
export function bezelArc(item, items, radius, width, material = "aged-brass") {
  const normalize = (a) => ((a % 360) + 360) % 360;
  const angle = normalize(item.angle);
  let half = 85;
  for (const other of items) {
    if (other === item) continue;
    const difference = Math.abs(normalize(other.angle) - angle);
    half = Math.min(half, Math.min(difference, 360 - difference) / 2 - 3);
  }
  half = Math.max(1, half);
  const lower = Math.sin((angle * Math.PI) / 180) > 0.15;
  const size = Math.min(item.size, Math.max(6, width * 0.5));
  // The baseline must account for the full capital height, not just the arc.
  // Silver/wood keep their approved baselines and need a little more
  // outward clearance from their inner carved border.
  const r =
    radius +
    (lower
      ? -size * 0.3 +
        (material === "aged-brass" || material === "brass" ? 0 : width * 0.065)
      : -size * 0.65) +
    (material === "aged-brass" || material === "brass"
      ? lower
        ? 1.5
        : -1.5
      : 0);
  const point = (a) =>
    `${300 + r * Math.cos((a * Math.PI) / 180)} ${300 + r * Math.sin((a * Math.PI) / 180)}`;
  return {
    path: `M${point(angle + (lower ? half : -half))}A${r} ${r} 0 0 ${lower ? 0 : 1} ${point(angle + (lower ? -half : half))}`,
    length: ((2 * half * Math.PI) / 180) * r,
    size,
  };
}
