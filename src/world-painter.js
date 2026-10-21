import { sceneSource } from "./artwork.js";
const sources = new Map();
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function canvas(width, height) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}
async function loadSource(scene) {
  const url = sceneSource(scene);
  if (!sources.has(url))
    sources.set(
      url,
      new Promise((resolve, reject) => {
        const image = new Image();
        image.onload = () => {
          // A pair of tower-free sky regions provides real, softly keyed cloud detail.
          // Their edges feather to transparency; tiling therefore has no visible seam.
          const tile = canvas(1024, 512),
            ctx = tile.getContext("2d");
          for (const [sx, sy, sw, sh, dx, dy, dw, dh] of [
            [0, 0, 420, 430, 0, 45, 500, 450],
            [835, 0, 419, 430, 510, 0, 514, 470],
          ]) {
            const part = canvas(sw, sh),
              pc = part.getContext("2d");
            pc.drawImage(image, sx, sy, sw, sh, 0, 0, sw, sh);
            const pixels = pc.getImageData(0, 0, sw, sh),
              d = pixels.data;
            for (let y = 0; y < sh; y++)
              for (let x = 0; x < sw; x++) {
                const i = (y * sw + x) * 4,
                  alpha = clamp(
                    (d[i] - 0.18 * d[i + 2]) / (0.76 * d[i + 2] || 1),
                    0,
                    1,
                  );
                const edge = clamp(
                  Math.min(x, sw - 1 - x, y, sh - 1 - y) / 25,
                  0,
                  1,
                );
                const shade = 220 + d[i] * 0.13;
                d[i] = shade;
                d[i + 1] = shade + 2;
                d[i + 2] = shade + 5;
                d[i + 3] = 255 * alpha * edge;
              }
            pc.putImageData(pixels, 0, 0);
            ctx.drawImage(part, dx, dy, dw, dh);
          }
          resolve({ image, clouds: tile });
        };
        image.onerror = () => {
          sources.delete(url);
          reject(Error("World texture failed to load"));
        };
        image.src = url;
      }),
    );
  return sources.get(url);
}
const fraction = (v) => v - Math.floor(v);
function drawClouds(ctx, texture, t) {
  // Both decks advect in one direction at different wind speeds. There is no
  // pendulum reversal and no fixed cloud photograph below these layers.
  for (const [speed, y, height, opacity] of [
    [0.9, 65, 170, 0.23],
    [3.4, 82, 185, 0.88],
  ]) {
    const width = 512,
      offset = (t * speed) % width;
    ctx.globalAlpha = opacity;
    for (let i = -1; i <= 1; i++)
      ctx.drawImage(texture, 108 + offset + i * width, y, width, height);
  }
  ctx.globalAlpha = 1;
}
function drawLake(ctx, image, t, intensity, quality) {
  const step = quality === "light" ? 1 : 0.5;
  for (let y = 353; y < 474; y += step) {
    const depth = clamp((y - 353) / 121, 0, 1),
      amplitude = (0.04 + 0.7 * depth ** 1.35) * intensity;
    const dx =
      amplitude *
      (Math.sin(y * 0.73 - t * 1.9) + 0.32 * Math.sin(y * 0.19 + t * 0.83));
    const dy = 0.12 * depth * Math.sin(y * 0.31 - t * 0.7);
    const sy = ((y - 90 + dy) * 1254) / 384;
    ctx.drawImage(
      image,
      0,
      sy,
      1254,
      (step * 1254) / 384,
      108 + dx,
      y,
      384,
      step + 0.02,
    );
  }
}
function drawFalls(ctx, t, intensity, night, quality) {
  ctx.strokeStyle = night ? "#aebfcf" : "#f0f7f7";
  ctx.fillStyle = night ? "#b7c6d3" : "#e8f4f4";
  const count = quality === "light" ? 12 : 28;
  for (const [index, x0, y0, x1, y1, width] of [
    [0, 210, 315, 201, 349, 7],
    [1, 333, 319, 335, 352, 9],
  ]) {
    for (let i = 0; i < count; i++) {
      const seed = i * 17.371 + index * 37,
        phase = fraction(t * (0.55 + (i % 5) * 0.035) + seed);
      const lane = ((i * 7) % count) / count - 0.5,
        spread = width * (0.35 + phase * 0.65);
      const y = y0 + (y1 - y0) * phase ** 1.45,
        x = x0 + (x1 - x0) * phase + lane * spread;
      ctx.globalAlpha =
        (0.06 + 0.19 * Math.sin(Math.PI * phase)) * Math.min(1.3, intensity);
      ctx.lineWidth = 0.18 + (i % 3) * 0.12;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (x1 - x0) * 0.025, y + 1.3 + phase * 2.1);
      ctx.stroke();
    }
    // Fine ballistic droplets stay close to each impact point. No filled discs,
    // expanding spotlights or translated copies of the surrounding rocks.
    for (let i = 0; i < 18; i++) {
      const p = fraction(t * (0.8 + (i % 4) * 0.08) + i * 0.137),
        v = ((i * 11) % 19) / 9 - 1;
      ctx.globalAlpha = 0.11 * Math.sin(Math.PI * p) * intensity;
      ctx.beginPath();
      ctx.arc(
        x1 + v * p * 4,
        y1 - 3.8 * p * (1 - p),
        0.12 + (i % 3) * 0.07,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
export function startWorldPainter(
  root,
  config,
  scene,
  { time = 0, paused = () => false } = {},
) {
  const entries = [...root.querySelectorAll("canvas[data-world-paint]")].map(
    (c) => {
      const size = config.world.quality === "light" ? 384 : 768;
      c.width = size;
      c.height = size;
      return { canvas: c, kind: c.dataset.worldPaint, ctx: c.getContext("2d") };
    },
  );
  let raf = 0,
    ended = false,
    last = performance.now(),
    lastPaint = 0,
    t = time,
    tick = 0,
    source;
  const paint = () => {
    if (!source || ended) return;
    const intensity = clamp(config.scene_intensity ?? 0.65, 0.15, 1.5);
    for (const { canvas: c, ctx, kind } of entries) {
      if (!ctx) continue;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, c.width, c.height);
      ctx.setTransform(
        c.width / 384,
        0,
        0,
        c.height / 384,
        (-108 * c.width) / 384,
        (-90 * c.height) / 384,
      );
      if (kind === "clouds") drawClouds(ctx, source.clouds, t);
      if (kind === "water")
        drawLake(ctx, source.image, t, intensity, config.world.quality);
      if (kind === "waterfalls")
        drawFalls(
          ctx,
          t,
          intensity,
          scene.period === "night",
          config.world.quality,
        );
      c.dataset.paintTick = String(++tick);
      c.dataset.worldTime = t.toFixed(3);
    }
  };
  const step = (now) => {
    if (ended || !root.isConnected) return;
    const delta = Math.min((now - last) / 1000, 0.1);
    last = now;
    if (!paused()) {
      t += delta * (config.motion_speed || 1);
      const fps =
        config.world.quality === "light"
          ? 12
          : config.world.quality === "balanced"
            ? 18
            : 24;
      if (now - lastPaint > 1000 / fps) {
        paint();
        lastPaint = now;
      }
    }
    raf = requestAnimationFrame(step);
  };
  const ready = entries.length
    ? loadSource(scene)
        .then((s) => {
          source = s;
          paint();
          if (!ended) raf = requestAnimationFrame(step);
        })
        .catch(() => {})
    : Promise.resolve();
  return {
    ready,
    seek(seconds) {
      t = seconds;
      paint();
    },
    stop() {
      ended = true;
      cancelAnimationFrame(raf);
      return t;
    },
    get time() {
      return t;
    },
  };
}
export function captureWorldAnimations(root) {
  const result = new Map();
  if (!root) return result;
  for (const object of root.querySelectorAll(".world-object")) {
    const values = object
      .getAnimations({ subtree: true })
      .map((a) => ({
        phase: a.effect.getComputedTiming().progress,
        kind: a.effect.target.getAttribute("class"),
      }));
    result.set(object.dataset.worldId, values);
  }
  return result;
}
export function restoreWorldAnimations(root, snapshot) {
  for (const object of root.querySelectorAll(".world-object")) {
    const values = snapshot?.get(object.dataset.worldId);
    if (!values) continue;
    for (const [i, a] of object.getAnimations({ subtree: true }).entries()) {
      const v = values[i],
        timing = a.effect.getTiming();
      if (
        v?.phase == null ||
        v.kind !== a.effect.target.getAttribute("class") ||
        !Number.isFinite(timing.duration)
      )
        continue;
      a.currentTime =
        (((timing.delay + timing.duration * v.phase) % timing.duration) +
          timing.duration) %
        timing.duration;
    }
  }
}
