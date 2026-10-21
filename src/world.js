import { sceneSource, imageGrade } from "./artwork.js";
import { moonReading, objectActive } from "./world-config.js";
import { inhabitantArt, creatureDefs } from "./world-art.js";
import { escapeXML } from "./panels.js";
export const worldCSS = `
.scene-motion.world-live{opacity:1;pointer-events:none}.world-photo{pointer-events:none}.world-live .scene-cloud{animation:world-clouds calc(24s / var(--motion-speed,1)) ease-in-out infinite alternate;transform-box:view-box;transform-origin:300px 150px}.world-live .water-ripple{animation:world-water calc(3.6s / var(--motion-speed,1)) ease-in-out infinite alternate;transform-box:view-box;transform-origin:300px 400px}.world-tree{animation:world-sway calc(4.2s / var(--motion-speed,1)) ease-in-out infinite alternate;transform-box:view-box}.world-fall-photo{animation:waterfall-texture calc(.9s / var(--motion-speed,1)) linear infinite}.world-fall-stream{stroke-dasharray:14 9 3 19;animation:world-fall calc(.85s / var(--motion-speed,1)) linear infinite}.world-spray{animation:world-spray calc(2.3s / var(--motion-speed,1)) ease-in-out infinite}.world-star{animation:star-twinkle var(--twinkle,4s) ease-in-out infinite alternate}.world-meteor{animation:shooting-star calc(47s / var(--motion-speed,1)) linear infinite;opacity:0}.world-encounter{animation-duration:calc(var(--encounter-seconds,30s) / var(--motion-speed,1));animation-timing-function:linear;animation-iteration-count:infinite;animation-delay:var(--encounter-delay,0s)}.world-encounter.fly{animation-name:creature-flight}.world-encounter.surface{animation-name:creature-surface}.world-encounter.drift{animation-name:creature-drift}.world-encounter.bob{animation-name:creature-bob}.creature-wing{transform-box:view-box;transform-origin:0px -2px;animation:creature-wings calc(.75s / var(--motion-speed,1)) ease-in-out infinite alternate}.far-wing{animation-delay:-.3s}.dragon-near-wing,.dragon-far-wing{animation-duration:1.8s}.rider-cloak,.phoenix-tail{animation:cloth-wave 1.8s ease-in-out infinite alternate;transform-origin:0px 0px}.creature-glow{animation:star-twinkle 2.7s ease-in-out infinite alternate}.chimney-smoke{animation:world-smoke 4.5s linear infinite}.water-encounter-rings{animation:encounter-rings var(--encounter-seconds,40s) ease-out infinite;animation-delay:var(--encounter-delay,0s)}.world-encounter.still *{animation:none!important}.world-night .world-object{filter:brightness(.72) saturate(.85)}.world-surface .world-encounter{transform:translateY(35px)}.scene-off .world-live *{animation-play-state:paused!important}.scene-off .world-encounter,.still .world-encounter{opacity:1!important;transform:none!important}.still .world-star,.scene-off .world-star{opacity:.75!important}
@keyframes world-clouds{from{transform:translateX(-7px)}to{transform:translateX(calc(14px * var(--scene-intensity,.65)))}}@keyframes world-water{from{transform:translateX(-1.8px) skewX(-.25deg)}to{transform:translateX(1.8px) skewX(.25deg)}}@keyframes world-sway{from{transform:rotate(-2deg)}to{transform:rotate(calc(4deg * var(--scene-intensity,.65)))}}@keyframes waterfall-texture{0%{opacity:0;transform:translateY(-2px)}50%{opacity:.85}100%{opacity:0;transform:translateY(3px)}}@keyframes world-fall{to{stroke-dashoffset:-45}}@keyframes world-spray{0%{opacity:.15;transform:translateY(2px) scaleX(.9)}60%{opacity:.7;transform:translateY(-1px) scaleX(1.1)}100%{opacity:.15;transform:translateY(2px) scaleX(.9)}}@keyframes star-twinkle{from{opacity:.22}to{opacity:1}}@keyframes shooting-star{0%,82%{opacity:0;transform:translate(0,0)}83%{opacity:.95}86%{opacity:0;transform:translate(110px,60px)}100%{opacity:0;transform:translate(110px,60px)}}@keyframes creature-flight{0%,4%{opacity:0;transform:translate(calc(var(--travel-span,280px) * -.5),5px)}8%{opacity:1}28%{transform:translate(calc(var(--travel-span,280px) * -.1),-4px)}52%{opacity:1;transform:translate(calc(var(--travel-span,280px) * .5),3px)}55%,100%{opacity:0;transform:translate(calc(var(--travel-span,280px) * .55),4px)}}@keyframes creature-surface{0%,10%{transform:translateY(42px);opacity:0}18%{opacity:1}28%,48%{transform:translateY(0);opacity:1}60%,100%{transform:translateY(42px);opacity:0}}@keyframes creature-drift{0%{transform:translate(-14px,1px) rotate(-1deg)}50%{transform:translate(14px,-2px) rotate(1deg)}100%{transform:translate(-14px,1px) rotate(-1deg)}}@keyframes creature-bob{0%,100%{transform:translateY(2px) rotate(-1.5deg)}50%{transform:translateY(-2px) rotate(1.5deg)}}@keyframes creature-wings{from{transform:scaleY(.6) rotate(-8deg)}to{transform:scaleY(1) rotate(9deg)}}@keyframes cloth-wave{to{transform:skewY(8deg)}}@keyframes world-smoke{0%{opacity:0;transform:translateY(3px)}25%{opacity:.6}100%{opacity:0;transform:translate(5px,-8px)}}@keyframes encounter-rings{0%,15%,70%,100%{opacity:0;transform:scaleX(.7)}30%,50%{opacity:.65;transform:scaleX(1.2)}}
@media(prefers-reduced-motion:reduce){.world-live *{animation-play-state:paused!important}.world-encounter{opacity:1!important;transform:none!important}.world-star{opacity:.75!important}.world-meteor{display:none}}
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
function moonMarkup(world, reading, opening = 180) {
  if (!reading.visible) return "";
  const m = world.moon,
    r = m.size,
    dx = 108 + m.x * 3.84 - 300,
    dy = 90 + m.y * 3.84 - 282,
    factor = Math.min(1, (opening - r - 6) / (Math.hypot(dx, dy) || 1)),
    x = 300 + dx * factor,
    y = 282 + dy * factor,
    path = litMoonPath(reading.phase, r);
  return `<g class="world-moon-depth" mask="url(#world-flight-sky)"><g class="world-moon" data-phase="${reading.phase}" data-moon-source="${escapeXML(reading.source)}" transform="translate(${x} ${y})"><title>${escapeXML(reading.label.replace(/_/g, " "))}${reading.fallback ? " (calculated fallback)" : ""}</title><defs><radialGradient id="moon-surface" cx=".35" cy=".3"><stop stop-color="#fbf0cc"/><stop offset=".65" stop-color="#e3dcc3"/><stop offset="1" stop-color="#b5bec4"/></radialGradient><radialGradient id="moon-halo"><stop stop-color="#d5e6ff" stop-opacity=".16"/><stop offset="1" stop-color="#d5e6ff" stop-opacity="0"/></radialGradient><clipPath id="world-moon-light"><path d="${path}"/></clipPath></defs><circle r="${r * 2.8}" fill="url(#moon-halo)"/><circle r="${r}" fill="#243650" stroke="#95a9bc" stroke-opacity=".2" stroke-width=".5"/><path class="moon-lit-area" d="${path}" fill="url(#moon-surface)"/><g clip-path="url(#world-moon-light)" fill="#8d99a2" opacity=".14"><circle cx="${-r * 0.3}" cy="${r * 0.1}" r="${r * 0.27}"/><circle cx="${r * 0.25}" cy="${-r * 0.3}" r="${r * 0.18}"/><circle cx="${r * 0.4}" cy="${r * 0.4}" r="${r * 0.15}"/></g></g></g>`;
}
const photo = (grade, cls = "", extra = "") =>
  `<use class="world-photo ${cls}" href="#world-photo-source" style="filter:${grade};${extra}"/>`;
function landscapeMotion(c, scene, custom) {
  const w = c.world,
    url = sceneSource(scene),
    grade = imageGrade(scene),
    light = scene.period === "night" ? "#c5d2e9" : "#e5f6f7";
  let out = `<defs>${!custom ? `<image id="world-photo-source" href="${escapeXML(url)}" x="108" y="90" width="384" height="384" preserveAspectRatio="xMidYMid slice"/>` : ""}<filter id="world-cloud-opacity" color-interpolation-filters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  2 1 0 0 -.8"/></filter><radialGradient id="world-feather"><stop offset=".68" stop-color="white"/><stop offset="1" stop-color="black"/></radialGradient></defs>`;
  if (w.clouds) {
    if (!custom)
      out += `<defs><mask id="world-cloud-left" maskUnits="userSpaceOnUse"><ellipse cx="169" cy="151" rx="67" ry="61" fill="url(#world-feather)"/></mask><mask id="world-cloud-right" maskUnits="userSpaceOnUse"><ellipse cx="426" cy="160" rx="67" ry="66" fill="url(#world-feather)"/></mask></defs><g mask="url(#world-cloud-left)">${photo("url(#world-cloud-opacity) " + grade, "scene-cloud")}</g><g mask="url(#world-cloud-right)">${photo("url(#world-cloud-opacity) " + grade, "scene-cloud", "animation-delay:-11s")}</g>`;
    else
      out +=
        '<g fill="#dbe8ee" opacity=".48"><path class="scene-cloud" d="M110 170q18-24 39-9q15-33 43-9q30-7 39 18Z"/><path class="scene-cloud" d="M363 155q21-26 43-13q18-21 39 0q30-5 46 17Z"/></g>';
  }
  if (w.water && !custom) {
    out +=
      '<defs><clipPath id="world-lake"><path d="M115 356Q270 349 479 358V404L453 450H271L224 426 177 411 145 391Z"/></clipPath></defs><g clip-path="url(#world-lake)">';
    const count = w.quality === "light" ? 2 : 4;
    for (let i = 0; i < count; i++)
      out += `<svg x="108" y="${353 + i * 27}" width="384" height="29" viewBox="108 ${353 + i * 27} 384 29" overflow="hidden">${photo(grade, "water-ripple", `animation-delay:-${i * 0.9}s`)}</svg>`;
    out += "</g>";
  }
  if (!custom && w.windows && ["night", "dusk"].includes(scene.period)) {
    out +=
      '<defs><filter id="castle-lit-windows" x="0" y="0" width="100%" height="100%"><feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  3 0 -3 0 -1.1" result="lights"/><feGaussianBlur in="lights" stdDeviation=".3" result="bloom"/><feMerge><feMergeNode in="bloom"/><feMergeNode in="lights"/></feMerge></filter><clipPath id="castle-lit-area"><path d="M236 308V245H251V202H272V178H300V167H310V140H326V213H344V262H357V309Z"/></clipPath></defs><g clip-path="url(#castle-lit-area)"><use class="window-light" href="#world-photo-source" filter="url(#castle-lit-windows)" opacity=".8"/></g>';
  }
  if (w.trees && !custom && w.quality !== "light") {
    const patches = [
      [197, 301, 10, 20],
      [254, 299, 13, 17],
      [386, 293, 10, 24],
      [173, 407, 21, 34],
      [466, 443, 22, 35],
    ];
    for (let i = 0; i < (w.quality === "balanced" ? 3 : 5); i++) {
      const [x, y, rx, ry] = patches[i],
        id = "world-tree-" + i;
      out += `<defs><mask id="${id}" maskUnits="userSpaceOnUse"><ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="url(#world-feather)"/></mask></defs><g mask="url(#${id})">${photo(grade, "world-tree", `transform-origin:${x}px ${y + ry}px;animation-delay:-${i * 0.7}s`)}</g>`;
    }
  }
  if (w.waterfalls && !custom) {
    out +=
      '<defs><clipPath id="world-waterfall-mask"><path d="M202 315L213 316 207 339 197 349 188 350 198 338ZM325 321L339 325 342 348 332 353 324 348 328 337Z"/></clipPath></defs><g class="world-waterfalls" clip-path="url(#world-waterfall-mask)">';
    out +=
      photo(grade, "world-fall-photo") +
      photo(grade, "world-fall-photo", "animation-delay:-.45s");
    for (let i = 0; i < 12; i++) {
      const x = i < 6 ? 201 + i * 1.5 : 325 + (i - 6) * 2;
      out += `<path class="world-fall-stream" d="M${x} 312q6 14 2 25t-4 25" fill="none" stroke="${light}" stroke-width="${0.3 + (i % 3) * 0.2}" opacity=".32" style="animation-delay:-${i * 0.11}s"/>`;
    }
    out +=
      '</g><g class="world-spray" style="transform-origin:333px 351px" fill="' +
      light +
      '" opacity=".65"><ellipse cx="333" cy="351" rx="11" ry="2"/><ellipse cx="198" cy="349" rx="8" ry="1.6"/></g>';
  }
  return out;
}
function nightSky(world, reading, opening) {
  let out =
    '<defs><mask id="world-night-sky" maskUnits="userSpaceOnUse"><path d="M108 90H290V142H266V190H239V220H108ZM344 90H492V231H375V191H352Z" fill="white"/></mask></defs><g mask="url(#world-night-sky)">';
  if (world.stars) {
    const count = world.quality === "light" ? 24 : 64;
    for (let i = 0; i < count; i++) {
      const x = 112 + ((i * 97) % 375),
        y = 92 + ((i * 37) % 136),
        r = i % 9 === 0 ? 1.2 : 0.35 + (i % 4) * 0.17;
      out += `<circle class="world-star" cx="${x}" cy="${y}" r="${r}" fill="${i % 3 === 0 ? "#f8df9b" : "#e0ecff"}" style="--twinkle:${2.2 + (i % 6) * 0.7}s;animation-delay:-${(i % 11) * 0.6}s"/>`;
      if (i % 13 === 0)
        out += `<path class="world-star" d="M${x - 3} ${y}h6m-3-3v6" stroke="#ffe5a6" stroke-width=".45"/>`;
    }
  }
  if (world.shooting_stars)
    out +=
      '<g class="world-meteor"><path d="M154 110l-29-16" stroke="#e1eeff" stroke-width="1"/><circle cx="154" cy="110" r="1.2" fill="white"/></g><g class="world-meteor" style="animation-delay:-23s"><path d="M371 129l-18-10" stroke="#e1eeff" stroke-width=".8"/><circle cx="371" cy="129" r="1" fill="white"/></g>';
  return out + "</g>" + moonMarkup(world, reading, opening);
}
function objectMarkup(o, i) {
  const x = 108 + o.x * 3.84,
    y = 90 + o.y * 3.84,
    scale = o.scale * 0.36,
    water = o.motion === "surface",
    delay = -(i * 7.9 + 3.1) % o.interval;
  const local = `translate(${x} ${y}) scale(${scale})`,
    id = "world-object-" + i,
    prefix = id + "-";
  const art = inhabitantArt(o.kind).replace(
      /url\(#([\w-]+)\)/g,
      (_, key) => `url(#${prefix + key})`,
    ),
    defs = creatureDefs().replace(/id="/g, `id="${prefix}`);
  return `<g class="world-depth" ${o.behind_castle ? 'mask="url(#world-flight-sky)"' : ""}><g class="world-object ${water ? "world-surface" : ""}" data-world-id="${escapeXML(o.id)}" data-kind="${o.kind}" transform="${local}" style="color:${o.color};fill:currentColor;--encounter-seconds:${o.interval}s;--encounter-delay:${delay}s;--travel-span:${((o.facing === "left" ? -1 : 1) * o.span * 3.84) / scale}px"><title>${escapeXML(o.name)}</title>${defs}${water ? `<defs><clipPath id="${id}-waterline"><rect x="-85" y="-95" width="170" height="95"/></clipPath></defs><g clip-path="url(#${id}-waterline)">` : ""}<g class="world-encounter ${o.motion}" style="transform-origin:0px 0px"><g transform="scale(${o.facing === "left" ? -1 : 1} 1)">${o.kind === "custom" && o.image ? `<image href="${escapeXML(o.image)}" x="-32" y="-32" width="64" height="64" preserveAspectRatio="xMidYMid meet"/>` : art}</g></g>${water ? '</g><ellipse class="water-encounter-rings" rx="42" ry="3" fill="none" stroke="#d3e5e0" stroke-width="1.5"/><ellipse class="water-encounter-rings" rx="28" ry="2" fill="none" stroke="#93bdc2" stroke-width=".8"/>' : ""}</g></g>`;
}
export function worldMarkup(
  c,
  scene,
  states = {},
  weather = "clear",
  custom = false,
  reading = moonReading(c.world, states),
) {
  if (!c.world.enabled) return "";
  let out =
    `<g class="scene-motion world-live ${scene.period === "night" ? "world-night" : ""}" clip-path="url(#castle-opening)">` +
    '<defs><mask id="world-flight-sky" maskUnits="userSpaceOnUse"><path d="M108 90H290V142H266V190H239V220H108ZM344 90H492V231H375V191H352Z" fill="white"/></mask></defs>';
  if (["night", "dusk", "dawn"].includes(scene.period))
    out += nightSky(c.world, reading, c.location_panels.inner_radius);
  out += landscapeMotion(c, scene, custom);
  if (c.world.fireflies && ["night", "dusk"].includes(scene.period))
    for (let i = 0; i < 14; i++)
      out += `<circle class="firefly" cx="${145 + ((i * 21) % 270)}" cy="${295 + ((i * 13) % 52)}" r=".8" fill="#ffe3a3" style="animation-delay:-${i % 7}s"/>`;
  out += c.world.objects
    .filter((o) => objectActive(o, scene, weather))
    .map(objectMarkup)
    .join("");
  return out + "</g>";
}
