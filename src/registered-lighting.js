// Transfer approved seasonal/lighting palettes onto the fixed HD composition.
// Geometry never changes, so foliage, water, windows and skyline stay registered.
const clamp = (v, a = 0, b = 255) => Math.max(a, Math.min(b, v));
export function lightingTransfer(canvas, scene) {
  const ctx = canvas.getContext("2d"),
    pixels = ctx.getImageData(0, 0, canvas.width, canvas.height),
    p = pixels.data;
  const night = scene.period === "night",
    warm = scene.period === "dawn" || scene.period === "dusk";
  for (let i = 0; i < p.length; i += 4) {
    let r = p[i],
      g = p[i + 1],
      b = p[i + 2];
    const green = clamp((g - Math.max(r, b) * 0.94) / 55, 0, 1),
      l = 0.25 * r + 0.6 * g + 0.15 * b;
    if (scene.season === "autumn") {
      r += green * (l * 0.65 + 22);
      g -= green * l * 0.08;
      b -= green * l * 0.18;
    }
    if (scene.season === "spring") {
      r += green * 13;
      g += green * 8;
      b += green * 4;
    }
    // Preserve warm, self-lit windows rather than grading them as cold stone.
    const emissive =
      clamp((r - b - 65) / 80, 0, 1) * clamp((g - b - 30) / 65, 0, 1);
    const amount = 1 - emissive * 0.85;
    if (night) {
      r *= 1 - 0.17 * amount;
      g *= 1 - 0.06 * amount;
      b += amount * (16 + (255 - b) * 0.04);
    } else if (warm) {
      r += amount * (255 - r) * 0.08;
      g *= 1 - 0.025 * amount;
      b *= 1 - 0.07 * amount;
    }
    p[i] = clamp(r);
    p[i + 1] = clamp(g);
    p[i + 2] = clamp(b);
  }
  ctx.putImageData(pixels, 0, 0);
}
export function sampleSky(image) {
  const c = document.createElement("canvas");
  c.width = c.height = 32;
  const x = c.getContext("2d");
  x.drawImage(image, 0, 0, 32, 32);
  const sample = (y) => {
    const d = x.getImageData(13, y, 7, 2).data,
      rgb = [0, 0, 0];
    for (let i = 0; i < d.length; i += 4)
      for (let k = 0; k < 3; k++) rgb[k] += d[i + k];
    return (
      "#" +
      rgb
        .map((v) =>
          Math.round(v / (d.length / 4))
            .toString(16)
            .padStart(2, "0"),
        )
        .join("")
    );
  };
  return [sample(1), sample(6)];
}
