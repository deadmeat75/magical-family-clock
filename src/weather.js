export const WEATHER = [
  "auto",
  "clear",
  "clouds",
  "light-rain",
  "rain",
  "snow",
  "sleet",
  "wind",
  "fog",
  "ice",
  "lightning",
];
export function weatherFor(config, states) {
  if (
    WEATHER.includes(config.weather_effect) &&
    config.weather_effect !== "auto"
  )
    return config.weather_effect;
  const weather = states[config.weather_entity];
  return (
    {
      sunny: "clear",
      "clear-night": "clear",
      partlycloudy: "clouds",
      cloudy: "clouds",
      rainy: "light-rain",
      pouring: "rain",
      snowy: "snow",
      "snowy-rainy": "sleet",
      windy: "wind",
      "windy-variant": "wind",
      fog: "fog",
      hail: "ice",
      lightning: "lightning",
      "lightning-rainy": "lightning",
    }[weather?.state] || "clear"
  );
}
export const weatherCSS = `.weather{pointer-events:none}.weather .fall{animation:weather-fall 2s linear infinite}.weather .snow{animation-duration:9s}.weather .drift{animation:weather-drift 18s ease-in-out infinite alternate}.weather .flash{animation:weather-flash 12s infinite;opacity:.12}.weather.still *,.still .weather *,.paused .weather *{animation-play-state:paused!important}.weather.still .flash,.still .weather .flash{animation:none!important;opacity:.15}@media(prefers-reduced-motion:reduce){.weather *{animation:none!important}.weather .flash{opacity:.15}}@keyframes weather-fall{to{transform:translate(-30px,130px)}}@keyframes weather-drift{to{transform:translate(70px,10px)}}@keyframes weather-flash{0%,94%,97%,100%{opacity:.05}95%,98%{opacity:.7}}`;
export function weatherMarkup(kind, intensity = 1, night = false) {
  let out = "";
  const count = Math.round(35 * Math.max(0.2, Math.min(2, intensity)));
  if (
    ["light-rain", "rain", "snow", "sleet", "ice", "lightning"].includes(kind)
  ) {
    for (let i = 0; i < count; i++) {
      const x = 75 + ((i * 137) % 450),
        y = 25 + ((i * 79) % 500),
        snow = kind === "snow" || (kind === "sleet" && i % 2 === 0);
      out += snow
        ? `<circle class="fall snow" cx="${x}" cy="${y}" r="${1 + (i % 3)}" fill="#f2f8ff" opacity=".8" style="animation-delay:-${i % 9}s"/>`
        : `<path class="fall" d="M${x} ${y}l-4 ${kind === "light-rain" ? 9 : 20}" stroke="#d2eafa" stroke-width="${kind === "ice" ? 3 : 1.3}" opacity=".65" style="animation-delay:-${(i % 7) / 3}s;animation-duration:${kind === "light-rain" ? 2.8 : 1.1}s"/>`;
    }
  }
  if (["clouds", "fog", "wind", "rain", "lightning"].includes(kind)) {
    for (let i = 0; i < (kind === "fog" ? 5 : 3); i++)
      out += `<ellipse class="drift" cx="${100 + i * 120}" cy="${kind === "fog" ? 250 + i * 45 : 110 + i * 35}" rx="135" ry="${kind === "fog" ? 36 : 30}" fill="#b9c8d1" opacity="${kind === "fog" ? 0.16 : 0.15}" style="animation-delay:-${i * 4}s"/>`;
  }
  if (kind === "wind")
    for (let i = 0; i < 8; i++)
      out += `<path class="drift" d="M${80 + i * 33} ${170 + i * 38}q60 -20 130 0" fill="none" stroke="#e2d8ae" opacity=".5"/>`;
  if (kind === "ice")
    out +=
      '<circle cx="300" cy="282" r="185" fill="none" stroke="#d9efff" stroke-width="17" stroke-dasharray="15 5 45 9" opacity=".55"/>';
  if (kind === "lightning")
    out +=
      '<path class="flash" d="M365 90L310 230H345L290 350L320 205H290Z" fill="#f9f2d6"/>';
  if (kind === "clear")
    out = '<circle cx="405" cy="150" r="26" fill="#fff1aa" opacity=".25"/>';
  return out;
}
