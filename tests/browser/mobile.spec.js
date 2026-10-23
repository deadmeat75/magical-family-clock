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
  // A changing href or timestamp alone does not prove that WebKit repainted.
  // Pause CSS effects and verify the displayed landscape pixels also change.
  await card.evaluate((c) => {
    for (const animation of c.shadowRoot
      .querySelector("ha-card")
      .getAnimations({ subtree: true }))
      animation.pause();
  });
  const beforePixels = PNG.sync.read(await card.screenshot({ scale: "css" }));
  await page.waitForTimeout(1200);
  const afterPixels = PNG.sync.read(await card.screenshot({ scale: "css" }));
  let changedPixels = 0;
  for (let i = 0; i < beforePixels.data.length; i += 4)
    if (
      Math.abs(beforePixels.data[i] - afterPixels.data[i]) +
        Math.abs(beforePixels.data[i + 1] - afterPixels.data[i + 1]) +
        Math.abs(beforePixels.data[i + 2] - afterPixels.data[i + 2]) >
      15
    )
      changedPixels++;
  expect(
    changedPixels,
    "the displayed scenery must move, not just its frame counters",
  ).toBeGreaterThan(50);
  if (await layer.getAttribute("data-world-surface")) {
    await page.evaluate(() => {
      window.heldEncodes = [];
      window.originalFrameEncoder = HTMLCanvasElement.prototype.toBlob;
      HTMLCanvasElement.prototype.toBlob = function (callback, ...options) {
        return originalFrameEncoder.call(
          this,
          (blob) => heldEncodes.push(() => callback(blob)),
          ...options,
        );
      };
    });
    await expect
      .poll(() => page.evaluate(() => heldEncodes.length))
      .toBeGreaterThan(0);
    const waiting = await layer.getAttribute("data-paint-tick");
    await page.waitForTimeout(200);
    expect(
      await layer.getAttribute("data-paint-tick"),
      "do not repaint a surface whose previous frame is still encoding",
    ).toBe(waiting);
    await page.evaluate(() => {
      HTMLCanvasElement.prototype.toBlob = originalFrameEncoder;
      heldEncodes.splice(0).forEach((finish) => finish());
    });
    await expect
      .poll(() => layer.getAttribute("data-paint-tick"))
      .not.toBe(waiting);
    await expect(layer).toHaveAttribute("data-display-tick", /\d+/);
  }
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
test("lost animation callbacks recover on app resume and without a page reload", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const frame = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (callback) =>
      frame((time) => {
        if (!window.dropMotionFrame) callback(time);
      });
  });
  const { card, errors } = await boot(page);
  const layer = card.locator(
    '[data-world-surface~="water"],canvas[data-world-paint="water"]',
  );
  for (const event of ["pageshow", "visibilitychange", "watchdog"]) {
    await page.evaluate(() => {
      window.dropMotionFrame = true;
    });
    await page.waitForTimeout(250);
    const tick = await layer.getAttribute("data-paint-tick");
    await page.evaluate((event) => {
      window.dropMotionFrame = false;
      if (event === "pageshow") window.dispatchEvent(new Event(event));
      if (event === "visibilitychange")
        document.dispatchEvent(new Event(event));
    }, event);
    await expect
      .poll(() => layer.getAttribute("data-paint-tick"), { timeout: 7000 })
      .not.toBe(tick);
  }
  await card.evaluate((c) => {
    c._config.scene_motion = false;
  });
  await page.waitForTimeout(200);
  const tick = await layer.getAttribute("data-paint-tick");
  await page.evaluate(() => window.dispatchEvent(new Event("pageshow")));
  await page.waitForTimeout(350);
  expect(await layer.getAttribute("data-paint-tick")).toBe(tick);
  expect(errors).toEqual([]);
});
test("animation check explains card and device pauses and verifies moving frames", async ({
  page,
}) => {
  await boot(page);
  await page.evaluate(() => {
    const host = document.createElement("div");
    document.body.appendChild(host);
    host.appendChild(mobileCard);
    const editor = document.createElement("magical-family-clock-card-editor");
    editor.setConfig(mobileCard._baseConfig);
    editor.tab = "Living world";
    host.appendChild(editor);
    editor.render();
    window.motionEditor = editor;
  });
  const editor = page.locator("magical-family-clock-card-editor");
  const check = () =>
    page.evaluate(() => {
      [...motionEditor.shadowRoot.querySelectorAll("button")]
        .find((b) => b.textContent === "Check animation")
        .click();
    });
  await page.evaluate(() => {
    mobileCard._config.reduced_motion = true;
  });
  await check();
  await expect(
    editor.getByRole("status", { name: "Animation status" }),
  ).toHaveText(/General → Reduced motion/);
  await page.evaluate(() => {
    mobileCard._config.reduced_motion = false;
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await check();
  await expect(
    editor.getByRole("status", { name: "Animation status" }),
  ).toHaveText(/browser reports.*Reduce Motion/);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.evaluate(() => {
    mobileCard._config.scene_motion = false;
  });
  await check();
  await expect(
    editor.getByRole("status", { name: "Animation status" }),
  ).toHaveText(/Animate castle scenery is off/);
  await page.evaluate(() => {
    mobileCard._config.scene_motion = true;
  });
  await page.locator("magical-family-clock-card").scrollIntoViewIfNeeded();
  await expect.poll(() => page.evaluate(() => mobileCard._visible)).toBe(true);
  await page.evaluate(async () => {
    await mobileCard._worldPainter.ready;
  });
  await check();
  await expect(
    editor.getByRole("status", { name: "Animation status" }),
  ).toHaveText(/Animation is running/, {
    timeout: 10000,
  });
});

test("Randomize sits opposite Fullscreen and preserves household data through repeated shuffles and expansion", async ({
  page,
}) => {
  const { card, errors } = await boot(page);
  await card.evaluate((c) =>
    c.setConfig({
      ...c._baseConfig,
      members: [{ id: "rowan", name: "Rowan", entity: "person.rowan" }],
      weather_entity: "weather.home",
      world: {
        ...c._baseConfig.world,
        moon: { source: "entity", entity: "sensor.moon" },
      },
    }),
  );
  const base = await card.evaluate((c) => JSON.stringify(c._baseConfig));
  const random = card.getByRole("button", {
    name: "Randomize appearance",
    exact: true,
  });
  const full = card.getByRole("button", { name: "Expand clock", exact: true });
  const a = await random.boundingBox(),
    b = await full.boundingBox();
  expect(a.x + a.width).toBeLessThan(b.x);
  expect(Math.abs(a.y - b.y)).toBeLessThan(2);
  for (let i = 0; i < 5; i++) {
    const theme = await card.evaluate((c) => c._config.theme);
    await random.click();
    expect(await card.evaluate((c) => c._config.theme)).not.toBe(theme);
    expect(await card.evaluate((c) => JSON.stringify(c._baseConfig))).toBe(
      base,
    );
    expect(await card.evaluate((c) => c._config.members)).toEqual(
      JSON.parse(base).members,
    );
    expect(await card.evaluate((c) => c._config.locations)).toEqual(
      JSON.parse(base).locations,
    );
    expect(await card.evaluate((c) => c._config.world.moon)).toEqual(
      JSON.parse(base).world.moon,
    );
    await expect(card.locator(".hand")).toHaveCount(1);
  }
  await card.evaluate(
    (c) =>
      (c.shadowRoot.querySelector("ha-card").requestFullscreen = undefined),
  );
  await full.click();
  await random.click();
  await expect(card.locator("ha-card")).toHaveClass(/expanded/);
  await full.click();
  await expect(card.locator("ha-card")).not.toHaveClass(/expanded/);
  expect(errors).toEqual([]);
});
