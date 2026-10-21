import { test, expect } from "@playwright/test";
async function boot(page, extra = {}) {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate(async (c, extra) => {
    const { legacyLayout } = await import("/src/engine.js");
    c.setConfig({
      ...c._baseConfig,
      artwork: "castle",
      theme: "living-magical",
      face_image: "",
      locations: legacyLayout().locations,
      show_location_labels: true,
      period_override: "day",
      season_override: "summer",
      weather_effect: "clear",
      background_transition: 0,
      ...extra,
    });
  }, extra);
  await expect(card.locator(".castle-artwork")).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  return card;
}
test("location names and graphics fit their actual frames at narrow and wide dashboard sizes", async ({
  page,
}) => {
  const card = await boot(page);
  for (const width of [320, 760]) {
    await card.evaluate((c, width) => (c.style.width = width + "px"), width);
    await expect
      .poll(() => card.locator('.slot-label[data-fit="inside"]').count())
      .toBe(6);
    const failures = await card.evaluate((c) => {
      const errors = [];
      for (const panel of c.shadowRoot.querySelectorAll(".location-panel")) {
        const path = panel.querySelector(".slot-surface");
        for (const element of panel.querySelectorAll(
          ".slot-label,.slot-graphic",
        )) {
          const b = element.getBBox(),
            matrix = element.transform.baseVal.consolidate()?.matrix;
          for (let y = 0; y <= 4; y++)
            for (let x = 0; x <= 10; x++) {
              const q = new DOMPoint(
                  b.x + (b.width * x) / 10,
                  b.y + (b.height * y) / 4,
                ),
                p = matrix ? q.matrixTransform(matrix) : q;
              if (!path.isPointInFill(p))
                errors.push(
                  panel.dataset.location + ": " + element.getAttribute("class"),
                );
            }
        }
      }
      return errors;
    });
    expect(failures).toEqual([]);
  }
  await card.evaluate((c) => {
    const next = structuredClone(c._baseConfig);
    next.locations[0].name = "Grandma and Grandpa’s Enchanted Cottage";
    c.setConfig(next);
  });
  await expect(card.locator(".slot-label").first()).toHaveAttribute(
    "data-fit",
    "inside",
  );
  await expect(card.locator(".slot-label").first()).toHaveAttribute(
    "aria-label",
    "Grandma and Grandpa’s Enchanted Cottage",
  );
});
test("clouds, trees, lake and waterfalls each change rendered pixels independently", async ({
  page,
}) => {
  const card = await boot(page, { members: [] });
  for (const key of ["clouds", "trees", "water", "waterfalls"]) {
    await card.evaluate((c, key) => {
      const config = structuredClone(c._baseConfig);
      config.world.objects = [];
      for (const k of [
        "clouds",
        "trees",
        "water",
        "waterfalls",
        "stars",
        "shooting_stars",
      ])
        config.world[k] = k === key;
      c.setConfig(config);
    }, key);
    await page.waitForTimeout(900);
    const a = await card.screenshot();
    await page.waitForTimeout(500);
    const b = await card.screenshot();
    expect(a.equals(b), key + " must visibly animate").toBe(false);
  }
});
test("motion pause preserves a still world and device reduced motion is honored", async ({
  page,
}) => {
  const card = await boot(page, {
    members: [],
    world: { objects: [{ id: "serpent", kind: "sea-monster", x: 65, y: 80 }] },
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  const cloud = card.locator(".scene-cloud").first();
  await expect(cloud).toHaveCSS("animation-play-state", "paused");
  const first = await cloud.evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(160);
  expect(await cloud.evaluate((e) => getComputedStyle(e).transform)).toBe(
    first,
  );
  await expect(card.locator(".world-encounter")).toHaveCSS("opacity", "1");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await card.evaluate((c) =>
    c.setConfig({ ...c._baseConfig, scene_motion: false }),
  );
  await expect(card.locator(".world-live")).toBeVisible();
  await expect(card.locator(".scene-cloud").first()).toHaveCSS(
    "animation-play-state",
    "paused",
  );
  await expect(card.locator(".world-encounter")).toHaveCSS("opacity", "1");
});
test("moon follows a live Home Assistant phase sensor without reloading the background", async ({
  page,
}) => {
  const card = await boot(page, {
    demo: false,
    members: [],
    period_override: "night",
    world: {
      moon: { source: "entity", entity: "sensor.moon", fallback: "hide" },
    },
  });
  await card.evaluate(
    (c) => (c.hass = { states: { "sensor.moon": { state: "first_quarter" } } }),
  );
  await expect(card.locator(".world-moon")).toHaveAttribute(
    "data-phase",
    "0.25",
  );
  const path = await card.locator(".moon-lit-area").getAttribute("d");
  const key = await card.evaluate((c) => c._sceneRequest);
  await card.evaluate(
    (c) => (c.hass = { states: { "sensor.moon": { state: "last_quarter" } } }),
  );
  await expect(card.locator(".world-moon")).toHaveAttribute(
    "data-phase",
    "0.75",
  );
  expect(await card.locator(".moon-lit-area").getAttribute("d")).not.toBe(path);
  expect(await card.evaluate((c) => c._sceneRequest)).toBe(key);
  await card.evaluate(
    (c) => (c.hass = { states: { "sensor.moon": { state: "unavailable" } } }),
  );
  await expect(card.locator(".world-moon")).toHaveCount(0);
  await expect(card.locator(".world-star").first()).toBeVisible();
});
test("encounters respect scene and weather filters and preview visibly surfaces a lake creature", async ({
  page,
}) => {
  const card = await boot(page, {
    demo: false,
    members: [],
    weather_effect: "auto",
    weather_entity: "weather.home",
    world: {
      objects: [
        { id: "dragon", kind: "dragon", period: "night" },
        { id: "serpent", kind: "sea-monster", x: 60, y: 82, weather: "clear" },
      ],
    },
  });
  await expect(card.locator('.world-object[data-kind="dragon"]')).toHaveCount(
    0,
  );
  const played = await card.evaluate((c) => c.previewWorldEncounter("serpent"));
  expect(played).toBe(true);
  await expect(card.locator(".world-encounter")).toHaveCSS("opacity", "1");
  const transform = await card
    .locator(".world-encounter")
    .evaluate((e) => new DOMMatrix(getComputedStyle(e).transform).f);
  expect(Math.abs(transform)).toBeLessThan(0.1);
  await card.evaluate(
    (c) => (c.hass = { states: { "weather.home": { state: "pouring" } } }),
  );
  await expect(card.locator(".world-object")).toHaveCount(0);
  await card.evaluate((c) =>
    c.setConfig({ ...c._baseConfig, period_override: "night" }),
  );
  await expect(card.locator('.world-object[data-kind="dragon"]')).toHaveCount(
    1,
  );
  await card.evaluate((c) => {
    const config = structuredClone(c._baseConfig);
    config.world.objects.find((o) => o.id === "dragon").facing = "left";
    c.setConfig(config);
  });
  const movement = await card
    .locator('.world-object[data-kind="dragon"] .world-encounter')
    .evaluate(async (target) => {
      const animation = target.getAnimations()[0];
      await animation.ready;
      animation.pause();
      const timing = animation.effect.getTiming();
      const position = (phase) => {
        animation.currentTime =
          (((timing.duration * phase + timing.delay) % timing.duration) +
            timing.duration) %
          timing.duration;
        return new DOMMatrix(getComputedStyle(target).transform).e;
      };
      return { start: position(0.1), end: position(0.45) };
    });
  expect(movement.end).toBeLessThan(movement.start);
});
test("world editor adds, duplicates and removes inhabitants with inline instructions", async ({
  page,
}) => {
  await boot(page);
  await page.locator("#edit").click();
  const editor = page.locator("magical-family-clock-card-editor");
  await editor
    .getByRole("button", { name: "Living world", exact: true })
    .click();
  await editor
    .getByRole("button", { name: "Remove all inhabitants", exact: true })
    .click();
  await editor
    .getByLabel("Creature or prop to add", { exact: true })
    .selectOption("mermaid");
  await editor
    .getByRole("button", { name: "Add selected inhabitant", exact: true })
    .click();
  await expect(
    editor.getByLabel("Inhabitant name", { exact: true }),
  ).toHaveCount(1);
  const marker = editor.getByRole("button", {
    name: "Place Mermaid",
    exact: true,
  });
  await marker.focus();
  await marker.press("ArrowRight");
  await marker.press("Shift+ArrowUp");
  await expect(
    editor.getByLabel("Inhabitant horizontal position (%)", { exact: true }),
  ).toHaveValue("51");
  await expect(
    editor.getByLabel("Inhabitant vertical position (%)", { exact: true }),
  ).toHaveValue("72");
  await marker.scrollIntoViewIfNeeded();
  const bounds = await marker.boundingBox();
  await page.mouse.move(
    bounds.x + bounds.width / 2,
    bounds.y + bounds.height / 2,
  );
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width / 2 + 18,
    bounds.y + bounds.height / 2 + 9,
    { steps: 5 },
  );
  await page.mouse.up();
  expect(
    await editor.evaluate((e) => e.config.world.objects[0].x),
  ).toBeGreaterThan(51);
  expect(
    await editor.evaluate((e) => e.config.world.objects[0].y),
  ).toBeGreaterThan(72);
  await editor.getByLabel("Inhabitant scale", { exact: true }).fill("1.6");
  await expect
    .poll(() => editor.evaluate((e) => e.config.world.objects[0].scale))
    .toBe(1.6);
  await editor
    .getByRole("button", { name: "Duplicate inhabitant", exact: true })
    .click();
  await expect(
    editor.getByLabel("Inhabitant name", { exact: true }),
  ).toHaveCount(2);
  await editor
    .getByRole("button", { name: "Remove inhabitant", exact: true })
    .last()
    .click();
  await expect(
    editor.getByLabel("Inhabitant name", { exact: true }),
  ).toHaveCount(1);
  expect(
    await editor.evaluate((e) =>
      [
        ...e.shadowRoot.querySelectorAll(
          "label input,label select,label ha-selector",
        ),
      ].every(
        (c) =>
          e.shadowRoot.getElementById(c.getAttribute("aria-describedby"))
            ?.textContent.length > 25,
      ),
    ),
  ).toBe(true);
});

test("twinkling stars and occasional meteors produce visible night-sky changes", async ({
  page,
}) => {
  const card = await boot(page, {
    members: [],
    period_override: "night",
    world: {
      objects: [],
      clouds: false,
      trees: false,
      water: false,
      waterfalls: false,
      windows: false,
      fireflies: false,
      stars: true,
      shooting_stars: false,
      moon: { enabled: false },
    },
  });
  await page.waitForTimeout(900);
  const first = await card.screenshot();
  await page.waitForTimeout(450);
  const second = await card.screenshot();
  expect(first.equals(second), "stars must change rendered pixels").toBe(false);
  await card.evaluate((c) =>
    c.setConfig({
      ...c._baseConfig,
      world: { ...c._baseConfig.world, stars: false, shooting_stars: true },
    }),
  );
  await page.waitForTimeout(700);
  const meteor = card.locator(".world-meteor").first();
  await meteor.evaluate(async (node) => {
    const a = node.getAnimations()[0];
    await a.ready;
    a.pause();
    a.currentTime = a.effect.getTiming().duration * 0.7;
  });
  const quiet = await card.screenshot();
  await meteor.evaluate((node) => {
    const a = node.getAnimations()[0];
    a.currentTime = a.effect.getTiming().duration * 0.85;
  });
  expect(
    Number(await meteor.evaluate((node) => getComputedStyle(node).opacity)),
  ).toBeGreaterThan(0.2);
  const passing = await card.screenshot();
  expect(
    quiet.equals(passing),
    "a meteor must appear in the visible opening",
  ).toBe(false);
});
