import { moonReading } from "./world-config.js";
export function astronomicalReading(
  config,
  states,
  now = new Date(),
  zone = "UTC",
) {
  let parts;
  try {
    parts = new Intl.DateTimeFormat("en-GB", {
      timeZone: zone,
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      hourCycle: "h23",
    }).formatToParts(now);
  } catch {
    return astronomicalReading(config, states, now, "UTC");
  }
  const value = Object.fromEntries(
    parts
      .filter((p) => p.type !== "literal")
      .map((p) => [p.type, Number(p.value)]),
  );
  const { year, month, day, hour, minute, second } = value;
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const dayOfYear =
    (Date.UTC(year, month - 1, day) - Date.UTC(year, 0, 1)) / 86400000;
  const daysInYear =
    (Date.UTC(year + 1, 0, 1) - Date.UTC(year, 0, 1)) / 86400000;
  const weekday = new Date(Date.UTC(year, month - 1, day)).getUTCDay();
  const moon = moonReading(config.world, states, now);
  return {
    ...value,
    daysInMonth,
    dayOfYear,
    daysInYear,
    weekday,
    moon,
    hourAngle: ((hour % 12) + minute / 60 + second / 3600) * 30,
    minuteAngle: (minute + second / 60) * 6,
    dayAngle: ((day - 1) / daysInMonth) * 360,
    yearAngle: ((dayOfYear + (hour + minute / 60) / 24) / daysInYear) * 360,
    weekdayAngle: (weekday / 7) * 360,
  };
}
