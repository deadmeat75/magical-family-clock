import { writeFileSync } from "node:fs";
import { test, expect } from "@playwright/test";
import { PNG } from "pngjs";
test.setTimeout(90000);
async function boot(page) {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("crash", () => errors.push("renderer crashed"));
  await page.addInitScript(() => {
    window.testImageURLs = new Set();
    const make = URL.createObjectURL.bind(URL),
      revoke = URL.revokeObjectURL.bind(URL);
    URL.createObjectURL = (blob) => {
      const url = make(blob);
      testImageURLs.add(url);
      return url;
    };
    URL.revokeObjectURL = (url) => {
      testImageURLs.delete(url);
      return revoke(url);
    };
  });
  await page.goto("/?production");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(async () => {
    const c = document.querySelector("section magical-family-clock-card"),
      { legacyLayout } = await import("/src/engine.js");
    c.setConfig({
      ...c._baseConfig,
      demo: false,
      artwork: "castle",
      face_image: "",
      theme: "living-magical",
      members: [],
      locations: legacyLayout().locations,
      pivot_y: 47,
      period_override: "day",
      season_override: "summer",
      weather_effect: "fog",
      show_branding: false,
      background_transition: 0,
      world: { objects: [] },
    });
    document.body.replaceChildren(c);
    document.body.style.cssText = "margin:0;background:#102025";
    c.style.cssText = "display:block;width:100%;max-width:800px;margin:auto";
    window.mobileCard = c;
    await document.fonts.ready;
  });
  await expect
    .poll(() => page.evaluate(() => mobileCard._sceneLoaded), {
      timeout: 15000,
    })
    .toBe(true);
  await page.evaluate(async () => {
    await mobileCard._worldPainter.ready;
  });
  return { card: page.locator("magical-family-clock-card"), errors };
}
test("production water, foreground and fog stay inside the castle on phone and tablet", async ({
  page,
  browserName,
}, testInfo) => {
  const { card, errors } = await boot(page);
  if (browserName === "webkit") {
    await expect(card.locator("foreignObject")).toHaveCount(0);
    await expect(
      card.locator('image[data-world-surface~="water"]'),
    ).toHaveAttribute("href", /^blob:/);
  }
  await page.evaluate(async () => {
    mobileCard._config.scene_motion = false;
    for (const node of mobileCard.shadowRoot.querySelectorAll("*"))
      for (const a of node.getAnimations()) a.pause();
    await new Promise((r) => setTimeout(r, 250));
  });
  const fullBytes = await card.screenshot({ scale: "css" });
  await testInfo.attach("effects-visible", {
    body: fullBytes,
    contentType: "image/png",
  });
  const full = PNG.sync.read(fullBytes);
  const geometry = await card.evaluate((c) => {
    const svg = c.shadowRoot.querySelector(".frame>svg"),
      m = svg.getScreenCTM(),
      box = c.getBoundingClientRect();
    return {
      a: m.a,
      d: m.d,
      x: m.e - box.x,
      y: m.f - box.y,
      r: c._config.location_panels.inner_radius,
    };
  });
  await card.evaluate((c) => {
    for (const n of c.shadowRoot.querySelectorAll(".scene-animation, .weather"))
      n.style.visibility = "hidden";
  });
  const plainBytes = await card.screenshot({ scale: "css" });
  await testInfo.attach("effects-hidden", {
    body: plainBytes,
    contentType: "image/png",
  });
  writeFileSync(testInfo.outputPath("visible.png"), fullBytes);
  writeFileSync(testInfo.outputPath("hidden.png"), plainBytes);
  const plain = PNG.sync.read(plainBytes);
  let leaks = 0,
    inside = 0;
  const changed = (x, y) => {
    if (x < 0 || y < 0 || x >= full.width || y >= full.height) return false;
    const i = (y * full.width + x) * 4;
    return (
      Math.abs(full.data[i] - plain.data[i]) +
        Math.abs(full.data[i + 1] - plain.data[i + 1]) +
        Math.abs(full.data[i + 2] - plain.data[i + 2]) >
      20
    );
  };
  for (let y = 0; y < full.height; y++)
    for (let x = 0; x < full.width; x++) {
      const i = (y * full.width + x) * 4,
        diff =
          Math.abs(full.data[i] - plain.data[i]) +
          Math.abs(full.data[i + 1] - plain.data[i + 1]) +
          Math.abs(full.data[i + 2] - plain.data[i + 2]);
      if (diff < 20) continue;
      const radius = Math.hypot(
        (x - geometry.x) / geometry.a - 300,
        (y - geometry.y) / geometry.d - 282,
      );
      const faceRadius = Math.hypot(
        (x - geometry.x) / geometry.a - 300,
        (y - geometry.y) / geometry.d - 300,
      );
      // Check destination-panel interiors. The unrelated beveled outer rim
      // can rerasterize when a composited layer is hidden between screenshots.
      if (radius > geometry.r + 9 && faceRadius < 270) {
        // Compositing may change edge antialiasing by one pixel. Detect filled
        // escaped areas, rather than thin edge changes on the unchanged frame.
        if (
          [-2, -1, 0, 1, 2].every((dy) =>
            [-2, -1, 0, 1, 2].every((dx) => changed(x + dx, y + dy)),
          )
        )
          leaks++;
      } else inside++;
    }
  expect(inside, "the test must see rendered scenery effects").toBeGreaterThan(
    50,
  );
  expect(
    leaks,
    "scenery must never cover destination panels or escape the face",
  ).toBe(0);
  expect(errors).toEqual([]);
});
test("production motion survives rotation and expanded view and stops when paused", async ({
  page,
}) => {
  const { card, errors } = await boot(page);
  const layer = card.locator(
    '[data-world-surface~="water"],canvas[data-world-paint="water"]',
  );
  if (await layer.getAttribute("data-world-surface")) {
    const frame = await layer.getAttribute("href");
    await expect.poll(() => layer.getAttribute("href")).not.toBe(frame);
  }
  const tick = await layer.getAttribute("data-paint-tick");
  await expect.poll(() => layer.getAttribute("data-paint-tick")).not.toBe(tick);
  const size = page.viewportSize();
  await page.setViewportSize({ width: size.height, height: size.width });
  await expect
    .poll(async () => {
      const b = await card.boundingBox();
      return b.width <= page.viewportSize().width;
    })
    .toBe(true);
  // Exercise the in-app fallback used by iOS when native fullscreen is unavailable.
  await card.evaluate(
    (c) =>
      (c.shadowRoot.querySelector("ha-card").requestFullscreen = undefined),
  );
  await card.getByRole("button", { name: "Expand clock", exact: true }).click();
  await expect(card.locator("ha-card")).toHaveClass(/expanded/);
  if (await layer.getAttribute("data-world-surface")) {
    const frame = await layer.getAttribute("href");
    await expect.poll(() => layer.getAttribute("href")).not.toBe(frame);
  }
  const expandedTick = await layer.getAttribute("data-paint-tick");
  await expect
    .poll(() => layer.getAttribute("data-paint-tick"))
    .not.toBe(expandedTick);
  await card.getByRole("button", { name: "Expand clock", exact: true }).click();
  await card.evaluate((c) => (c._config.scene_motion = false));
  await page.waitForTimeout(250);
  const stopped = await layer.getAttribute("data-paint-tick");
  await page.waitForTimeout(300);
  expect(await layer.getAttribute("data-paint-tick")).toBe(stopped);
  expect(errors).toEqual([]);
});
test("production dashboard remounts release moving-image URLs and retain compact markup", async ({
  page,
  browserName,
}) => {
  const { card, errors } = await boot(page);
  const baseline = await page.evaluate(() => testImageURLs.size);
  for (let i = 0; i < 6; i++) {
    await card.evaluate((c) => {
      c.remove();
      document.body.appendChild(c);
    });
    await expect
      .poll(() => page.evaluate(() => mobileCard._sceneLoaded), {
        timeout: 15000,
      })
      .toBe(true);
    await page.evaluate(async () => {
      await mobileCard._worldPainter.ready;
    });
  }
  await expect
    .poll(() => page.evaluate(() => testImageURLs.size))
    .toBeLessThanOrEqual(baseline + 8);
  expect(
    await card.evaluate((c) => c.shadowRoot.innerHTML.length),
  ).toBeLessThan(1000000);
  if (browserName === "webkit") {
    const before = await page.evaluate(() => testImageURLs.size);
    await card.evaluate((c) => c.remove());
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => testImageURLs.size)).toBeLessThan(before);
  }
  expect(errors).toEqual([]);
});
