import { test, expect } from "@playwright/test";
test("F01 reference-style location lettering stays inside the gold face", async ({
  page,
}) => {
  await page.goto("/docs/visual-review/concepts/F01-editable-lettering-r3.svg");
  const outside = await page.evaluate(() => {
    const result = [];
    for (const text of document.querySelectorAll("text"))
      for (let i = 0; i < text.getNumberOfChars(); i++) {
        const b = text.getExtentOfChar(i);
        for (const x of [b.x, b.x + b.width])
          for (const y of [b.y, b.y + b.height])
            if (Math.hypot(x - 300, y - 300) > 258)
              result.push(text.textContent);
      }
    return [...new Set(result)];
  });
  expect(outside).toEqual([]);
});
