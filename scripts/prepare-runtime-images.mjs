// Encode deployment derivatives without resizing or changing original sources.
// The approved PNGs remain untouched and their source hashes are recorded.
import { chromium } from "@playwright/test";
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
const names = [
  "aged-brass-dial",
  "bezel-brass-r2",
  "bezel-carved-wood-r2",
  "bezel-silver-r2",
  "castle-day-hd",
  "castle-winter-hd",
  "hand-attachments",
  "lunar-surface-r1",
  "panel-material-textures-r1",
  "panel-solid-wood-r4",
  "whimsical-workshop-dial",
];
const b = await chromium.launch({
  executablePath: process.env.MFC_CHROMIUM || "/usr/bin/chromium",
  args: ["--no-sandbox"],
});
const p = await b.newPage();
await p.goto(process.env.MFC_ASSET_BASE || "http://127.0.0.1:5173");
mkdirSync("src/assets/optimized", { recursive: true });
const manifest = [];
for (const name of names) {
  const { data, width, height } = await p.evaluate(async (name) => {
    const i = new Image();
    i.src = "/src/assets/" + name + ".png";
    await i.decode();
    const c = document.createElement("canvas");
    c.width = i.width;
    c.height = i.height;
    c.getContext("2d").drawImage(i, 0, 0);
    return {
      data: c.toDataURL("image/webp", 0.99).split(",")[1],
      width: c.width,
      height: c.height,
    };
  }, name);
  const source = "src/assets/" + name + ".png",
    runtime = "src/assets/optimized/" + name + ".webp";
  writeFileSync(runtime, Buffer.from(data, "base64"));
  const hash = (p) =>
    createHash("sha256").update(readFileSync(p)).digest("hex");
  manifest.push({
    source,
    source_sha256: hash(source),
    runtime,
    sha256: hash(runtime),
    width,
    height,
  });
  console.log(name, readFileSync(runtime).length);
}
writeFileSync(
  "src/assets/optimized/manifest.json",
  JSON.stringify(manifest, null, 2) + "\n",
);
await b.close();
