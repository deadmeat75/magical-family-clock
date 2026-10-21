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
export function finishDefs(effects) {
  let out =
    '<linearGradient id="hand-sheen" x1="0" x2="1"><stop stop-color="#fff" stop-opacity=".65"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".65" stop-color="#000" stop-opacity=".1"/><stop offset="1" stop-color="#000" stop-opacity=".65"/></linearGradient><linearGradient id="glass-glare" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".6"/><stop offset=".4" stop-color="#fff" stop-opacity=".05"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".18"/></linearGradient><pattern id="brushed-grain" width="7" height="70" patternUnits="userSpaceOnUse"><path d="M1 0V70M4 10V65M6 0V50" stroke="#091420" opacity=".2" stroke-width=".45"/></pattern><pattern id="wood-grain" width="24" height="100" patternUnits="userSpaceOnUse"><path d="M3 0q12 30 0 65t0 35M12 0q-9 45 0 80t0 20M19 0q8 20 0 50t0 50" stroke="#25120d" stroke-width="1.2" fill="none" opacity=".35"/></pattern><pattern id="patina-marks" width="57" height="49" patternUnits="userSpaceOnUse"><circle cx="12" cy="13" r="7" fill="#2c6d56" opacity=".3"/><ellipse cx="43" cy="39" rx="9" ry="4" fill="#357760" opacity=".23"/></pattern><pattern id="wear-marks" width="21" height="45" patternUnits="userSpaceOnUse"><path d="M2 8l6 -3M13 27l5 -2M7 43l4 -8" stroke="#1b201c" opacity=".35"/><circle cx="15" cy="7" r="1.2" fill="#1b4234" opacity=".7"/></pattern>';
  for (const [key, stops] of Object.entries(metals))
    out += `<linearGradient id="material-${key}" x1="0" x2="1"><stop stop-color="${stops[0]}"/><stop offset=".22" stop-color="${stops[1]}"/><stop offset=".4" stop-color="${stops[2]}"/><stop offset=".55" stop-color="${stops[1]}"/><stop offset="1" stop-color="${stops[3]}"/></linearGradient>`;
  for (const [target, e] of Object.entries(effects)) {
    out += `<filter id="effect-${target}" x="-35%" y="-35%" width="170%" height="170%" color-interpolation-filters="sRGB"><feDropShadow dx="${e.shadow * 3}" dy="${e.shadow * 5}" stdDeviation="${e.shadow * 3}" flood-color="#070b10" flood-opacity="${e.shadow * 0.85}"/></filter>`;
  }
  return out;
}
export function materialFill(material, color) {
  return material === "color"
    ? color
    : `url(#material-${metals[material] ? material : "brass"})`;
}
export function surfaceMarkup(path, member, effects) {
  const r = member.relief ?? 0.6,
    wear = effects.wear + (member.finish === "aged" ? 0.2 : 0),
    shine = Math.min(1, effects.reflection + effects.glare * 0.5);
  return `<path class="hand-bevel" d="${path}" fill-rule="evenodd" fill="url(#hand-sheen)" opacity="${effects.bevel * r}" stroke="#f9e5b0" stroke-opacity="${effects.bevel * 0.6}" stroke-width=".65"/><path class="hand-texture" d="${path}" fill-rule="evenodd" fill="url(#${member.material === "wood" ? "wood-grain" : member.finish === "brushed" ? "brushed-grain" : "wear-marks"})" opacity="${wear + effects.patina * 0.5}"/><path class="hand-patina" d="${path}" fill-rule="evenodd" fill="url(#patina-marks)" opacity="${effects.patina}"/><path class="hand-reflection" d="${path}" fill-rule="evenodd" fill="url(#glass-glare)" style="--reflection-strength:${shine}" opacity="${shine}"/>`;
}
