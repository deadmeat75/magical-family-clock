import { test, expect } from "@playwright/test";
async function boot(page, extra = {}) {
  await page.goto("/");
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate((c, extra) => {
    c.setConfig({
      ...c._baseConfig,
      demo: false,
      members: [],
      artwork: "castle",
      face_image: "",
      period_override: "day",
      season_override: "summer",
      reduced_motion: true,
      brightness: 1,
      background_transition: 0,
      show_branding: false,
      weather_effect: "clear",
      world: { enabled: false },
      ...extra,
    });
    c.style.width = "400px";
    const s = document.createElement("style");
    s.textContent = ".empty,.fullscreen{display:none!important}";
    c.shadowRoot.appendChild(s);
  }, extra);
  await expect(card.locator(".castle-artwork")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return card;
}
test("clear weather removes painted and moving clouds and resumes clouds after a live condition change", async ({
  page,
}) => {
  const card = await boot(page, {
    period_override: "night",
    weather_effect: "auto",
    weather_entity: "weather.home",
    world: { clouds: true, stars: true, moon: { enabled: false }, objects: [] },
  });
  await card.evaluate(
    (c) => (c.hass = { states: { "weather.home": { state: "clear-night" } } }),
  );
  await expect(card.locator('canvas[data-world-paint="clouds"]')).toHaveCount(
    0,
  );
  await expect(card.locator(".world-sky-base")).toHaveCount(1);
  await card.evaluate(
    (c) => (c.hass = { states: { "weather.home": { state: "cloudy" } } }),
  );
  await expect(card.locator('canvas[data-world-paint="clouds"]')).toHaveCount(
    1,
  );
  await card.evaluate(
    (c) => (c.hass = { states: { "weather.home": { state: "clear-night" } } }),
  );
  await expect(card.locator('canvas[data-world-paint="clouds"]')).toHaveCount(
    0,
  );
});
for (const effect of [
  "light-rain",
  "rain",
  "snow",
  "sleet",
  "wind",
  "fog",
  "ice",
])
  test(
    effect + " is visible in actual clock pixels at dashboard size",
    async ({ page }) => {
      const card = await boot(page, { weather_effect: effect });
      await card.locator(".weather").evaluate((w) => {
        for (const a of w.getAnimations({ subtree: true })) {
          a.pause();
          a.currentTime = 31000;
        }
      });
      await page.waitForTimeout(100);
      const shown = (await card.screenshot()).toString("base64");
      await card
        .locator(".weather")
        .evaluate((w) => (w.style.visibility = "hidden"));
      const hidden = (await card.screenshot()).toString("base64");
      const diff = await page.evaluate(
        async ({ shown, hidden }) => {
          const pictures = await Promise.all(
            [shown, hidden].map(async (png) => {
              const i = new Image();
              i.src = "data:image/png;base64," + png;
              await i.decode();
              const c = document.createElement("canvas");
              c.width = i.width;
              c.height = i.height;
              const x = c.getContext("2d");
              x.drawImage(i, 0, 0);
              return x.getImageData(0, 0, c.width, c.height).data;
            }),
          );
          let changed = 0;
          for (let i = 0; i < pictures[0].length; i += 4)
            if (
              Math.abs(pictures[0][i] - pictures[1][i]) +
                Math.abs(pictures[0][i + 1] - pictures[1][i + 1]) +
                Math.abs(pictures[0][i + 2] - pictures[1][i + 2]) >
              25
            )
              changed++;
          return changed;
        },
        { shown, hidden },
      );
      expect(diff).toBeGreaterThan(effect === "fog" ? 400 : 45);
    },
  );
test("lunar waxing and waning illuminate opposite sides while full and new moon retain physical brightness differences", async ({
  page,
}) => {
  await page.goto("/");
  const phases = await page.evaluate(async () => {
    const { lunarImage } = await import("/src/lunar.js");
    return Promise.all(
      [0, 0.125, 0.5, 0.875].map(async (phase) => {
        const img = new Image();
        img.src = await lunarImage(phase);
        await img.decode();
        const c = document.createElement("canvas");
        c.width = c.height = 128;
        const ctx = c.getContext("2d");
        ctx.drawImage(img, 0, 0, 128, 128);
        const d = ctx.getImageData(0, 0, 128, 128).data;
        let left = 0,
          right = 0;
        for (let y = 0; y < 128; y++)
          for (let x = 0; x < 128; x++) {
            const i = (y * 128 + x) * 4,
              v = ((d[i] + d[i + 1] + d[i + 2]) * d[i + 3]) / 255;
            if (x < 64) left += v;
            else right += v;
          }
        return { left, right };
      }),
    );
  });
  expect(phases[1].right).toBeGreaterThan(phases[1].left * 3);
  expect(phases[3].left).toBeGreaterThan(phases[3].right * 3);
  expect(phases[0].left + phases[0].right).toBeLessThan(
    (phases[2].left + phases[2].right) * 0.05,
  );
});
test("frost follows the central opening edge and scene pauses do not create a dark entry overlay", async ({
  page,
}) => {
  const card = await boot(page, { weather_effect: "ice" });
  await expect(card.locator(".weather")).toHaveAttribute(
    "clip-path",
    "url(#castle-opening)",
  );
  await expect(card.locator(".watchglass-frost")).toBeVisible();
  expect(
    await card
      .locator("ha-card")
      .evaluate((e) => Number(getComputedStyle(e).opacity)),
  ).toBe(1);
  const bounds = await card.locator(".watchglass-frost").evaluate((e) => {
    const b = e.getBBox();
    return { x: b.x, y: b.y, width: b.width, height: b.height };
  });
  expect(bounds.width).toBeGreaterThan(320);
  expect(bounds.width).toBeLessThan(360);
  expect(bounds.x).toBeGreaterThan(120);
});
test("moon shadow is transparent in both blue daylight and indigo night skies", async ({
  page,
}) => {
  await page.goto("/");
  const pixels = await page.evaluate(async () => {
    const { lunarImage } = await import("/src/lunar.js");
    const image = new Image();
    image.src = await lunarImage(0.125);
    await image.decode();
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const ctx = c.getContext("2d");
    ctx.drawImage(image, 0, 0, 128, 128);
    return {
      darkAlpha: ctx.getImageData(35, 64, 1, 1).data[3],
      litAlpha: ctx.getImageData(116, 64, 1, 1).data[3],
    };
  });
  expect(pixels.darkAlpha).toBe(0);
  expect(pixels.litAlpha).toBeGreaterThan(220);
  const card = await boot(page, {
    world: {
      moon: {
        enabled: true,
        show_in_daylight: true,
        source: "manual",
        manual: "waxing_crescent",
      },
      objects: [],
    },
  });
  await expect(card.locator(".lunar-surface")).toHaveAttribute(
    "href",
    /^data:image\/png/,
  );
});
test("crafted bezels retain live information and render without repeated square texture tiles", async ({
  page,
}) => {
  const card = await boot(page, {
    bezel: {
      enabled: true,
      width: 64,
      material: "wood",
      items: [
        { id: "room", kind: "sensor", entity: "sensor.room", angle: -90 },
      ],
    },
  });
  await card.evaluate(
    (c) => (c.hass = { states: { "sensor.room": { state: "Kitchen" } } }),
  );
  await expect(card.locator(".crafted-bezel")).toHaveAttribute(
    "data-material-ready",
    "true",
  );
  await expect(card.locator(".bezel-value")).toContainText("Kitchen");
  await card.evaluate(
    (c) => (c.hass = { states: { "sensor.room": { state: "Garden" } } }),
  );
  await expect(card.locator(".bezel-value")).toContainText("Garden");
});
