import artwork from "./assets/astronomical-dial.png";
import { astronomicalReading } from "./astronomical-model.js";
import { sceneFor } from "./scenes.js";
import { weatherFor } from "./weather.js";
import { renderMoons } from "./lunar.js";
import { renderBezelArtwork } from "./bezel-art.js";
import {
  periodPicture,
  seasonPicture,
  weatherPicture,
} from "./astronomical-pictures.js";
const periods = ["dawn", "day", "dusk", "night"],
  seasons = ["spring", "summer", "autumn", "winter"];
const weather = [
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
const discs = [
  ["period", 247, 212, 82, "DAY / NIGHT", periods],
  [
    "moon",
    391,
    212,
    46,
    "MOON PHASE",
    Array.from({ length: 8 }, (_, i) => i / 8),
  ],
  ["season", 213, 377, 60, "SEASON", seasons],
  ["weather", 376, 365, 79, "WEATHER", weather],
];
function discMarkup([name, x, y, r, label, values]) {
  const travel = r * Math.max(2.5, 1.06 / Math.sin(Math.PI / values.length)),
    id = "astro-" + name;
  const pictures = values
    .map((value, i) => {
      const picture =
        name === "moon"
          ? `<rect x="-50" y="-50" width="100" height="100" fill="#14293a"/><image data-lunar-phase="${value}" data-moon-cell="${i}" x="-39" y="-39" width="78" height="78"/>`
          : name === "period"
            ? periodPicture(value, id + i)
            : name === "season"
              ? seasonPicture(value)
              : weatherPicture(value, id + i);
      return `<g transform="rotate(${(i * 360) / values.length})"><defs><clipPath id="${id}-picture-${i}"><circle cx="0" cy="${-travel}" r="${r}"/></clipPath></defs><g clip-path="url(#${id}-picture-${i})"><svg x="${-r}" y="${-travel - r}" width="${r * 2}" height="${r * 2}" viewBox="-50 -50 100 100" overflow="hidden">${picture}</svg></g></g>`;
    })
    .join("");
  let plate = `<circle r="${travel + r}" fill="#173042"/>`;
  for (let i = 0; i < 85; i++) {
    const a = i * 2.399,
      d = (travel + r) * Math.sqrt((i + 0.5) / 85);
    plate += `<circle cx="${Math.cos(a) * d}" cy="${Math.sin(a) * d}" r="${r * 0.006}" fill="#d7b779" opacity=".65"/>`;
  }
  return `<g class="astronomical-disc" data-disc-kind="${name}"><title>${label}</title><defs><clipPath id="${id}-aperture"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath></defs><circle cx="${x}" cy="${y}" r="${r + 7}" fill="#9a7339" stroke="#f5d494" stroke-width="1.5"/><g clip-path="url(#${id}-aperture)"><circle cx="${x}" cy="${y}" r="${r}" fill="#14293a"/><g transform="translate(${x} ${y + travel})"><g class="astro-disc-rotor" data-rotor="${name}" data-count="${values.length}">${plate}${pictures}</g></g></g><image class="astro-aperture-frame" x="${x - r - 10}" y="${y - r - 10}" width="${(r + 10) * 2}" height="${(r + 10) * 2}" data-radius="${r + 5}"/><rect x="${x - r * 0.94}" y="${y + r * 0.54}" width="${r * 1.88}" height="${r * 0.47}" rx="4" fill="#142734" stroke="#cfab63" stroke-width=".7"/><text x="${x}" y="${y + r * 0.7}" text-anchor="middle" fill="#cfb776" font-size="${r < 50 ? 5.9 : 7}" font-family="Georgia,serif">${label}</text><text data-reading="${name}" x="${x}" y="${y + r * 0.9}" text-anchor="middle" fill="#fff0c8" font-size="${r < 50 ? 5.8 : 9}" font-family="Georgia,serif"/></g>`;
}
export function astronomicalFace() {
  let stars = "";
  for (let i = 0; i < 110; i++) {
    const a = i * 2.399,
      r = 175 * Math.sqrt((i + 0.5) / 110),
      x = 300 + Math.cos(a) * r,
      y = 290 + Math.sin(a) * r;
    stars += `<circle cx="${x}" cy="${y}" r="${i % 9 === 0 ? 0.8 : 0.35}" fill="#d9b977" opacity="${0.25 + (i % 5) * 0.1}"/>`;
  }
  return `<g class="astronomical-face"><style>.astro-disc-rotor{transform-origin:0px 0px;transition:transform 1.8s cubic-bezier(.4,0,.2,1)}@media(prefers-reduced-motion:reduce){.astro-disc-rotor{transition:none!important}}</style><image href="${artwork}" width="600" height="600"/><ellipse cx="300" cy="290" rx="184" ry="184" fill="#102534" stroke="#c6a15e" stroke-width="2"/>${stars}${discs.map(discMarkup).join("")}</g>`;
}
function rotateTo(node, index, config) {
  const count = Number(node.dataset.count),
    previous = Number(node.dataset.index ?? index);
  let delta = index - (((previous % count) + count) % count);
  if (delta > count / 2) delta -= count;
  if (delta < -count / 2) delta += count;
  const next = previous + delta;
  node.style.transition =
    !node.hasAttribute("data-index") ||
    config.reduced_motion ||
    !config.scene_motion
      ? "none"
      : "";
  node.style.transform = `rotate(${(-next * 360) / count}deg)`;
  node.dataset.index = next;
}
export function updateAstronomical(
  root,
  config,
  states,
  now = new Date(),
  zone,
  context = {},
) {
  if (!root.querySelector(".astronomical-face")) return;
  const reading = astronomicalReading(config, states, now, zone);
  const scene = sceneFor(config, states, now, { ...context, time_zone: zone });
  if (
    !states[config.sun_entity] &&
    !(
      Number.isFinite(context.latitude) && Number.isFinite(context.longitude)
    ) &&
    !periods.includes(config.period_override)
  )
    scene.period =
      reading.hour < 6 || reading.hour >= 20
        ? "night"
        : reading.hour < 8
          ? "dawn"
          : reading.hour >= 18
            ? "dusk"
            : "day";
  const moon = reading.moon,
    phase = moon.visible ? moon.phase : null,
    moonIndex = phase == null ? 0 : Math.round(phase * 8) % 8;
  const kind = weatherFor(config, states);
  const values = {
    period: [periods.indexOf(scene.period), scene.period],
    season: [seasons.indexOf(scene.season), scene.season],
    weather: [weather.indexOf(kind), kind.replaceAll("-", " ")],
    moon: [
      moonIndex,
      phase == null ? "Unavailable" : moon.label.replaceAll("_", " "),
    ],
  };
  for (const [key, [index, label]] of Object.entries(values)) {
    rotateTo(root.querySelector(`[data-rotor="${key}"]`), index, config);
    root.querySelector(`[data-reading="${key}"]`).textContent =
      label.toUpperCase();
  }
  const moonDisc = root.querySelector('[data-disc-kind="moon"]');
  moonDisc.dataset.source = moon.source;
  for (const image of moonDisc.querySelectorAll("image[data-lunar-phase]")) {
    image.style.visibility = phase == null ? "hidden" : "visible";
    const cell = Number(image.dataset.moonCell);
    image.dataset.lunarPhase =
      cell === moonIndex && phase != null ? phase : cell / 8;
  }
  const frames = [...root.querySelectorAll(".astro-aperture-frame")].filter(
    (n) => !n.dataset.materialReady && !n.dataset.loading,
  );
  return Promise.all([
    renderMoons(root),
    ...frames.map(async (n) => {
      n.dataset.loading = "true";
      await renderBezelArtwork(n, "aged-brass", 10, Number(n.dataset.radius));
    }),
  ]);
}
