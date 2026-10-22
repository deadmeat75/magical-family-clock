import { skyline, skyPath } from "./world-paths.js";

// Fit one continuous contour to the exact source image. Independent per-column
// edge picks can jump between a mountain and a cloud, producing jagged cutouts.
// Dynamic programming preserves a connected skyline while retaining fine spires.
export function registeredSkyPath(image) {
  const c = document.createElement("canvas");
  c.width = c.height = 1254;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(image, 0, 0, 1254, 1254);
  const pixels = ctx.getImageData(0, 0, 1254, 1254).data;
  const channel = (x, y, k) =>
    pixels[(Math.max(0, Math.min(1253, Math.round(y))) * 1254 + x) * 4 + k];
  const band = 24,
    count = band * 2 + 1,
    width = 1254;
  const guide = [],
    parent = new Int16Array(width * count);
  let segment = 0,
    previous = new Float64Array(count);
  for (let x = 0; x < width; x++) {
    while (segment < skyline.length - 2 && skyline[segment + 1][0] < x)
      segment++;
    const [x0, y0] = skyline[segment],
      [x1, y1] = skyline[segment + 1];
    const prior = y0 + ((y1 - y0) * (x - x0)) / Math.max(1, x1 - x0);
    guide.push(prior);
    const current = new Float64Array(count);
    for (let s = 0; s < count; s++) {
      const y = prior + s - band;
      let difference = 0;
      for (let k = 0; k < 3; k++)
        difference += (channel(x, y + 1, k) - channel(x, y - 1, k)) ** 2;
      const local = -Math.sqrt(difference) + Math.abs(s - band) * 1.5;
      if (!x) {
        current[s] = local;
        continue;
      }
      let best = Infinity,
        from = 0;
      for (let q = Math.max(0, s - 4); q <= Math.min(count - 1, s + 4); q++) {
        const delta = prior - guide[x - 1] + s - q;
        // Source mountain ridges are continuous; tower edges follow the traced
        // guide's sharper slopes. Neither can sprout isolated vertical spikes.
        const cost =
          previous[q] +
          Math.abs(s - q) * 9 +
          Math.abs(delta) * (x < 350 || x > 840 ? 3 : 1);
        if (cost < best) {
          best = cost;
          from = q;
        }
      }
      current[s] = local + best;
      parent[x * count + s] = from;
    }
    previous = current;
  }
  let state = 0;
  for (let s = 1; s < count; s++) if (previous[s] < previous[state]) state = s;
  const points = new Array(width);
  for (let x = width - 1; x >= 0; x--) {
    points[x] = [x, guide[x] + state - band + 0.5];
    state = parent[x * count + state];
  }
  return skyPath(points);
}
