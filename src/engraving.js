// Fit a measured text rectangle into filled metal, including any cutouts.
// The predicate uses unrotated hand coordinates after its width adjustment.
export function fitEngraving({
  length,
  width,
  box,
  size,
  contains,
  position = "stem",
  rotation = 90,
  bowlRadius = 0,
  measure,
}) {
  if (!(box.width > 0 && box.height > 0 && size > 0)) return null;
  const margin = 0.8,
    angle = (rotation * Math.PI) / 180,
    c = Math.cos(angle),
    s = Math.sin(angle);
  const bowl = position === "tip" && bowlRadius > 0;
  const top = bowl
    ? 300 - length - bowlRadius
    : 300 - length * (position === "tip" ? 1.12 : 0.82);
  const bottom = bowl
    ? 300 - length + bowlRadius
    : 300 - length * (position === "tip" ? 0.72 : 0.18);
  const fractions = bowl
    ? [1]
    : position === "tip"
      ? [0.9, 0.86, 0.94, 0.82, 0.98, 0.78, 1.02]
      : [0.52, 0.58, 0.46, 0.64, 0.4, 0.7, 0.34, 0.76];
  const offsets = bowl
    ? [0]
    : [0, -3, 3, -6, 6, -9, 9, -12, 12, -16, 16, -21, 21];
  for (let fontSize = size; fontSize >= 4; fontSize *= 0.85) {
    const scale = fontSize / size,
      // SVG font metrics can change nonlinearly at small sizes (font hinting).
      // Use the rendered bounds when available instead of assuming exact scaling.
      bounds = measure
        ? measure(fontSize)
        : { width: box.width * scale, height: box.height * scale },
      halfWidth = bounds.width / 2 + margin,
      halfHeight = bounds.height / 2 + margin;
    const vertical = Math.abs(s) * halfWidth + Math.abs(c) * halfHeight;
    if (vertical * 2 > bottom - top) continue;
    for (const fraction of fractions) {
      const y = 300 - length * fraction;
      if (y - vertical < top || y + vertical > bottom) continue;
      for (const offset of offsets) {
        const x = 300 + offset * width;
        if (!contains(x, y)) continue;
        let fits = true;
        for (let row = 0; row <= 4 && fits; row++)
          for (let column = 0; column <= 10; column++) {
            const u = halfWidth * (column / 5 - 1),
              v = halfHeight * (row / 2 - 1);
            if (!contains(x + u * c - v * s, y + u * s + v * c)) {
              fits = false;
              break;
            }
          }
        // A sparse grid alone can miss a small skeleton/filigree cutout.
        // Validate the promising rectangle at sub-unit spacing before accepting it.
        const columns = Math.ceil((halfWidth * 2) / 0.5),
          rows = Math.ceil((halfHeight * 2) / 0.5);
        for (let row = 0; row <= rows && fits; row++)
          for (let column = 0; column <= columns; column++) {
            const u = halfWidth * ((column * 2) / columns - 1),
              v = halfHeight * ((row * 2) / rows - 1);
            if (!contains(x + u * c - v * s, y + u * s + v * c)) {
              fits = false;
              break;
            }
          }
        if (fits)
          return {
            x,
            y,
            fontSize,
            textWidth: bounds.width,
            textHeight: bounds.height,
            margin,
          };
      }
    }
  }
  return null;
}
export function letteringRotation(member, artworkAngle) {
  const base =
    (member.name_orientation === "perpendicular" ? 0 : 90) +
    (member.name_rotation || 0);
  const world = (((artworkAngle + 90 + base) % 360) + 360) % 360;
  return (
    base +
    (member.name_upright !== false && world > 90 && world < 270 ? 180 : 0)
  );
}
