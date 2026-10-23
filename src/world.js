import { paintedCSS } from "./painted-creatures.js";
import { lightningMarkup } from "./weather-art.js";
import { sceneSource, imageGrade, sceneSkyColors } from "./artwork.js";
import { moonReading, objectActive } from "./world-config.js";
import { inhabitantArt, creatureDefs } from "./world-art.js";
import { escapeXML } from "./panels.js";
import { skyPath, lakePath, flightKeyframes } from "./world-paths.js";
export const worldCSS =
  paintedCSS +
  `
.scene-motion.world-live{opacity:1;pointer-events:none}.world-photo{pointer-events:none}.world-live .scene-cloud,.world-live .water-ripple{animation:none;transform:none}.world-paint{width:100%;height:100%;display:block}.world-encounter{animation-duration:calc(var(--encounter-seconds,30s) / var(--motion-speed,1));animation-timing-function:linear;animation-iteration-count:infinite;animation-delay:var(--encounter-delay,0s);opacity:1}.world-encounter.surface{animation-name:creature-surface;animation-timing-function:cubic-bezier(.4,0,.25,1)}.world-encounter.drift{animation-name:creature-drift;animation-timing-function:ease-in-out}.world-encounter.bob{animation-name:creature-bob;animation-timing-function:ease-in-out}.creature-wing{transform-box:view-box;transform-origin:0px -2px;animation:creature-wings calc(var(--wing-cycle,7s) / var(--motion-speed,1)) linear infinite}.far-wing{animation-delay:-.08s}.world-object[data-kind="owl"]{--wing-cycle:9s}.world-object[data-kind="fairy"] .creature-wing{animation:fairy-flutter .18s ease-in-out infinite alternate}.dragon-tail{transform-origin:-18px 5px;animation:dragon-tail-sway 5.3s ease-in-out infinite alternate}.mer-tail{transform-origin:0px -8px;animation:tail-swim 3.7s ease-in-out infinite alternate}.dragon-near-wing,.dragon-far-wing{--wing-cycle:12s}.rider-cloak,.phoenix-tail{animation:cloth-wave 4.7s ease-in-out infinite alternate;transform-origin:0px 0px}.creature-glow{animation:star-twinkle 4.3s ease-in-out infinite alternate}.chimney-smoke{animation:world-smoke 6.5s linear infinite}.water-encounter-rings{transform-box:fill-box;transform-origin:center;animation:encounter-rings var(--encounter-seconds,40s) linear infinite;animation-delay:var(--encounter-delay,0s)}.world-encounter.still *{animation:none!important}.world-night .world-object{filter:brightness(.72) saturate(.85)}.world-surface .world-encounter.surface{transform:translateY(110px)}.scene-off .world-live *:not(.lightning-strike){animation-play-state:paused!important}.scene-off .world-encounter,.still .world-encounter{opacity:1!important;transform:none!important}.still .world-meteors,.scene-off .world-meteors{display:none}
@keyframes star-twinkle{from{opacity:.22}to{opacity:1}}@keyframes creature-surface{0%,8%{transform:translateY(110px)}30%,48%{transform:translateY(0)}72%,100%{transform:translateY(110px)}}@keyframes creature-drift{0%,100%{transform:translate(-4px,.5px) rotate(-.35deg)}47%{transform:translate(4px,-.4px) rotate(.4deg)}}@keyframes creature-bob{0%,100%{transform:translateY(.8px) rotate(-.4deg)}43%{transform:translateY(-.6px) rotate(.3deg)}}@keyframes creature-wings{0%,14%,31%,72%,100%{transform:scaleY(.95) rotate(0deg)}4%,21%,79%,92%{transform:scaleY(.22) rotate(-10deg)}8%,25%,84%,96%{transform:scaleY(1) rotate(3deg)}38%,64%{transform:scaleY(.87) rotate(-2deg)}}@keyframes dragon-tail-sway{from{transform:skewY(-2deg)}to{transform:skewY(2deg)}}@keyframes fairy-flutter{from{transform:scaleX(.35)}to{transform:scaleX(1)}}@keyframes tail-swim{from{transform:skewX(-3deg)}to{transform:skewX(3deg)}}@keyframes cloth-wave{0%{transform:skewY(-1deg)}35%{transform:skewY(2deg)}72%{transform:skewY(.4deg)}100%{transform:skewY(3deg)}}@keyframes world-smoke{0%{opacity:0;transform:translateY(3px)}25%{opacity:.28}100%{opacity:0;transform:translate(5px,-8px)}}@keyframes encounter-rings{0%,12%,70%,100%{opacity:0;transform:scale(.5,.6)}28%{opacity:.2;transform:scale(.85,.8)}47%{opacity:.12;transform:scale(1.2,1.1)}62%{opacity:0;transform:scale(1.5,1.2)}}
@media(prefers-reduced-motion:reduce){.world-live *{animation-play-state:paused!important}.world-encounter{opacity:1!important;transform:none!important}.world-meteors{display:none}}
`;
export function litMoonPath(phase, r = 14) {
  const c = Math.cos(phase * Math.PI * 2),
    waxing = phase <= 0.5,
    side = waxing ? 1 : -1,
    points = [];
  for (let i = 0; i <= 40; i++) {
    const y = -r + (2 * r * i) / 40,
      x = Math.sqrt(Math.max(0, r * r - y * y));
    points.push([side * x, y]);
  }
  for (let i = 40; i >= 0; i--) {
    const y = -r + (2 * r * i) / 40,
      x = Math.sqrt(Math.max(0, r * r - y * y));
    points.push([side * c * x, y]);
  }
  return (
    points
      .map((p, i) => (i ? "L" : "M") + p.map((n) => n.toFixed(3)).join(" "))
      .join("") + "Z"
  );
}
function moonPlacement(world, opening) {
  const m = world.moon,
    r = m.size,
    dx = 108 + m.x * 3.84 - 300,
    dy = 90 + m.y * 3.84 - 282,
    factor = Math.min(1, (opening - r - 6) / (Math.hypot(dx, dy) || 1)),
    x = 300 + dx * factor,
    y = 282 + dy * factor,
    point = { x, y, r };
  return point;
}
function moonMarkup(world, reading, opening = 180) {
  if (!reading.visible) return "";
  const { x, y, r } = moonPlacement(world, opening),
    path = litMoonPath(reading.phase, r);
  return `<g class="world-moon-depth" mask="url(#world-flight-sky)"><g class="world-moon" data-phase="${reading.phase}" data-moon-source="${escapeXML(reading.source)}" transform="translate(${x} ${y})"><title>${escapeXML(reading.label.replace(/_/g, " "))}${reading.fallback ? " (calculated fallback)" : ""}</title><image class="lunar-surface" data-lunar-phase="${reading.phase}" x="${-r}" y="${-r}" width="${r * 2}" height="${r * 2}"/><path class="moon-lit-area" d="${path}" fill="none"/></g></g>`;
}
const paintLayer = (kind, cls, grade) =>
  `<foreignObject x="108" y="90" width="384" height="384" class="${cls}" style="filter:${grade}"><canvas xmlns="http://www.w3.org/1999/xhtml" class="world-paint" data-world-paint="${kind}" aria-hidden="true"></canvas></foreignObject>`;
