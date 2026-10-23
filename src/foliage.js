// Regions follow the actual tree crowns in the 1254px bundled composition.
// root is the fixed trunk base; padding contains both sides of a bending crown.
export const FOLIAGE_REGIONS = [
  { x: 347, top: 560, root: 676, halfWidth: 34, bend: 5.6 },
  { x: 895, top: 480, root: 611, halfWidth: 40, bend: 5.8 },
  { x: 980, top: 588, root: 696, halfWidth: 33, bend: 5.3 },
  { x: 559, top: 570, root: 685, halfWidth: 35, bend: 5.6 },
  { x: 289, top: 602, root: 730, halfWidth: 55, bend: 4.8 },
  { x: 782, top: 632, root: 760, halfWidth: 68, bend: 4.6 },
  { x: 230, top: 1002, root: 1230, halfWidth: 120, bend: 6.2 },
  { x: 1095, top: 1010, root: 1250, halfWidth: 120, bend: 6.2 },
];
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const sourceScale = 1254 / 384;
export function foliageOffset(region, index, y, time, intensity) {
  const height = clamp((region.root - y) / (region.root - region.top), 0, 1),
    phase = index * 1.9,
    wind =
      0.68 * Math.sin(time * 0.72 + phase) +
      0.24 * Math.sin(time * 0.37 + phase * 0.6) +
      0.08 * Math.sin(time * 1.57 + phase * 1.3),
    flutter = 0.16 * Math.sin(time * 2.3 + y * 0.11 + phase);
  return (
    intensity * (region.bend * wind * height ** 1.6 + flutter * height ** 1.2)
  );
}
function surface(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.ceil(w * 2);
  c.height = Math.ceil(h * 2);
  return c;
}
export function createFoliagePainter(image) {
  // Extract foliage before bending it. Rectangular photo patches also contain
  // stationary sky and mountains, which must never move with a tree crown.
  const foliage = document.createElement("canvas");
  foliage.width = foliage.height = 1254;
  const source = foliage.getContext("2d", { willReadFrequently: true });
  source.drawImage(image, 0, 0, 1254, 1254);
  const vegetation = source.getImageData(0, 0, 1254, 1254);
  for (let i = 0; i < vegetation.data.length; i += 4) {
    const r = vegetation.data[i],
      g = vegetation.data[i + 1],
      b = vegetation.data[i + 2];
    const green = Math.min(g - r * 0.9, g - b * 1.08);
    vegetation.data[i + 3] *= clamp(green / 12, 0, 1);
  }
  source.putImageData(vegetation, 0, 0);
  const patches = FOLIAGE_REGIONS.map((region) => {
    const sx = region.x - region.halfWidth,
      sy = region.top - 10,
      width = (region.halfWidth * 2) / sourceScale,
      height = (region.root - sy + 10) / sourceScale,
      tile = surface(width, height),
      mask = surface(width, height),
      ctx = tile.getContext("2d"),
      mc = mask.getContext("2d"),
      pixels = mc.createImageData(mask.width, mask.height);
    // Feather only the patch perimeter. The crown itself fully replaces the
    // stationary pixels rather than ghosting a shifted copy over the old tree.
    for (let y = 0; y < mask.height; y++)
      for (let x = 0; x < mask.width; x++) {
        const edge = clamp(
            Math.min(x, y, mask.width - 1 - x, mask.height - 1 - y) / 4,
            0,
            1,
          ),
          p = (y * mask.width + x) * 4;
        pixels.data[p] = pixels.data[p + 1] = pixels.data[p + 2] = 255;
        pixels.data[p + 3] = 255 * edge * edge * (3 - 2 * edge);
      }
    mc.putImageData(pixels, 0, 0);
    const padding = 24,
      texture = surface(width + padding * 2, height);
    texture
      .getContext("2d")
      .drawImage(
        foliage,
        sx - padding * sourceScale,
        sy,
        (width + padding * 2) * sourceScale,
        height * sourceScale,
        0,
        0,
        texture.width,
        texture.height,
      );
    return { region, sx, sy, width, height, tile, mask, ctx, texture, padding };
  });
  // The small prepared patches now own all pixels needed for animation.
  foliage.width = foliage.height = 0;
  return {
    draw(target, time, intensity, quality) {
      const count = quality === "balanced" ? 4 : patches.length;
      for (let i = 0; i < count; i++) {
        const p = patches[i],
          { ctx, width, height } = p,
          scaleX = p.tile.width / width,
          scaleY = p.tile.height / height;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.clearRect(0, 0, p.tile.width, p.tile.height);
        ctx.setTransform(scaleX, 0, 0, scaleY, 0, 0);
        // Thin continuous strips bend progressively toward the crown. Trunks
        // and ground have zero displacement; no whole-tree translation occurs.
        for (let y = 0; y < height; y += 0.5) {
          const sy = p.sy + y * sourceScale,
            dx = foliageOffset(p.region, i, sy, time, intensity);
          ctx.drawImage(
            p.texture,
            ((p.padding - dx) * p.texture.width) / (width + p.padding * 2),
            y * scaleY,
            (width * p.texture.width) / (width + p.padding * 2),
            0.5 * scaleY,
            0,
            y,
            width,
            0.51,
          );
        }
        ctx.globalCompositeOperation = "destination-in";
        ctx.drawImage(p.mask, 0, 0, width, height);
        ctx.globalCompositeOperation = "source-over";
        target.drawImage(
          p.tile,
          108 + p.sx / sourceScale,
          90 + p.sy / sourceScale,
          width,
          height,
        );
      }
    },
  };
}
