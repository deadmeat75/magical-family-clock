import { materialTextureURL as textureURL } from "./texture-assets.js";
const metals = {
  brass: ["#322314", "#d5ad5c", "#fff0ae", "#765025"],
  "aged-brass": ["#26392d", "#a87d3a", "#e7cc85", "#5d4326"],
  copper: ["#3b211b", "#bc734c", "#f8c394", "#704431"],
  silver: ["#26323b", "#b4c3cf", "#f9ffff", "#647884"],
  steel: ["#151d28", "#6b7e95", "#d5e8f7", "#354352"],
  wood: ["#301b12", "#84562f", "#b9945e", "#4f301c"],
  ivory: ["#75634a", "#d9c7a1", "#fff5d6", "#a4916a"],
  obsidian: ["#060a16", "#28334b", "#667a99", "#141b2b"],
  glass: ["#1c4657", "#8ab8bb", "#e4fffb", "#478591"],
};
function texturePattern(id, x, y, size = 1000) {
  return `<pattern id="${id}" width="${size}" height="${size}" patternUnits="userSpaceOnUse" x="-200" y="-200" viewBox="0 0 ${size} ${size}" preserveAspectRatio="none"><svg width="${size}" height="${size}" viewBox="${x} ${y} 627 627" overflow="hidden"><image href="${textureURL}" width="1254" height="1254"/></svg></pattern>`;
}
export function finishDefs(effects) {
  let out = `<linearGradient id="hand-sheen" x1="0" x2="1"><stop stop-color="#fff" stop-opacity=".65"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".65" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></linearGradient><linearGradient id="glass-glare" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".6"/><stop offset=".4" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient><pattern id="brushed-grain" width="7" height="70" patternUnits="userSpaceOnUse"><path d="M1 0V70M4 10V65M6 0V50" stroke="#091420" opacity=".2" stroke-width=".45"/></pattern>${texturePattern("wood-grain", 0, 627)}${texturePattern("patina-marks", 627, 627)}${texturePattern("wear-marks", 627, 627)}`;
  for (const [key, stops] of Object.entries(metals))
    if (key !== "wood")
      out += `<linearGradient id="material-${key}" x1="0" x2="1"><stop stop-color="${stops[0]}"/><stop offset=".22" stop-color="${stops[1]}"/><stop offset=".4" stop-color="${stops[2]}"/><stop offset=".55" stop-color="${stops[1]}"/><stop offset="1" stop-color="${stops[3]}"/></linearGradient>`;
  out += texturePattern("material-wood", 0, 627, 1000);
  out += `<linearGradient id="environment-reflection" x1="0" y1="0" x2=".18" y2="1"><stop stop-color="#b6d7f3" stop-opacity=".9"/><stop offset=".38" stop-color="#e4eff3" stop-opacity=".45"/><stop offset=".48" stop-color="#6a8493" stop-opacity=".58"/><stop offset=".54" stop-color="#3b3c39" stop-opacity=".6"/><stop offset=".7" stop-color="#a88d5e" stop-opacity=".28"/><stop offset="1" stop-color="#e4d1aa" stop-opacity=".25"/></linearGradient><radialGradient id="specular-glare" cx=".46" cy=".38" r=".38" gradientTransform="translate(0 .18) scale(1 .5)"><stop stop-color="#fffdf0" stop-opacity=".96"/><stop offset=".23" stop-color="#fff9df" stop-opacity=".6"/><stop offset=".65" stop-color="#fff9df" stop-opacity=".12"/><stop offset="1" stop-color="#fff9df" stop-opacity="0"/></radialGradient><filter id="metal-oxide"><feColorMatrix type="matrix" values=".06 .16 .03 0 .015 .09 .28 .04 0 .035 .065 .19 .03 0 .02 0 0 0 1 0"/></filter><filter id="silver-tarnish"><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncR type="linear" slope=".3"/><feFuncG type="linear" slope=".3"/><feFuncB type="linear" slope=".32"/></feComponentTransfer></filter>`;

  for (const [target, e] of Object.entries(effects)) {
    out += `<filter id="effect-${target}" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB"><feOffset in="SourceAlpha" dx="${e.bevel * 1.5}" dy="${e.bevel * 1.5}" result="bevel-away"/><feComposite in="SourceAlpha" in2="bevel-away" operator="out" result="bevel-lit-edge"/><feOffset in="SourceAlpha" dx="${-e.bevel * 1.5}" dy="${-e.bevel * 1.5}" result="bevel-toward"/><feComposite in="SourceAlpha" in2="bevel-toward" operator="out" result="bevel-shaded-edge"/><feFlood flood-color="#fff2ce" flood-opacity="${e.bevel * 0.9}" result="edge-light"/><feComposite in="edge-light" in2="bevel-lit-edge" operator="in" result="lit-bevel"/><feFlood flood-color="#22160b" flood-opacity="${e.bevel * 0.8}" result="edge-shadow"/><feComposite in="edge-shadow" in2="bevel-shaded-edge" operator="in" result="dark-bevel"/><feMerge result="beveled"><feMergeNode in="SourceGraphic"/><feMergeNode in="dark-bevel"/><feMergeNode in="lit-bevel"/></feMerge><feDropShadow in="beveled" dx="${e.shadow * 3}" dy="${e.shadow * 6}" stdDeviation="${e.shadow * 1.5}" flood-color="#0b1012" flood-opacity="${e.shadow * 0.65}" result="contact"/><feDropShadow in="contact" dx="0" dy="${e.shadow * 2}" stdDeviation="${e.shadow * 3.2}" flood-color="#172028" flood-opacity="${e.shadow * 0.28}"/></filter>`;
  }
  return out;
}
export function materialFill(material, color) {
  return material === "color"
    ? color
    : `url(#material-${metals[material] ? material : "brass"})`;
}
export function surfaceMarkup(path, member, effects) {
  const relief = member.relief ?? 0.6,
    organic = ["wood", "ivory"].includes(member.material),
    glass = member.material === "glass",
    rough = member.finish === "brushed",
    reflect = effects.reflection * (organic ? 0.12 : rough ? 0.28 : 0.68),
    glare = effects.glare * (organic ? 0.12 : rough ? 0.3 : glass ? 1 : 0.95),
    wear = Math.min(1, effects.wear + (member.finish === "aged" ? 0.1 : 0)),
    id =
      "surface-" + String(member.id || "sample").replace(/[^a-zA-Z0-9_-]/g, ""),
    oxide = organic
      ? ""
      : member.material === "silver" || member.material === "steel"
        ? 'filter="url(#silver-tarnish)"'
        : 'filter="url(#metal-oxide)"';
  let scratches = "";
  for (let n = 0; n < 28; n++) {
    const x = 285 + ((n * 13.73) % 31),
      y = 95 + ((n * 39.19) % 205),
      len = 2 + ((n * 7.31) % 16);
    scratches += `<path d="M${x} ${y}q${0.4 + (n % 3) * 0.6} ${-len * 0.5} ${1.2 + (n % 4) * 0.7} ${-len}" stroke="#362418" stroke-width=".32"/><path d="M${x + 0.35} ${y + 0.15}q${0.4 + (n % 3) * 0.6} ${-len * 0.5} ${1.2 + (n % 4) * 0.7} ${-len}" stroke="#fff0c7" stroke-width=".17"/>`;
  }
  return `<defs><clipPath id="${id}-clip"><path d="${path}" fill-rule="evenodd"/></clipPath><mask id="${id}-aging" maskUnits="userSpaceOnUse" x="0" y="0" width="600" height="600"><path d="${path}" fill="white" fill-opacity=".12" stroke="white" stroke-width="2.2" fill-rule="evenodd"/></mask></defs>
  <path class="hand-bevel" d="${path}" fill-rule="evenodd" fill="none" stroke="url(#hand-sheen)" stroke-width="${effects.bevel * relief * 1.3}" opacity="${effects.bevel}"/>
  <path class="hand-texture" d="${path}" fill-rule="evenodd" fill="url(#${member.material === "wood" ? "wood-grain" : "brushed-grain"})" opacity="${rough ? 0.22 : 0}"/>
  <path class="hand-patina" d="${path}" fill-rule="evenodd" fill="url(#${organic ? "wood-grain" : "patina-marks"})" ${oxide} mask="url(#${id}-aging)" opacity="${effects.patina * (organic ? 0.5 : 1)}"/>
  <g class="hand-wear" clip-path="url(#${id}-clip)" fill="none" opacity="${wear * 0.9}">${scratches}</g>
  <path class="hand-worn-edge" d="${path}" fill-rule="evenodd" fill="none" stroke="url(#hand-sheen)" stroke-width=".6" opacity="${wear * 0.7}"/>
  <path class="hand-reflection" d="${path}" fill-rule="evenodd" fill="url(#environment-reflection)" style="--reflection-strength:${reflect}" opacity="${reflect}"/>
  <path class="hand-glare" d="${path}" fill-rule="evenodd" fill="url(#specular-glare)" opacity="${glare}"/>`;
}
