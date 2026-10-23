import { test, expect } from "@playwright/test";

test("every F01 letter stays inside the painted gold scallops with a margin", async ({
  page,
}) => {
  await page.goto("/docs/visual-review/concepts/F01-editable-lettering-r7.svg");
  const result = await page.evaluate(async () => {
    const size = 1200,
      makeCanvas = () => {
        const c = document.createElementNS(
          "http://www.w3.org/1999/xhtml",
          "canvas",
        );
        c.width = c.height = size;
        return c;
      };
    const image = new Image();
    image.src = document.querySelector("image").getAttribute("href");
    await image.decode();
    const canvas = makeCanvas(),
      ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, size, size);
    const source = ctx.getImageData(0, 0, size, size).data;
    let gold = new Uint8Array(size * size);
    for (let n = 0; n < gold.length; n++) {
      const r = source[n * 4],
        g = source[n * 4 + 1],
        b = source[n * 4 + 2];
      gold[n] = r > 145 && g > 105 && r > b * 1.4 && g > b * 1.25 ? 1 : 0;
    }
    // Close fine decorative ink strokes so they cannot be mistaken for holes in
    // the physical face. This does not use any text or lettering placement data.
    const morph = (input, dilate) => {
      const row = new Uint8Array(input.length),
        out = new Uint8Array(input.length),
        radius = 3;
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          let value = dilate ? 0 : 1;
          for (let d = -radius; d <= radius; d++) {
            const q = Math.max(0, Math.min(size - 1, x + d));
            if (dilate) value |= input[y * size + q];
            else value &= input[y * size + q];
          }
          row[y * size + x] = value;
        }
      for (let y = 0; y < size; y++)
        for (let x = 0; x < size; x++) {
          let value = dilate ? 0 : 1;
          for (let d = -radius; d <= radius; d++) {
            const q = Math.max(0, Math.min(size - 1, y + d));
            if (dilate) value |= row[q * size + x];
            else value &= row[q * size + x];
          }
          out[y * size + x] = value;
        }
      return out;
    };
    gold = morph(morph(gold, true), false);
    const flood = (allowed, seeds) => {
      const seen = new Uint8Array(allowed.length),
        queue = new Uint32Array(allowed.length);
      let head = 0,
        tail = 0;
      for (const seed of seeds)
        if (allowed[seed] && !seen[seed]) {
          seen[seed] = 1;
          queue[tail++] = seed;
        }
      while (head < tail) {
        const n = queue[head++],
          x = n % size;
        for (const q of [
          x > 0 ? n - 1 : -1,
          x < size - 1 ? n + 1 : -1,
          n - size,
          n + size,
        ])
          if (q >= 0 && q < allowed.length && allowed[q] && !seen[q]) {
            seen[q] = 1;
            queue[tail++] = q;
          }
      }
      return seen;
    };
    const face = flood(gold, [600 * size + 600]);
    const inverse = face.map((v) => 1 - v),
      boundary = [];
    for (let i = 0; i < size; i++)
      boundary.push(i, (size - 1) * size + i, i * size, i * size + size - 1);
    const exterior = flood(inverse, boundary);
    const svg = document.documentElement.cloneNode(true);
    svg.querySelectorAll("image").forEach((n) => n.remove());
    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
        type: "image/svg+xml",
      }),
      url = URL.createObjectURL(blob),
      ink = new Image();
    ink.src = url;
    await ink.decode();
    ctx.clearRect(0, 0, size, size);
    ctx.drawImage(ink, 0, 0, size, size);
    URL.revokeObjectURL(url);
    const letters = ctx.getImageData(0, 0, size, size).data;
    let outside = 0,
      pixels = 0;
    for (let n = 0; n < exterior.length; n++)
      if (letters[n * 4 + 3] > 32) {
        pixels++;
        const x = n % size,
          y = Math.floor(n / size);
        for (const [dx, dy] of [
          [0, 0],
          [-4, 0],
          [4, 0],
          [0, -4],
          [0, 4],
        ]) {
          const q = (y + dy) * size + x + dx;
          if (q < 0 || q >= exterior.length || exterior[q]) {
            outside++;
            break;
          }
        }
      }
    return {
      count: document.querySelectorAll("textPath").length,
      pixels,
      outside,
    };
  });
  expect(result.count).toBe(12);
  expect(result.pixels).toBeGreaterThan(2000);
  expect(result.outside).toBe(0);
});
