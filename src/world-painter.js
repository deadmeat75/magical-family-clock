import { sceneSource } from "./artwork.js";
import { createMeteorTimeline } from "./meteors.js";
const sources = new Map();
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
function canvas(width, height) {
  const c = document.createElement("canvas");
  c.width = width;
  c.height = height;
  return c;
}
function windowSources(image) {
  const size = 768, scale = size / 384,
    texture = canvas(size, size), ctx = texture.getContext("2d"),
    castle = new Path2D("M236 308V245H251V202H272V178H300V167H310V140H326V213H344V262H357V309Z");
  ctx.drawImage(image, 0, 0, size, size);
  const pixels = ctx.getImageData(0, 0, size, size), d = pixels.data,
    seen = new Uint8Array(size * size), lights = [];
  for (let y = 0; y < size; y++)
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      d[i + 3] = ctx.isPointInPath(castle, 108 + x / scale, 90 + y / scale)
        ? 255 * clamp((d[i] - d[i + 2] - 65) / 65, 0, 1)
          * clamp((d[i + 1] - d[i + 2] - 30) / 55, 0, 1)
        : 0;
    }
  // Connected warm glass regions retain the actual painted window shapes.
  // Each gets an independent light source rather than one whole-photo pulse.
  for (let n = 0; n < seen.length; n++) {
    if (seen[n] || d[n * 4 + 3] < 35) continue;
    const queue = [n], members = [];
    let minX = size, minY = size, maxX = 0, maxY = 0;
    seen[n] = 1;
    for (let head = 0; head < queue.length; head++) {
      const p = queue[head], x = p % size, y = Math.floor(p / size);
      members.push(p);
      minX = Math.min(minX, x); maxX = Math.max(maxX, x);
      minY = Math.min(minY, y); maxY = Math.max(maxY, y);
      for (const q of [x > 0 ? p - 1 : -1, x < size - 1 ? p + 1 : -1, p - size, p + size])
        if (q >= 0 && q < seen.length && !seen[q] && d[q * 4 + 3] >= 35) {
          seen[q] = 1; queue.push(q);
        }
    }
    if (members.length < 3) continue;
    const w = maxX - minX + 1, h = maxY - minY + 1,
      tile = canvas(w, h), tc = tile.getContext("2d"), light = tc.createImageData(w, h);
    for (const p of members) {
      const target = ((Math.floor(p / size) - minY) * w + p % size - minX) * 4;
      light.data.set(d.subarray(p * 4, p * 4 + 4), target);
    }
    tc.putImageData(light, 0, 0);
    lights.push({ tile, x: 108 + minX / scale, y: 90 + minY / scale, w: w / scale, h: h / scale });
  }
  return lights;
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
          const cloudMask = canvas(1024, 512),
            mask = cloudMask.getContext("2d");
          mask.drawImage(tile, 0, 0);
          const coverage = mask.getImageData(0, 0, 1024, 512);
          for (let i = 3; i < coverage.data.length; i += 4)
            coverage.data[i] = 255 * clamp((coverage.data[i] / 255 - 0.01) / 0.025, 0, 1);
          mask.putImageData(coverage, 0, 0);
          resolve({ image, clouds: tile, cloudMask, windows: windowSources(image) });
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
function drawClouds(ctx, texture, t, occlusion = false) {
  // Both decks advect in one direction at different wind speeds. There is no
  // pendulum reversal and no fixed cloud photograph below these layers.
  for (const [speed, y, height, opacity] of [
    [0.9, 65, 170, 0.23],
    [3.4, 82, 185, 0.88],
  ]) {
    const width = 512,
      offset = (t * speed) % width;
    ctx.globalAlpha = occlusion ? 1 : opacity;
    for (let i = -1; i <= 1; i++)
      ctx.drawImage(texture, 108 + offset + i * width, y, width, height);
  }
  ctx.globalAlpha = 1;
}
function drawStars(ctx, t, quality) {
  const count = quality === "light" ? 24 : 64;
  for (let i = 0; i < count; i++) {
    const x = 112 + ((i * 97) % 375),
      y = 92 + ((i * 37) % 136),
      twinkle = (0.5 + 0.5 * Math.sin(t * (0.9 + (i % 6) * 0.17) + i * 2.41)) ** 1.5,
      r = (i % 9 === 0 ? 1.25 : 0.48 + (i % 4) * 0.2) * (0.85 + twinkle * 0.25);
    ctx.globalAlpha = 0.12 + twinkle * 0.88;
    ctx.fillStyle = i % 3 === 0 ? "#fff0bb" : "#edf5ff";
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    if (i % 13 === 0) {
      ctx.strokeStyle = "#fff4d2";
      ctx.lineWidth = 0.35;
      ctx.beginPath();
      ctx.moveTo(x - r * 2.7, y);
      ctx.lineTo(x + r * 2.7, y);
      ctx.moveTo(x, y - r * 2.7);
      ctx.lineTo(x, y + r * 2.7);
      ctx.stroke();
    }
  }
  ctx.globalAlpha = 1;
}
function drawWindows(ctx, lights, t) {
  for (let i = 0; i < lights.length; i++) {
    const light = lights[i], phase = i * 2.39996;
    ctx.globalAlpha = clamp(0.58
      + 0.21 * Math.sin(t * (7.3 + (i % 7) * 0.91) + phase)
      + 0.12 * Math.sin(t * (13.1 + (i % 5) * 1.13) + phase * 0.61)
      + 0.07 * Math.sin(t * (2.6 + (i % 3) * 0.37) + phase * 1.9), 0.2, 0.98);
    ctx.drawImage(light.tile, light.x, light.y, light.w, light.h);
  }
  ctx.globalAlpha = 1;
}
function drawFireflies(ctx, t, quality) {
  const count = quality === "light" ? 5 : quality === "balanced" ? 8 : 12;
  for (let i = 0; i < count; i++) {
    const phase = i * 2.39996,
      x = (i % 2 ? 420 : 173) + (i % 3) * 7
        + Math.sin(t * (0.29 + (i % 4) * 0.04) + phase) * 6
        + Math.sin(t * 0.73 + phase * 1.7) * 2,
      y = 397 + (i % 4) * 8 + Math.sin(t * 0.43 + phase) * 4,
      pulse = (0.5 + 0.5 * Math.sin(t * (0.8 + (i % 5) * 0.13) + phase)) ** 4,
      glow = ctx.createRadialGradient(x, y, 0, x, y, 2.7);
    ctx.globalAlpha = 0.08 + pulse * 0.92;
    glow.addColorStop(0, "rgba(196,255,151,.65)");
    glow.addColorStop(0.22, "rgba(133,222,100,.28)");
    glow.addColorStop(1, "rgba(91,190,75,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(x - 2.7, y - 2.7, 5.4, 5.4);
    ctx.fillStyle = "#deffc3";
    ctx.beginPath();
    ctx.arc(x, y, 0.32, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
}
function drawLake(ctx, image, t, intensity, quality) {
  const step = quality === "light" ? 1 : 0.5;
  for (let y = 353; y < 474; y += step) {
    const depth = clamp((y - 353) / 121, 0, 1),
      amplitude = (0.04 + 1.35 * depth ** 1.25) * intensity;
    const dx =
      amplitude *
      (Math.sin(y * 0.73 - t * 1.9) + 0.32 * Math.sin(y * 0.19 + t * 0.83));
    const dy = 0.2 * depth * Math.sin(y * 0.31 - t * 0.7);
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
function drawSeasonalDebris(ctx, t, intensity, season, quality) {
  if (season !== "spring" && season !== "autumn") return;
  const count = quality === "light" ? 5 : quality === "balanced" ? 9 : 14;
  const origins = [[183, 389], [242, 313], [361, 322], [427, 391]];
  for (let i = 0; i < count; i++) {
    const [ox, oy] = origins[i % origins.length],
      duration = 16 + (i % 5) * 2.7,
      p = fraction(t / duration + i * 0.38197),
      flutter = t * (1.3 + (i % 4) * 0.19) + i * 2.1,
      x = ox + p * (65 + intensity * 24) + Math.sin(flutter) * (2 + 3 * p),
      y = oy + p * 195 + Math.sin(flutter * 0.63) * 2,
      size = season === "spring" ? 0.8 + (i % 3) * 0.18 : 1.05 + (i % 3) * 0.24;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(flutter * 0.38 + Math.sin(flutter * 0.7));
    ctx.scale(0.45 + 0.55 * Math.abs(Math.cos(flutter)), 1);
    // New particles emerge within foliage; their repeat point is below the
    // opening. They never reset or disappear in the middle of open water.
    ctx.globalAlpha = Math.min(1, p * 18) * 0.87;
    ctx.fillStyle = season === "spring"
      ? ["#f8dce5", "#eeb3c8", "#fff1ed"][i % 3]
      : ["#ad602b", "#c58e37", "#8c4829"][i % 3];
    ctx.beginPath();
    ctx.moveTo(-size, 0);
    ctx.bezierCurveTo(-size * 0.4, -size, size * 0.8, -size * 0.8, size, 0);
    ctx.bezierCurveTo(size * 0.4, size * 0.8, -size * 0.7, size * 0.75, -size, 0);
    ctx.fill();
    if (season === "autumn") {
      ctx.strokeStyle = "#e0b875";
      ctx.lineWidth = 0.17;
      ctx.beginPath();
      ctx.moveTo(-size * 0.8, 0);
      ctx.lineTo(size * 0.8, 0);
      ctx.stroke();
    }
    ctx.restore();
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
      ctx.strokeStyle = i % 4 === 0
        ? (night ? "#65869e" : "#69a8b8")
        : (night ? "#c1d4e3" : "#f3fcff");
      ctx.globalAlpha =
        (0.15 + 0.6 * Math.sin(Math.PI * phase)) * Math.min(1.4, intensity + 0.25);
      ctx.lineWidth = 0.35 + (i % 3) * 0.18;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + (x1 - x0) * 0.04, Math.min(y1, y + 2.3 + phase * 4.2));
      ctx.stroke();
    }
    // Fine ballistic droplets stay close to each impact point. No filled discs,
    // expanding spotlights or translated copies of the surrounding rocks.
    for (let i = 0; i < (quality === "light" ? 16 : 34); i++) {
      const p = fraction(t * (0.8 + (i % 4) * 0.08) + i * 0.137),
        v = ((i * 11) % 19) / 9 - 1;
      ctx.globalAlpha = 0.58 * Math.sin(Math.PI * p) * Math.min(1.4, intensity + 0.35);
      ctx.beginPath();
      ctx.arc(
        x1 + v * p * 6,
        y1 - 18 * p * (1 - p),
        0.25 + (i % 3) * 0.1,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
  ctx.globalAlpha = 1;
}
function drawMeteor(ctx, event, t) {
  if (t < event.start || t > event.end) return;
  const p = (t - event.start) / event.duration,
    x = event.x + event.dx * p,
    y = event.y + event.dy * p,
    tail = Math.min(0.3, p),
    tx = x - event.dx * tail,
    ty = y - event.dy * tail,
    gradient = ctx.createLinearGradient(tx, ty, x, y);
  gradient.addColorStop(0, "rgba(190,217,255,0)");
  gradient.addColorStop(0.75, "rgba(211,231,255,.65)");
  gradient.addColorStop(1, "#fff6df");
  ctx.globalAlpha = Math.sin(Math.PI * p) ** 0.65;
  ctx.strokeStyle = gradient;
  ctx.lineWidth = 0.6;
  ctx.beginPath();
  ctx.moveTo(tx, ty);
  ctx.lineTo(x, y);
  ctx.stroke();
  ctx.fillStyle = "#fff8e7";
  ctx.beginPath();
  ctx.arc(x, y, 0.65, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}
export function startWorldPainter(
  root,
  config,
  scene,
  { time = 0, paused = () => false, meteorSeed = 1 } = {},
) {
  const meteors = createMeteorTimeline(meteorSeed);
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
      if (kind === "seasonal-debris")
        drawSeasonalDebris(ctx, t, intensity, scene.season, config.world.quality);
      if (kind === "meteors") drawMeteor(ctx, meteors.at(t), t);
      if (kind === "stars") drawStars(ctx, t, config.world.quality);
      if (kind === "windows") drawWindows(ctx, source.windows, t);
      if (kind === "fireflies") drawFireflies(ctx, t, config.world.quality);
      if ((kind === "stars" || kind === "meteors") && config.world.clouds) {
        ctx.globalCompositeOperation = "destination-out";
        drawClouds(ctx, source.cloudMask, t, true);
        ctx.globalCompositeOperation = "source-over";
      }
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
