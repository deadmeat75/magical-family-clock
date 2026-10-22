// Individually identified panes in the bundled 1254px source composition.
// Foliage and warm stone are deliberately excluded, even when similarly colored.
export const CASTLE_WINDOW_RECTS = [
  [662, 187, 9, 15],
  [685, 187, 10, 15],
  [684, 234, 13, 20],
  [687, 325, 14, 22],
  [669, 331, 10, 20],
  [645, 376, 8, 22],
  [543, 352, 18, 26],
  [449, 433, 13, 25],
  [498, 456, 16, 29],
  [543, 450, 23, 31],
  [576, 410, 20, 40],
  [592, 410, 16, 38],
  [640, 407, 9, 31],
  [721, 472, 14, 27],
  [745, 471, 15, 28],
  [771, 472, 17, 28],
  [783, 432, 15, 23],
  [813, 432, 9, 21],
  [540, 491, 31, 35],
];
export function castleWindowPath() {
  const scale = 384 / 1254;
  return CASTLE_WINDOW_RECTS.map(([sx, sy, sw, sh]) => {
    const x = 108 + sx * scale,
      y = 90 + sy * scale,
      w = sw * scale,
      h = sh * scale;
    return `M${x} ${y + h}V${y + w / 2}Q${x + w / 2} ${y - w * 0.12} ${x + w} ${y + w / 2}V${y + h}Z`;
  }).join("");
}
