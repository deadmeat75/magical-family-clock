import { test, expect } from "@playwright/test";
async function boot(page, objects = []) {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate(
    (c, objects) =>
      c.setConfig({
        ...c._baseConfig,
        demo: false,
        members: [],
        artwork: "castle",
        face_image: "",
        period_override: "day",
        weather_effect: "clouds",
        background_transition: 0,
        world: { objects, moon: { source: "entity", entity: "sensor.moon" } },
      }),
    objects,
  );
  await expect(
    card.locator('canvas[data-world-paint="clouds"]'),
  ).toHaveAttribute("data-paint-tick", /\d+/);
  return card;
}
test("cloud features advect visibly and continuously rather than sliding a whole sky photograph", async ({
  page,
}) => {
  const card = await boot(page);
  const result = await card.evaluate(async (c) => {
    await c._worldPainter.ready;
    c._config.scene_motion = false;
    const canvas = c.shadowRoot.querySelector(
        'canvas[data-world-paint="clouds"]',
      ),
      ctx = canvas.getContext("2d");
    const frame = (t) => {
      c._worldPainter.seek(t);
      return ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    };
    const a = frame(0),
      b = frame(4),
      w = canvas.width;
    const errors = [];
    for (let shift = 0; shift <= 45; shift++) {
      let sum = 0,
        n = 0;
      for (let y = 60; y < 230; y += 3)
        for (let x = 100; x < 600; x += 3) {
          const i = (y * w + x) * 4,
            j = (y * w + x + shift) * 4;
          sum += Math.abs(a[i + 3] - b[j + 3]);
          n++;
        }
      errors.push(sum / n);
    }
    const best = errors.indexOf(Math.min(...errors));
    return {
      best,
      alignedError: errors[best],
      fixedError: errors[0],
      skyBase: !!c.shadowRoot.querySelector(".world-sky-base"),
    };
  });
  expect(result.skyBase).toBe(true);
  expect(result.best).toBeGreaterThan(15);
  expect(result.best).toBeLessThan(40);
  expect(result.alignedError).toBeLessThan(result.fixedError * 0.7);
});
test("flying figures never fade in the open sky and their repeat boundary stays entirely outside the opening", async ({
  page,
}) => {
  const card = await boot(page, [
    {
      id: "rider",
      kind: "witch",
      x: 50,
      y: 18,
      span: 0,
      scale: 3,
      behind_castle: false,
    },
  ]);
  const samples = await card.evaluate(async (c) => {
    const target = c.shadowRoot.querySelector(".world-encounter"),
      a = target.getAnimations()[0];
    await a.ready;
    a.pause();
    const timing = a.effect.getTiming(),
      root = c.shadowRoot.querySelector("svg");
    return [0, 0.1, 0.25, 0.4, 0.55, 0.72, 0.85, 0.999].map((phase) => {
      a.currentTime =
        (((timing.delay + timing.duration * phase) % timing.duration) +
          timing.duration) %
        timing.duration;
      const b = target.getBBox(),
        m = root.getScreenCTM().inverse().multiply(target.getScreenCTM());
      const points = [
        [b.x, b.y],
        [b.x + b.width, b.y],
        [b.x, b.y + b.height],
        [b.x + b.width, b.y + b.height],
      ].map(([x, y]) => new DOMPoint(x, y).matrixTransform(m));
      return {
        phase,
        opacity: getComputedStyle(target).opacity,
        minX: Math.min(...points.map((p) => p.x)),
        maxX: Math.max(...points.map((p) => p.x)),
      };
    });
  });
  for (const s of samples) expect(s.opacity).toBe("1");
  for (const s of samples.filter((s) => s.phase === 0 || s.phase >= 0.72))
    expect(s.maxX < 120 || s.minX > 480).toBe(true);
  expect(samples.some((s) => s.minX > 120 && s.maxX < 480)).toBe(true);
});
test("lake creatures submerge completely without an opacity cut and waterfall spray has no solid discs", async ({
  page,
}) => {
  const card = await boot(page, [
    { id: "lake", kind: "mermaid", x: 60, y: 82 },
  ]);
  const result = await card.evaluate(async (c) => {
    const target = c.shadowRoot.querySelector(".world-encounter"),
      a = target.getAnimations()[0];
    await a.ready;
    a.pause();
    const timing = a.effect.getTiming();
    const samples = [0, 0.36, 0.85].map((phase) => {
      a.currentTime =
        (((timing.delay + timing.duration * phase) % timing.duration) +
          timing.duration) %
        timing.duration;
      const b = target.getBBox(),
        dy = new DOMMatrix(getComputedStyle(target).transform).f;
      return {
        phase,
        top: b.y + dy,
        opacity: getComputedStyle(target).opacity,
      };
    });
    return {
      samples,
      discs: c.shadowRoot.querySelectorAll(".world-spray ellipse").length,
      canvas: !!c.shadowRoot.querySelector(
        'canvas[data-world-paint="waterfalls"]',
      ),
    };
  });
  expect(result.discs).toBe(0);
  expect(result.canvas).toBe(true);
  expect(result.samples[0].top).toBeGreaterThan(0);
  expect(result.samples[2].top).toBeGreaterThan(0);
  expect(result.samples[1].top).toBeLessThan(0);
  for (const s of result.samples) expect(s.opacity).toBe("1");
});
test("moon refresh preserves encounter progress and painter time, and reduced motion stops painting", async ({
  page,
}) => {
  const card = await boot(page, [{ id: "bird", kind: "bird", y: 16 }]);
  await card.evaluate((c) => {
    c.setConfig({ ...c._baseConfig, period_override: "night" });
    c.hass = { states: { "sensor.moon": { state: "full_moon" } } };
  });
  await expect(card.locator(".world-moon")).toHaveAttribute(
    "data-phase",
    "0.5",
  );
  const before = await card.evaluate((c) => {
    const a = c.shadowRoot.querySelector(".world-encounter").getAnimations()[0],
      timing = a.effect.getTiming();
    a.currentTime =
      (((timing.delay + timing.duration * 0.4) % timing.duration) +
        timing.duration) %
      timing.duration;
    return {
      progress: a.effect.getComputedTiming().progress,
      time: c._worldPainter.time,
    };
  });
  await card.evaluate(
    (c) => (c.hass = { states: { "sensor.moon": { state: "last_quarter" } } }),
  );
  await expect(card.locator(".world-moon")).toHaveAttribute(
    "data-phase",
    "0.75",
  );
  await page.waitForTimeout(100);
  const after = await card.evaluate((c) => ({
    progress: c.shadowRoot
      .querySelector(".world-encounter")
      .getAnimations()[0]
      .effect.getComputedTiming().progress,
    time: c._worldPainter.time,
  }));
  expect(Math.abs(after.progress - before.progress)).toBeLessThan(0.03);
  expect(after.time).toBeGreaterThanOrEqual(before.time);
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const canvas = card.locator('canvas[data-world-paint="clouds"]'),
    tick = await canvas.getAttribute("data-paint-tick");
  await page.waitForTimeout(180);
  expect(await canvas.getAttribute("data-paint-tick")).toBe(tick);
});

