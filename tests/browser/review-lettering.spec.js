import { test, expect } from "@playwright/test";

test("F01 location names follow their individual gold scallops", async ({
  page,
}) => {
  await page.goto("/docs/visual-review/concepts/F01-editable-lettering-r5.svg");
  const result = await page.evaluate(async () => {
    const image = new Image();
    image.src = document.querySelector("image").getAttribute("href");
    await image.decode();
    const canvas = document.createElementNS(
      "http://www.w3.org/1999/xhtml",
      "canvas",
    );
    canvas.width = canvas.height = 600;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, 600, 600);
    const failures = [];
    for (const text of document.querySelectorAll("text")) {
      const [cx, cy] = text.dataset.center.split(",").map(Number);
      const rotation = (Number(text.dataset.rotation) * Math.PI) / 180;
      const [rx, ry] = text.dataset.radii.split(",").map(Number);
      for (let i = 0; i < text.getNumberOfChars(); i++) {
        if (text.textContent[i] === " ") continue;
        const b = text.getExtentOfChar(i);
        const x = b.x + b.width / 2,
          y = b.y + b.height / 2;
        const dx = x - cx,
          dy = y - cy;
        const localX = dx * Math.cos(rotation) + dy * Math.sin(rotation);
        const localY = -dx * Math.sin(rotation) + dy * Math.cos(rotation);
        // Glyphs belong to the outer half of their own lobe, not a dial circle.
        if (Math.abs(localX) > rx + 10 || localY > 12 || localY < -ry - 18)
          failures.push(`${text.textContent}: outside its scallop`);
        // Read the unlettered artwork beneath each glyph. This catches names
        // shifted onto the surrounding gray/brown backing instead of gold.
        const [r, g, blue] = ctx.getImageData(
          Math.round(x),
          Math.round(y),
          1,
          1,
        ).data;
        if (r < 170 || g < 115 || blue > g * 0.88)
          failures.push(`${text.textContent}: outside painted gold`);
      }
    }
    return { count: document.querySelectorAll("textPath").length, failures };
  });
  expect(result.count).toBe(12);
  expect(result.failures).toEqual([]);
});
