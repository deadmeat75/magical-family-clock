import { sharedImageURL } from "./image-url.js";
import brassEmbedded from "./assets/optimized/bezel-brass-r2.webp";
import silverEmbedded from "./assets/optimized/bezel-silver-r2.webp";
import woodEmbedded from "./assets/optimized/bezel-carved-wood-r2.webp";

const brass = sharedImageURL(brassEmbedded);
const silver = sharedImageURL(silverEmbedded);
const wood = sharedImageURL(woodEmbedded);
const sources = { brass, "aged-brass": brass, silver, wood },
  loads = new Map(),
  cache = new Map();
function load(url) {
  if (loads.has(url)) return loads.get(url);
  const p = new Promise((resolve, reject) => {
    const i = new Image();
    i.onload = () => {
      const c = document.createElement("canvas");
      c.width = i.width;
      c.height = i.height;
      const ctx = c.getContext("2d");
      ctx.drawImage(i, 0, 0);
      const data = ctx.getImageData(0, 0, c.width, c.height).data,
        cx = c.width / 2,
        cy = c.height / 2,
        max = Math.min(cx, cy),
        bounds = [];
      // Each ray samples the actual hand-carved rim once. There is no repeated
      // square grain tile. Radial mapping preserves it at editable bezel widths.
      for (let a = 0; a < 2048; a++) {
        const angle = (a / 2048) * Math.PI * 2,
          dx = Math.cos(angle),
          dy = Math.sin(angle);
        let inner = max * 0.7,
          outer = max * 0.98,
          found = false;
        for (let r = max * 0.35; r < max; r++) {
          const x = Math.floor(cx + dx * r),
            y = Math.floor(cy + dy * r),
            alpha = data[(y * c.width + x) * 4 + 3];
          if (alpha > 100) {
            if (!found) inner = r;
            outer = r;
            found = true;
          }
        }
        bounds.push({ inner, outer });
      }
      resolve({ data, width: c.width, cx, cy, bounds });
    };
    i.onerror = () => {
      loads.delete(url);
      reject(Error("Bezel artwork unavailable"));
    };
    i.src = url;
  });
  loads.set(url, p);
  return p;
}
export async function renderBezelArtwork(node, material, width, radius) {
  const url = sources[material];
  if (!url) return;
  const key = material + ":" + width + ":" + radius;
  if (!cache.has(key))
    cache.set(
      key,
      (async () => {
        const source = await load(url),
          size = 1024,
          c = document.createElement("canvas");
        c.width = c.height = size;
        const ctx = c.getContext("2d"),
          pixels = ctx.createImageData(size, size),
          inner = (radius - width / 2) / (radius + width / 2),
          outer = size / 2 - 1,
          innerR = inner * outer;
        for (let y = 0; y < size; y++)
          for (let x = 0; x < size; x++) {
            const dx = x + 0.5 - size / 2,
              dy = y + 0.5 - size / 2,
              r = Math.hypot(dx, dy);
            if (r < innerR || r > outer) continue;
            const angle = (Math.atan2(dy, dx) + Math.PI * 2) % (Math.PI * 2),
              b =
                source.bounds[
                  Math.floor((angle / (Math.PI * 2)) * 2048) % 2048
                ],
              sr =
                b.inner +
                ((b.outer - b.inner) * (r - innerR)) / (outer - innerR),
              sx = Math.floor(source.cx + Math.cos(angle) * sr),
              sy = Math.floor(source.cy + Math.sin(angle) * sr),
              p = (y * size + x) * 4,
              s = (sy * source.width + sx) * 4;
            pixels.data[p] = source.data[s];
            pixels.data[p + 1] = source.data[s + 1];
            pixels.data[p + 2] = source.data[s + 2];
            pixels.data[p + 3] =
              Math.min(1, (r - innerR) * 1.5, (outer - r) * 1.5) *
              source.data[s + 3];
          }
        ctx.putImageData(pixels, 0, 0);
        return c.toDataURL();
      })(),
    );
  const href = await cache.get(key);
  if (node.isConnected) {
    node.setAttribute("href", href);
    node.dataset.materialReady = "true";
  }
  if (cache.size > 10) cache.delete(cache.keys().next().value);
}