function skyBackground(scene) {
  const colors = sceneSkyColors(scene) ||
    {
      day: ["#2384e8", "#a4cef0"],
      night: ["#08152b", "#263d57"],
      dusk: ["#71527a", "#d39c85"],
      dawn: ["#536c98", "#e5c5ab"],
    }[scene.period] || ["#2384e8", "#a4cef0"];
  return `<defs><linearGradient id="world-clear-sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${colors[0]}"/><stop offset="1" stop-color="${colors[1]}"/></linearGradient></defs><path class="world-sky-base" d="${skyPath()}" fill="url(#world-clear-sky)"/>`;
}
function landscapeMotion(c, scene, custom, weather) {
  const w = c.world,
    grade = imageGrade(scene);
  let out = `<defs>${!custom ? `<image id="world-photo-source" href="${escapeXML(sceneSource(scene))}" x="108" y="90" width="384" height="384" preserveAspectRatio="xMidYMid slice"/>` : ""}<clipPath id="world-cloud-sky"><path d="${skyPath()}"/></clipPath><radialGradient id="world-feather"><stop offset=".3" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient></defs>`;
  if (w.clouds && weather !== "clear")
    out += `<g clip-path="url(#world-cloud-sky)">${paintLayer("clouds", "scene-cloud", grade)}</g>`;
  if (w.water && !custom)
    out += `<defs><clipPath id="world-lake"><path d="${lakePath}"/></clipPath></defs><g clip-path="url(#world-lake)">${paintLayer("water", "water-ripple", grade)}</g>`;
  if (!custom && w.windows && ["night", "dusk"].includes(scene.period))
    out += paintLayer("windows", "world-window-lights", "");
  if (w.trees && !custom && w.quality !== "light")
    out += paintLayer("foliage", "world-foliage", grade);
  if (
    w.seasonal_debris &&
    !custom &&
    ["spring", "autumn"].includes(scene.season)
  )
    out += paintLayer("seasonal-debris", "world-seasonal-debris", grade);
  if (w.waterfalls && !custom)
    out += paintLayer("waterfalls", "world-waterfalls", "");
  return out;
}
function nightSky(world, reading, opening) {
  const p = moonPlacement(world, opening);
  let out = `<defs><mask id="world-night-sky" maskUnits="userSpaceOnUse"><path d="${skyPath()}" fill="white"/>${reading.visible ? `<circle cx="${p.x}" cy="${p.y}" r="${p.r}" fill="black"/>` : ""}</mask></defs><g mask="url(#world-night-sky)">`;
  if (world.stars) out += paintLayer("stars", "world-star", "");
  if (world.shooting_stars) out += paintLayer("meteors", "world-meteors", "");
  return out + "</g>" + moonMarkup(world, reading, opening);
}
function objectMarkup(o, i, opening) {
  const x = 108 + o.x * 3.84,
    y = 90 + o.y * 3.84,
    scale = o.scale * 0.36,
    water = o.motion === "surface" || o.kind === "sailboat",
    delay = -(i * 7.9 + 3.1) % o.interval;
  const local = `translate(${x} ${y}) scale(${scale})`,
    id = "world-object-" + i,
    prefix = id + "-";
  const art = inhabitantArt(o.kind, o.tint ? o.color : "")
      .replace(/url\(#([\w-]+)\)/g, (_, key) => `url(#${prefix + key})`)
      .replace(/id="/g, `id="${prefix}`),
    defs = creatureDefs().replace(/id="/g, `id="${prefix}`);
  return `<g class="world-depth" ${o.behind_castle ? 'mask="url(#world-flight-sky)"' : ""}><g class="world-object ${water ? "world-surface" : ""}" data-world-id="${escapeXML(o.id)}" data-kind="${o.kind}" transform="${local}" style="color:${o.color};fill:currentColor;--encounter-seconds:${o.interval}s;--encounter-delay:${delay}s;--travel-span:${((o.facing === "left" ? -1 : 1) * o.span * 3.84) / scale}px"><title>${escapeXML(o.name)}</title>${defs}${o.motion === "fly" ? `<style>${flightKeyframes(o, i, opening)}</style>` : ""}${water ? `<defs><clipPath id="${id}-waterline"><rect x="-85" y="-95" width="170" height="95"/></clipPath></defs><g clip-path="url(#${id}-waterline)">` : ""}<g class="world-encounter ${o.motion}" style="transform-origin:0px 0px;${o.motion === "fly" ? `animation-name:world-flight-${i}` : ""}"><g transform="scale(${o.facing === "left" ? -1 : 1} 1)">${o.kind === "custom" && o.image ? `<image href="${escapeXML(o.image)}" x="-32" y="-32" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>` : art}</g></g>${water ? '</g><ellipse class="water-encounter-rings" rx="42" ry="3" fill="none" stroke="#c9d7d9" stroke-width=".7"/><ellipse class="water-encounter-rings" rx="28" ry="2" fill="none" stroke="#93bdc2" stroke-width=".5"/>' : ""}</g></g>`;
}
export function worldMarkup(
  c,
  scene,
  states = {},
  weather = "clear",
  custom = false,
  reading = moonReading(c.world, states),
) {
  // Replace the photograph's baked clouds even when decorative motion is off.
  // Clear weather must not inherit clouds from either the photo or animation.
  if (!c.world.enabled)
    return custom
      ? ""
      : `<g clip-path="url(#castle-opening)">${skyBackground(scene)}</g>`;
  let out =
    `<g class="scene-motion world-live ${scene.period === "night" ? "world-night" : ""}" clip-path="url(#castle-opening)">` +
    `<defs><mask id="world-flight-sky" maskUnits="userSpaceOnUse"><path d="${skyPath()}" fill="white"/></mask></defs>`;
  if (!custom) out += skyBackground(scene);
  if (["night", "dusk", "dawn"].includes(scene.period))
    out += nightSky(c.world, reading, c.location_panels.inner_radius);
  else if (c.world.moon.show_in_daylight)
    out += moonMarkup(c.world, reading, c.location_panels.inner_radius);
  if (weather === "lightning")
    out += `<g class="weather weather-flashes ${c.weather_motion ? "" : "still"}">${lightningMarkup("far")}</g>`;
  out += landscapeMotion(c, scene, custom, weather);
  out += c.world.objects
    .filter((o) => objectActive(o, scene, weather))
    .map((o, i) => objectMarkup(o, i, c.location_panels.inner_radius))
    .join("");
  if (c.world.fireflies && ["night", "dusk"].includes(scene.period))
    out += paintLayer("fireflies", "world-foreground-fireflies", "");
  return out + "</g>";
}
