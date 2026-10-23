import textureURL from "./assets/optimized/lunar-surface-r1.webp";
let texture;
const cache = new Map();
async function lunarTexture() {
  return (texture ??= new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const c = document.createElement("canvas");
      c.width = c.height = 256;
      const ctx = c.getContext("2d");
      ctx.drawImage(image, 0, 0, 256, 256);
      resolve(ctx.getImageData(0, 0, 256, 256).data);
    };
    image.onerror = () => {
      texture = undefined;
      reject(Error("Lunar texture unavailable"));
    };
    image.src = textureURL;
  }));
}
export async function lunarImage(phase) {
  // The texture never rotates or changes between phases. A sphere's surface
  // normals and the sun direction determine both terminator and limb shading.
  const key = Number(phase).toFixed(5);
  if (cache.has(key)) return cache.get(key);
  const source = await lunarTexture(),
    c = document.createElement("canvas");
  c.width = c.height = 256;
  const ctx = c.getContext("2d"),
    pixels = ctx.createImageData(256, 256),
    sunX = Math.sin(phase * Math.PI * 2),
    sunZ = -Math.cos(phase * Math.PI * 2);
  for (let y = 0; y < 256; y++)
    for (let x = 0; x < 256; x++) {
      const nx = (x + 0.5 - 128) / 127,
        ny = (y + 0.5 - 128) / 127,
        r2 = nx * nx + ny * ny,
        i = (y * 256 + x) * 4;
      if (r2 >= 1) continue;
      const z = Math.sqrt(1 - r2),
        light = Math.max(0, nx * sunX + z * sunZ),
        // Lunar regolith backscatters: broad readable detail, a soft terminator,
        // while the unlit hemisphere reveals the actual sky beneath it.
        shade = 0.18 + 0.82 * Math.pow(light, 0.48);
      for (let k = 0; k < 3; k++)
        pixels.data[i + k] = Math.min(255, source[i + k] * shade * 1.12);
      pixels.data[i + 3] =
        Math.min(1, (1 - Math.sqrt(r2)) * 127) *
        Math.min(1, light / 0.025) *
        255;
    }
  ctx.putImageData(pixels, 0, 0);
  const url = c.toDataURL();
  cache.set(key, url);
  if (cache.size > 32) cache.delete(cache.keys().next().value);
  return url;
}
export async function renderMoons(root) {
  await Promise.all(
    [...root.querySelectorAll("image[data-lunar-phase]")].map(async (node) => {
      const url = await lunarImage(Number(node.dataset.lunarPhase));
      if (node.isConnected) node.setAttribute("href", url);
    }),
  );
}
