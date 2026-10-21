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
