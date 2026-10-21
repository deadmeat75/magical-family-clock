import SunCalc from "suncalc";
export const SEASONS = ["spring", "summer", "autumn", "winter"];
export const PERIODS = ["dawn", "day", "dusk", "night"];
const WINDOW = 30 * 60 * 1000;
const validTime = (value) => {
  const time = new Date(value).getTime();
  return Number.isFinite(time) ? time : null;
};
export function seasonFor(config, now, zone) {
  if (SEASONS.includes(config.season_override)) return config.season_override;
  let month = now.getUTCMonth();
  try {
    if (zone)
      month =
        Number(
          new Intl.DateTimeFormat("en", {
            month: "numeric",
            timeZone: zone,
          }).format(now),
        ) - 1;
  } catch (error) {
    /* Stable UTC fallback for invalid/missing zones. */
  }
  if (config.hemisphere === "south") month = (month + 6) % 12;
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
export function periodFor(config, states, now, context = {}, history = []) {
  if (PERIODS.includes(config.period_override)) return config.period_override;
  const sun = states[config.sun_entity];
  const attrs = (sun || {}).attributes || {};
  for (const [key, kind] of [
    ["next_rising", "rise"],
    ["next_setting", "set"],
  ]) {
    const time = validTime(attrs[key]);
    if (
      time !== null &&
      !history.some((e) => e.time === time && e.kind === kind)
    )
      history.push({ time, kind, trusted: true });
  }
  const time = now.getTime();
  for (let i = history.length - 1; i >= 0; i--)
    if (Math.abs(history[i].time - time) > 3 * 86400000) history.splice(i, 1);
  const events = history.slice();
  if (Number.isFinite(context.latitude) && Number.isFinite(context.longitude)) {
    for (let day = -1; day <= 1; day++) {
      const times = SunCalc.getTimes(
        new Date(time + day * 86400000),
        context.latitude,
        context.longitude,
      );
      for (const [key, kind] of [
        ["sunrise", "rise"],
        ["sunset", "set"],
      ]) {
        const t = times[key].getTime();
        if (
          Number.isFinite(t) &&
          !events.some(
            (e) => e.kind === kind && Math.abs(e.time - t) < 5 * 60000,
          )
        )
          events.push({ time: t, kind });
      }
    }
  }
  const near = events
    .filter((e) => Math.abs(e.time - time) <= WINDOW)
    .sort(
      (a, b) =>
        Number(!!b.trusted) - Number(!!a.trusted) ||
        Math.abs(a.time - time) - Math.abs(b.time - time),
    )[0];
  if (near) return near.kind === "rise" ? "dawn" : "dusk";
  if (sun && ["above_horizon", "below_horizon"].includes(sun.state))
    return sun.state === "above_horizon" ? "day" : "night";
  // When no entity exists, use calculated bracketing solar events if possible.
  const preceding = events
    .filter((e) => e.time <= time)
    .sort((a, b) => b.time - a.time)[0];
  if (preceding) return preceding.kind === "rise" ? "day" : "night";
  return "day";
}
export function sceneFor(
  config,
  states,
  now = new Date(),
  context = {},
  history = [],
) {
  const season = seasonFor(config, now, context.time_zone);
  const period = periodFor(config, states, now, context, history);
  return {
    key: season + "-" + period,
    season,
    period,
    row: SEASONS.indexOf(season),
    column: PERIODS.indexOf(period),
  };
}
