// The curved style transcribes the supplied Home Assistant canvas geometry.
// Scale its 700×700 coordinates to this card's 600×600 viewBox.
export const LEGACY_SCALE = 6 / 7;
export function handStyle(member, config) {
  if (member.hand_design !== "theme") return member.hand_design;
  return ["enchanted-spoons", "whimsical-workshop"].includes(config.theme)
    ? "spoon"
    : config.theme === "living-magical"
      ? config.hand_design || "legacy-curved"
      : "classic";
}
export function handRadius(member, config, radius = 1) {
  const style = handStyle(member, config);
  return (
    (style === "legacy-curved"
      ? 252 * LEGACY_SCALE
      : style === "standalone-pointed"
        ? 258 * LEGACY_SCALE
        : 173) *
    member.length *
    radius
  );
}
export function handPath(style, length) {
  if (style === "standalone-pointed") {
    // Original standalone silhouette, with length scaling about its common pivot.
    const f = length / 258;
    return `M300 ${300 + 4 * f} C${300 - 6 * f} ${300 - 15 * f} ${300 - 14 * f} ${300 - 40 * f} ${300 - 19 * f} ${300 - 72 * f} L${300 - 33 * f} ${300 - 171 * f} L${300 - 25 * f} ${300 - 183 * f} L${300 - 26 * f} ${300 - 224 * f} L${300 - 11 * f} ${300 - 211 * f} L300 ${300 - 258 * f} L${300 + 11 * f} ${300 - 211 * f} L${300 + 26 * f} ${300 - 224 * f} L${300 + 25 * f} ${300 - 183 * f} L${300 + 33 * f} ${300 - 171 * f} L${300 + 19 * f} ${300 - 72 * f} C${300 + 14 * f} ${300 - 40 * f} ${300 + 6 * f} ${300 - 15 * f} 300 ${300 + 4 * f} Z`;
  }
  if (style === "legacy-curved") {
    const w = 18 * LEGACY_SCALE;
    return `M300 300 Q${300 + w} ${300 - length * 0.5} ${300 + w} ${300 - length * 0.75} Q${300 + w * 0.2} ${300 - length * 0.8} 300 ${300 - length} Q${300 - w * 0.2} ${300 - length * 0.8} ${300 - w} ${300 - length * 0.75} Q${300 - w} ${300 - length * 0.5} 300 300 Z`;
  }
  if (style === "arrow")
    return `M294 309V${320 - length}H282L300 ${290 - length}L318 ${320 - length}H306V309Z`;
  if (style === "leaf")
    return `M300 310 Q265 ${320 - length / 2} 300 ${285 - length} Q335 ${320 - length / 2} 300 310Z`;
  if (style === "sword")
    return `M296 312V${310 - length}L300 ${285 - length}L304 ${310 - length}V312Z M282 275H318V282H282Z`;
  return style === "spoon"
    ? `M296 306 Q288 270 296 ${300 - length + 25} L304 ${300 - length + 25} Q312 270 304 306Z`
    : `M300 309 L291 284 L296 ${300 - length + 18} L300 ${300 - length - 6} L304 ${300 - length + 18} L309 284Z`;
}
export function legacyTextRotation(artworkAngle) {
  const angle = (((artworkAngle + 180) % 360) + 360) % 360;
  return angle > 90 && angle < 270 ? 270 : 90;
}