test("Home Assistant editor has one host-owned preview and no sticky clock over its settings", async ({
  page,
}) => {
  await boot(page);
  await page.evaluate(() => {
    const existing = document.querySelector(
        "section magical-family-clock-card",
      ),
      config = structuredClone(existing._baseConfig);
    config.world.objects = [
      { id: "visitor", kind: "witch", x: 50, y: 14, behind_castle: false },
    ];
    const host = document.createElement("mfc-editor-host"),
      root = host.attachShadow({ mode: "open" });
    const editor = document.createElement("magical-family-clock-card-editor"),
      preview = document.createElement("magical-family-clock-card");
    editor.setConfig(config);
    editor.hass = existing._hass;
    preview.setConfig(config);
    preview.hass = existing._hass;
    editor.addEventListener("config-changed", (e) =>
      preview.setConfig(e.detail.config),
    );
    root.append(editor, preview);
    document.body.replaceChildren(host);
  });
  const host = page.locator("mfc-editor-host"),
    editor = host.locator("magical-family-clock-card-editor");
  const preview = host.locator("magical-family-clock-card");
  await expect(preview).toHaveCount(1);
  await expect(editor.locator("magical-family-clock-card")).toHaveCount(0);
  expect(
    await editor.evaluate((e) => e.shadowRoot.querySelector(".preview-shell")),
  ).toBeNull();
  await editor.getByRole("button", { name: "General", exact: true }).click();
  await editor
    .getByLabel("Title", { exact: true })
    .fill("Only the right preview");
  await expect(preview.locator(".title")).toHaveText("Only the right preview");
  await editor
    .getByRole("button", { name: "Living world", exact: true })
    .click();
  await editor
    .getByRole("button", { name: "Preview encounter now", exact: true })
    .click();
  await expect(editor.getByRole("status")).toContainText(
    "Showing an active moment.",
  );
});

test("castle motion continues in native fullscreen and fixed expansion when its dashboard host leaves view", async ({
  page,
}) => {
  const card = await boot(page, [{ id: "dragon", kind: "dragon", y: 16 }]);
  const checkMotion = async () => {
    await expect(card.locator("ha-card")).not.toHaveClass(/paused/);
    const canvas = card.locator('canvas[data-world-paint="clouds"]'),
      tick = await canvas.getAttribute("data-paint-tick");
    await expect
      .poll(() => canvas.getAttribute("data-paint-tick"))
      .not.toBe(tick);
    await expect(card.locator('[data-kind="dragon"] .painted-wing')).toHaveCSS(
      "animation-play-state",
      "running",
    );
    // Native fullscreen promotes the inner ha-card, while its dashboard host
    // retains an occluded layout box. Inspect the screen the user actually sees.
    const first = await page.screenshot();
    await page.waitForTimeout(250);
    expect(first.equals(await page.screenshot())).toBe(false);
  };
  await card.getByRole("button", { name: "Expand clock", exact: true }).click();
  expect(
    await card.evaluate((c) => Boolean(c.shadowRoot.fullscreenElement)),
  ).toBe(true);
  await page.waitForTimeout(250);
  await checkMotion();
  await page.evaluate(() => document.exitFullscreen());
  await card.evaluate(
    (c) =>
      (c.shadowRoot.querySelector("ha-card").requestFullscreen = undefined),
  );
  await card.getByRole("button", { name: "Expand clock", exact: true }).click();
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(250);
  await checkMotion();
  await card.getByRole("button", { name: "Expand clock", exact: true }).click();
});
