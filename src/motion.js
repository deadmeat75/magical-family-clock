import { gearModel, gearOutline } from "./gears.js";
export const motionCSS = `.scene-cloud{animation:cloud-sail calc(32s / var(--motion-speed,1)) ease-in-out infinite alternate}.water-ripple{animation:ripple calc(5s / var(--motion-speed,1)) ease-in-out infinite alternate}.window-light{animation:window-glow calc(4s / var(--motion-speed,1)) ease-in-out infinite alternate}.firefly{animation:firefly-flight calc(12s / var(--motion-speed,1)) ease-in-out infinite alternate}.hand-reflection{animation:metal-glint 9s ease-in-out infinite}.gear.live-gear{animation-duration:calc(var(--gear-speed,60s) * var(--gear-ratio,1) / var(--motion-speed,1));transform-box:view-box;transform-origin:0px 0px}.gear.reverse{animation-direction:reverse}.scene-motion{opacity:var(--scene-intensity,.65);pointer-events:none}.scene-off .scene-motion{display:none}.paused .scene-motion *,.still .scene-motion *,.paused .hand-reflection,.still .hand-reflection{animation-play-state:paused!important}.still .template-enter{animation:none}.template-enter{animation:template-appear var(--template-transition,500ms) ease-out}@keyframes cloud-sail{to{transform:translateX(55px)}}@keyframes ripple{to{transform:translateX(12px) scaleX(1.05);opacity:.15}}@keyframes window-glow{from{opacity:.25}to{opacity:.9}}@keyframes firefly-flight{to{transform:translate(24px,-18px);opacity:.15}}@keyframes metal-glint{0%,100%{opacity:calc(var(--reflection-strength,.35)*.25)}50%{opacity:var(--reflection-strength,.35)}}@keyframes template-appear{from{opacity:.35}to{opacity:1}}@media(prefers-reduced-motion:reduce){.scene-motion *,.hand-reflection{animation:none!important}.template-enter{animation:none}}`;
export function gearTrain() {
  const model = gearModel();
  // Draw all stationary backing plates first so a later plate cannot cover
  // another wheel's teeth at the contact point.
  const plates = model.gears
    .map(
      (g) =>
        `<g transform="translate(${g.x} ${g.y})"><circle r="${g.rootRadius + 1}" fill="#101b20" stroke="#57442e" stroke-width="2"/></g>`,
    )
    .join("");
  const rotors = model.gears
    .map((g, i) => {
      const r = g.rootRadius - 3,
        phase = (g.phase * 180) / Math.PI;
      const spokes = Array.from({ length: i % 2 ? 5 : 6 }, (_, j) => {
        const angle = (j * 360) / (i % 2 ? 5 : 6);
        return `<path d="M-4 0L-6 ${-r + 3}L6 ${-r + 3}L4 0Z" transform="rotate(${angle})" fill="url(#material-brass)" stroke="#f6dc9e" stroke-width=".7"/><circle cx="0" cy="${-r + 7}" r="2" transform="rotate(${angle})" fill="#ead09c"/>`;
      }).join("");
      return `<g class="gear-axle" transform="translate(${g.x} ${g.y})"><g class="gear live-gear ${g.direction < 0 ? "reverse" : ""}" data-gear-id="${g.id}" data-teeth="${g.teeth}" data-pitch-radius="${g.pitchRadius}" data-phase="${g.phase}" data-direction="${g.direction}" style="--gear-ratio:${g.periodRatio}"><g class="tooth-phase" transform="rotate(${phase})"><path class="gear-profile" d="${gearOutline(g)}" fill="url(#material-${i % 2 ? "copper" : "brass"})" stroke="#e8c78a" stroke-width=".5"/><circle r="${r}" fill="#101b20" stroke="#644d2e" stroke-width="2"/>${spokes}<circle r="12" fill="url(#material-steel)" stroke="#e9ce8f" stroke-width="2"/></g></g><circle r="3.5" fill="#241d13"/></g>`;
    })
    .join("");
  return `<g class="gears moving-mechanism" style="opacity:1">${plates}${rotors}</g>`;
}
export function sceneMotionMarkup(season = "summer", period = "day") {
  let out =
    '<g class="scene-motion" clip-path="url(#castle-opening)"><g fill="#f3f3f4" opacity=".15"><path class="scene-cloud" d="M130 130q25 -20 55 0q20 -35 50 -5q20 -15 40 6Z"/><path class="scene-cloud" d="M320 165q25 -30 50 -4q30 -17 55 5Z" style="animation-delay:-17s"/></g>';
  for (let i = 0; i < 19; i++)
    out += `<path class="water-ripple" d="M${120 + ((i * 47) % 250)} ${380 + i * 4}q12 -2 ${22 + (i % 20)} 0" fill="none" stroke="${period === "night" ? "#d8bc7a" : "#ccedf5"}" stroke-width="${0.6 + (i % 2)}" opacity=".45" style="animation-delay:-${i % 7}s"/>`;
  for (let i = 0; i < 12; i++)
    out += `<rect class="window-light" x="${252 + ((i * 17) % 89)}" y="${246 + ((i * 19) % 105)}" width="2" height="4" rx=".8" fill="#ffda73" style="animation-delay:-${i % 6}s"/>`;
  if (period === "night" || period === "dusk")
    for (let i = 0; i < 12; i++)
      out += `<circle class="firefly" cx="${160 + ((i * 43) % 280)}" cy="${300 + i * 7}" r="1" fill="#ffe7a0" style="animation-delay:-${i % 8}s"/>`;
  if (season === "spring" || season === "autumn")
    for (let i = 0; i < 8; i++)
      out += `<ellipse class="firefly" cx="${135 + i * 45}" cy="${325 + (i % 4) * 19}" rx="2.5" ry="1.3" fill="${season === "spring" ? "#f5bbd8" : "#d38837"}" style="animation-delay:-${i}s"/>`;
  if (season === "winter")
    out +=
      '<path d="M150 352l30 -17 21 13 28 -7 19 11 39 -12 41 13 32 -20 38 19 34 -10" fill="none" stroke="#e9f3ff" stroke-width="7" opacity=".6"/>';
  return out + "</g>";
}
