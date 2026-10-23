import { approvedShapes } from "./approved-shapes.js";
// The curved style transcribes the supplied Home Assistant canvas geometry.
// Scale its 700×700 coordinates to this card's 600×600 viewBox.
export const LEGACY_SCALE = 6 / 7;
export function handStyle(member, config) {
  if (member.hand_design !== "theme") return member.hand_design;
  if (config.template_hand_design) return config.template_hand_design;
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
  const crafted = approvedShapes[style];
  if (crafted)
    return crafted.contours
      .map(
        (points) =>
          points
            .map(
              ([x, y], i) =>
                (i ? "L" : "M") +
                (300 + x * length).toFixed(3) +
                " " +
                (300 + y * length).toFixed(3),
            )
            .join("") + "Z",
      )
      .join("");
  return legacyHandPath(style, length);
}
export function legacyHandPath(style, length) {
  if (style === "standalone-pointed") {
    // Original standalone silhouette, with length scaling about its common pivot.
    const f = length / 258;
    return `M300 ${300 + 4 * f} C${300 - 6 * f} ${300 - 15 * f} ${300 - 14 * f} ${300 - 40 * f} ${300 - 19 * f} ${300 - 72 * f} L${300 - 33 * f} ${300 - 171 * f} L${300 - 25 * f} ${300 - 183 * f} L${300 - 26 * f} ${300 - 224 * f} L${300 - 11 * f} ${300 - 211 * f} L300 ${300 - 258 * f} L${300 + 11 * f} ${300 - 211 * f} L${300 + 26 * f} ${300 - 224 * f} L${300 + 25 * f} ${300 - 183 * f} L${300 + 33 * f} ${300 - 171 * f} L${300 + 19 * f} ${300 - 72 * f} C${300 + 14 * f} ${300 - 40 * f} ${300 + 6 * f} ${300 - 15 * f} 300 ${300 + 4 * f} Z`;
  }
  if (style === "legacy-curved") {
    const w = 18 * LEGACY_SCALE;
    return `M300 300 Q${300 + w} ${300 - length * 0.5} ${300 + w} ${300 - length * 0.75} Q${300 + w * 0.2} ${300 - length * 0.8} 300 ${300 - length} Q${300 - w * 0.2} ${300 - length * 0.8} ${300 - w} ${300 - length * 0.75} Q${300 - w} ${300 - length * 0.5} 300 300 Z`;
  }
  if (style === "cathedral")
    return `M294 311L289 275L294 ${330 - length}L283 ${325 - length}L300 ${277 - length}L317 ${325 - length}L306 ${330 - length}L311 275L306 311Z`;
  if (style === "filigree")
    return `M296 311Q277 270 293 ${340 - length}Q270 ${315 - length} 300 ${280 - length}Q330 ${315 - length} 307 ${340 - length}Q323 270 304 311Z M298 270Q288 ${325 - length} 300 ${304 - length}Q312 ${325 - length} 302 270Z`;
  if (style === "skeleton")
    return `M290 310L285 275L292 ${325 - length}L300 ${280 - length}L308 ${325 - length}L315 275L310 310Z M296 273L300 ${318 - length}L304 273Z`;
  if (style === "quill")
    return `M295 310Q294 260 287 ${350 - length}Q276 ${305 - length} 314 ${280 - length}Q338 ${340 - length} 305 ${365 - length}L302 310Z`;
  if (style === "compass")
    return `M300 320L287 280L294 ${335 - length}L282 ${330 - length}L300 ${275 - length}L318 ${330 - length}L306 ${335 - length}L313 280Z M300 285L296 275L300 ${310 - length}L304 275Z`;
  if (style === "arrow")
    return `M294 309V${320 - length}H282L300 ${290 - length}L318 ${320 - length}H306V309Z`;
  if (style === "leaf")
    return `M300 310 Q265 ${320 - length / 2} 300 ${285 - length} Q335 ${320 - length / 2} 300 310Z`;
  if (style === "sword")
    return `M296 312V${310 - length}L300 ${285 - length}L304 ${310 - length}V312Z M282 275H318V282H282Z`;
  return style === "spoon"
    ? `M296 306 Q288 270 296 ${300 - length + 6} L304 ${300 - length + 6} Q312 270 304 306Z`
    : `M300 309 L291 284 L296 ${300 - length + 18} L300 ${300 - length - 6} L304 ${300 - length + 18} L309 284Z`;
}
export function legacyTextRotation(artworkAngle) {
  const angle = (((artworkAngle + 180) % 360) + 360) % 360;
  return angle > 90 && angle < 270 ? 270 : 90;
}
