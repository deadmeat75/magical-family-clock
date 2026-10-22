import { skyPath } from "./world-paths.js";
import { frostMarkup, lightningMarkup } from "./weather-art.js";
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
export const weatherCSS = `
.weather{pointer-events:none}.weather .fall{animation:weather-fall var(--fall-duration,2s) linear infinite;animation-delay:var(--fall-delay,0s)}
.weather .snow{animation-name:weather-snow}.weather .wind-leaf{animation:weather-wind var(--fall-duration,9s) linear infinite;animation-delay:var(--fall-delay,0s)}
.weather .fog-bank{animation:fog-drift 24s ease-in-out infinite alternate;transform-origin:center}
.weather .frost-film{animation:frost-film 24s ease-out both}.weather .frost-crystal{stroke-dasharray:1;stroke-dashoffset:1;animation:frost-growth 18s ease-out forwards}
.weather .lightning-strike{opacity:0;animation:lightning-discharge 23s linear infinite}
.weather.still *,.still .weather *,.paused .weather *{animation-play-state:paused!important}
.weather.still .frost-crystal,.still .weather .frost-crystal{animation:none;stroke-dashoffset:0}
.weather.still .lightning-strike,.still .weather .lightning-strike{animation:none;opacity:0}
.weather.still .lightning-strike:first-of-type,.still .weather .lightning-strike:first-of-type{opacity:.65}
@keyframes weather-fall{from{transform:translate(20px,0)}to{transform:translate(-70px,440px)}}
@keyframes weather-snow{0%{transform:translate(12px,0)}25%{transform:translate(-2px,110px)}50%{transform:translate(8px,220px)}75%{transform:translate(-16px,330px)}100%{transform:translate(-9px,440px)}}
@keyframes weather-wind{from{transform:translate(-100px,12px) rotate(0deg)}50%{transform:translate(260px,-17px) rotate(35deg)}to{transform:translate(650px,8px) rotate(-25deg)}}
@keyframes fog-drift{from{transform:translate(-55px,3px)}to{transform:translate(65px,-5px)}}
@keyframes frost-film{from{opacity:0}to{opacity:1}}
@keyframes frost-growth{to{stroke-dashoffset:0}}
@keyframes lightning-discharge{0%,.12%{opacity:0}.3%{opacity:.95}1%{opacity:.7}1.65%{opacity:.18}1.9%{opacity:.55}2.5%,100%{opacity:0}}
@media(prefers-reduced-motion:reduce){.weather *{animation-play-state:paused!important}.weather .frost-crystal{animation:none;stroke-dashoffset:0}.weather .lightning-strike{animation:none;opacity:0}}
`;
export function weatherMarkup(kind, intensity = 1, night = false) {
  let out = `<defs><clipPath id="weather-sky"><path d="${skyPath()}"/></clipPath><linearGradient id="rain-streak" x1="0" y1="0" x2=".15" y2="1"><stop stop-color="#e5f7ff" stop-opacity="0"/><stop offset="1" stop-color="#edfaff" stop-opacity=".95"/></linearGradient></defs>`;
  const density = Math.max(0.2, Math.min(2, intensity)),
    count = Math.round(
      (kind === "rain" || kind === "lightning"
        ? 170
        : kind === "snow" || kind === "sleet"
          ? 130
          : 90) * density,
    );
  if (["light-rain", "rain", "snow", "sleet", "lightning"].includes(kind)) {
    for (let i = 0; i < count; i++) {
      const x = 110 + ((i * 137.508) % 410),
        y = 62 - (i % 4) * 3,
        snow = kind === "snow" || (kind === "sleet" && i % 2 === 0),
        duration = snow
          ? 7 + (i % 9) * 0.43
          : kind === "light-rain"
            ? 1.9 + (i % 5) * 0.13
            : 1.1 + (i % 5) * 0.09,
        style = `--fall-duration:${duration}s;--fall-delay:-${((i * 0.739) % duration).toFixed(3)}s`,
        near = i % 3 === 0;
      out += snow
        ? `<circle class="fall snow" cx="${x}" cy="${y}" r="${near ? 2.8 : 1.5}" fill="#f5fbff" stroke="#5d7e97" stroke-opacity=".55" stroke-width=".65" opacity="${near ? 0.94 : 0.68}" style="${style}"/>`
        : `<g class="fall rain" style="${style}" opacity="${near ? 0.9 : 0.62}"><path d="M${x} ${y}l-${kind === "light-rain" ? 2.1 : 3.7} ${kind === "light-rain" ? 11 : 19}" fill="none" stroke="#234e6c" stroke-width="${near ? 1.9 : 1.3}" stroke-opacity=".45"/><path d="M${x} ${y}l-${kind === "light-rain" ? 2.1 : 3.7} ${kind === "light-rain" ? 11 : 19}" fill="none" stroke="#edf8ff" stroke-width="${near ? 1.1 : 0.7}" stroke-linecap="round"/></g>`;
    }
  }
  if (kind === "fog") {
    out += `<defs><filter id="fog-wisps" x="-25%" y="-60%" width="150%" height="220%"><feTurbulence type="fractalNoise" baseFrequency=".008 .025" numOctaves="2" seed="13" result="noise"/><feDisplacementMap in="SourceGraphic" in2="noise" scale="36"/><feGaussianBlur stdDeviation="7"/></filter><radialGradient id="fog-density"><stop stop-color="#e3edf0" stop-opacity=".55"/><stop offset=".55" stop-color="#d9e5e9" stop-opacity=".3"/><stop offset="1" stop-color="#d9e5e9" stop-opacity="0"/></radialGradient></defs>`;
    for (let i = 0; i < 3; i++)
      out += `<path class="fog-bank" d="M30 ${285 + i * 47}Q155 ${230 + i * 45} 285 ${282 + i * 44}T560 ${274 + i * 46}L590 ${345 + i * 47}Q300 ${400 + i * 20} 30 ${345 + i * 47}Z" fill="url(#fog-density)" filter="url(#fog-wisps)" style="animation-delay:-${i * 9}s;animation-duration:${23 + i * 5}s"/>`;
  }
  if (kind === "wind")
    for (let i = 0; i < 26; i++)
      out += `<g transform="translate(0 ${140 + ((i * 47) % 300)})"><g class="wind-leaf" style="--fall-duration:${13 + (i % 9)}s;--fall-delay:-${i * 0.83}s"><path d="M0 0q4 -5 9 -1q-3 6 -9 1" fill="${i % 2 ? "#ba9a53" : "#69884b"}" opacity=".9"/></g></g>`;
  if (kind === "ice") out += frostMarkup(density);
  if (kind === "lightning") out += lightningMarkup("near");
  if (kind === "clear" && !night)
    out +=
      '<defs><radialGradient id="weather-sun-glow"><stop stop-color="#fff1aa" stop-opacity=".08"/><stop offset="1" stop-color="#fff1aa" stop-opacity="0"/></radialGradient></defs><circle cx="405" cy="150" r="70" fill="url(#weather-sun-glow)"/>';
  return out;
}
