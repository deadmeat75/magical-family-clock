// Reproducible runtime crops of approved source artwork. Source and review
// examples remain byte-for-byte unchanged; only packaging derivatives are made.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
const root = "docs/visual-review",
  inventory = JSON.parse(readFileSync(root + "/inventory.json")),
  approvals = JSON.parse(readFileSync(root + "/approvals.json"));
const decisions = new Map(approvals.items.map((i) => [i.id, i]));
const selected = inventory.filter(
  (i) =>
    /^(C\d+|H\d+|M\d+|I\d+|S\d+|F02)$/.test(i.id) &&
    decisions.get(i.id).decision === "approved",
);
const browser = await chromium.launch({
  executablePath: process.env.MFC_CHROMIUM || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const page = await browser.newPage();
await page.goto(process.env.MFC_ASSET_BASE || "http://127.0.0.1:5173");
mkdirSync("src/assets/approved", { recursive: true });
const manifest = [],
  shapes = {};
for (const item of selected) {
  const output = await page.evaluate(async (item) => {
    const image = new Image();
    image.src = "/docs/visual-review/" + item.source;
    await image.decode();
    const [x, y, w, h] = item.sourceRect || [0, 0, image.width, image.height];
    let canvas = document.createElement("canvas");
    canvas.width = Math.round(w);
    canvas.height = Math.round(h);
    let ctx = canvas.getContext("2d");
    ctx.drawImage(image, x, y, w, h, 0, 0, canvas.width, canvas.height);
    let crop = [0, 0, canvas.width, canvas.height];
    if (/^[CHIM]/.test(item.id)) {
      const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      let minX = canvas.width,
        minY = canvas.height,
        maxX = 0,
        maxY = 0;
      for (let y = 0; y < canvas.height; y++)
        for (let x = 0; x < canvas.width; x++)
          if (d[(y * canvas.width + x) * 4 + 3] > 12) {
            minX = Math.min(minX, x);
            minY = Math.min(minY, y);
            maxX = Math.max(maxX, x);
            maxY = Math.max(maxY, y);
          }
      minX = Math.max(0, minX - 2);
      minY = Math.max(0, minY - 2);
      maxX = Math.min(canvas.width - 1, maxX + 2);
      maxY = Math.min(canvas.height - 1, maxY + 2);
      crop = [minX, minY, maxX - minX + 1, maxY - minY + 1];
      const trimmed = document.createElement("canvas");
      trimmed.width = crop[2];
      trimmed.height = crop[3];
      trimmed
        .getContext("2d")
        .drawImage(canvas, ...crop, 0, 0, crop[2], crop[3]);
      canvas = trimmed;
      ctx = canvas.getContext("2d");
    }
    let shape = null;
    if (item.id[0] === "H") {
      const height = 320,
        width = Math.round((canvas.width * height) / canvas.height),
        small = document.createElement("canvas");
      small.width = width;
      small.height = height;
      const s = small.getContext("2d");
      s.drawImage(canvas, 0, 0, width, height);
      const pixels = s.getImageData(0, 0, width, height).data,
        mask = new Uint8Array(width * height);
      for (let i = 0; i < mask.length; i++)
        mask[i] = pixels[i * 4 + 3] > 80 ? 1 : 0;
      const seen = new Uint8Array(mask.length),
        holes = [];
      for (let n = 0; n < mask.length; n++)
        if (!mask[n] && !seen[n]) {
          const queue = [n];
          seen[n] = 1;
          let sx = 0,
            sy = 0,
            touch = false;
          for (let k = 0; k < queue.length; k++) {
            const p = queue[k],
              x = p % width,
              y = Math.floor(p / width);
            sx += x;
            sy += y;
            if (!x || !y || x === width - 1 || y === height - 1) touch = true;
            for (const q of [
              x ? p - 1 : -1,
              x < width - 1 ? p + 1 : -1,
              p - width,
              p + width,
            ])
              if (q >= 0 && q < mask.length && !mask[q] && !seen[q]) {
                seen[q] = 1;
                queue.push(q);
              }
          }
          if (!touch && queue.length > 8 && sy / queue.length > height * 0.62)
            holes.push({
              x: sx / queue.length + 0.5,
              y: sy / queue.length + 0.5,
              area: queue.length,
            });
        }
      holes.sort((a, b) => b.area - a.area);
      const pivot = holes[0] || { x: width / 2, y: height * 0.86 };
      const edges = new Map();
      const add = (x, y, a, b) => {
        const key = x + "," + y;
        const list = edges.get(key) || [];
        list.push([a, b]);
        edges.set(key, list);
      };
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++)
          if (mask[y * width + x]) {
            if (!y || !mask[(y - 1) * width + x]) add(x, y, x + 1, y);
            if (x === width - 1 || !mask[y * width + x + 1])
              add(x + 1, y, x + 1, y + 1);
            if (y === height - 1 || !mask[(y + 1) * width + x])
              add(x + 1, y + 1, x, y + 1);
            if (!x || !mask[y * width + x - 1]) add(x, y + 1, x, y);
          }
      const contours = [];
      while (edges.size) {
        const start = edges.keys().next().value;
        let key = start,
          points = [];
        for (let limit = 0; limit < 20000; limit++) {
          const list = edges.get(key);
          if (!list?.length) break;
          const [x, y] = key.split(",").map(Number);
          points.push([x, y]);
          const next = list.pop();
          if (!list.length) edges.delete(key);
          key = next.join(",");
          if (key === start) break;
        }
        if (points.length < 12) continue;
        points = points.filter((p, i, a) => {
          const prev = a[(i + a.length - 1) % a.length],
            next = a[(i + 1) % a.length];
          return (
            (p[0] - prev[0]) * (next[1] - p[1]) !==
            (p[1] - prev[1]) * (next[0] - p[0])
          );
        });
        if (points.length >= 3)
          contours.push(
            points.map(([x, y]) => [
              +((x - pivot.x) / pivot.y).toFixed(5),
              +((y - pivot.y) / pivot.y).toFixed(5),
            ]),
          );
      }
      shape = {
        width: canvas.width,
        height: canvas.height,
        pivot: [pivot.x / width, pivot.y / height],
        contours,
      };
    }
    return {
      data: canvas.toDataURL("image/webp", 0.96).split(",")[1],
      width: canvas.width,
      height: canvas.height,
      crop,
      shape,
    };
  }, item);
  const file = "src/assets/approved/" + item.id + ".webp";
  writeFileSync(file, Buffer.from(output.data, "base64"));
  const sourceHash = createHash("sha256")
    .update(readFileSync(root + "/" + item.source))
    .digest("hex");
  manifest.push({
    id: item.id,
    name: item.name,
    source: item.source,
    sourceRect: item.sourceRect,
    source_sha256: sourceHash,
    width: output.width,
    height: output.height,
    crop: output.crop,
    runtime: file,
    sha256: createHash("sha256").update(readFileSync(file)).digest("hex"),
  });
  if (output.shape) shapes[item.name] = output.shape;
  console.log(item.id, output.width, output.height);
}
writeFileSync(
  "src/assets/approved/manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
writeFileSync(
  "src/approved-shapes.js",
  "// Source-registered matte contours and pivot holes from approved hand artwork.\nexport const approvedShapes = " +
    JSON.stringify(shapes) +
    ";\n",
);
await browser.close();
