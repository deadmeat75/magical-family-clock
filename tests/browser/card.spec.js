import { test, expect } from "@playwright/test";
import { readFileSync } from "node:fs";
test("production candidate coexists with the installed legacy custom element", async ({
  page,
}) => {
  const source = process.env.MFC_LEGACY_JS
    ? readFileSync(process.env.MFC_LEGACY_JS, "utf8")
    : `customElements.define('magical-family-clock',class extends HTMLElement {setConfig(c){this.config=c;}set hass(h){this._hass=h;}getCardSize(){return 5;}});`;
  await page.addInitScript({ content: source });
  await page.goto("/?production");
  await page.waitForSelector("section magical-family-clock-card");
  const result = await page.evaluate(() => {
    const old = customElements.get("magical-family-clock");
    const fresh = customElements.get("magical-family-clock-card");
    const element = document.createElement("magical-family-clock");
    element.setConfig({});
    element.hass = { states: {} };
    document.body.appendChild(element);
    return {
      distinct: old !== fresh,
      oldSize: element.getCardSize(),
      newEditor: !!fresh.getConfigElement().setConfig,
      oldPickerCount: window.customCards.filter(
        (c) => c.type === "magical-family-clock",
      ).length,
      newPickerCount: window.customCards.filter(
        (c) => c.type === "magical-family-clock-card",
      ).length,
    };
  });
  expect(result.distinct).toBe(true);
  expect(result.oldSize).toBe(5);
  expect(result.newEditor).toBe(true);
  expect(result.newPickerCount).toBe(1);
  if (process.env.MFC_LEGACY_JS) expect(result.oldPickerCount).toBe(1);
});
test("reference face loads independently, aligns the selected pivot and preserves four original-style hands", async ({
  page,
}) => {
  await page.route("**/local/magical-clock/clock-face.png", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="700" height="700"><circle cx="350" cy="329" r="290" fill="#182d36"/></svg>',
    }),
  );
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(async () => {
    const { legacyLayout } = await import("/src/engine.js");
    const card = document.querySelector("magical-family-clock-card");
    const c = legacyLayout("standalone");
    c.members = card._config.members.map((m) => ({
      ...m,
      show_portrait: false,
    }));
    card.setConfig(c);
  });
  const card = page.locator("section magical-family-clock-card").first();
  await expect(card.locator(".face-image")).toBeVisible();
  await expect(card.locator(".locations")).toBeHidden();
  await expect(card.locator(".hands")).toHaveAttribute(
    "transform",
    "translate(0 -18)",
  );
  await expect(card.locator(".hand")).toHaveCount(4);
  await expect(card.locator(".along-label")).toHaveCount(4);
  await expect(card.locator(".hand > g").first()).toBeHidden();
});
test("broken reference face retains the bundled artwork and labels", async ({
  page,
}) => {
  await page.route("**/missing-face.png", (route) =>
    route.fulfill({ status: 404, body: "missing" }),
  );
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(() => {
    const card = document.querySelector("magical-family-clock-card");
    card.setConfig({
      ...card._config,
      face_image: "/missing-face.png",
      show_location_labels: false,
    });
  });
  const card = page.locator("section magical-family-clock-card").first();
  await expect(card.locator(".face-image")).toBeHidden();
  await expect(card.locator(".locations")).toBeVisible();
  await expect(card.locator(".hand")).toHaveCount(4);
});
test("editor requests the built-in HA form components when selectors are unloaded", async ({
  page,
}) => {
  await page.addInitScript(() => {
    window.mfcHelperCalls = 0;
    window.loadCardHelpers = async () => ({
      createCardElement: () => ({
        constructor: {
          getConfigElement: async () => {
            window.mfcHelperCalls++;
            if (!customElements.get("ha-selector"))
              customElements.define(
                "ha-selector",
                class extends HTMLElement {},
              );
          },
        },
      }),
    });
  });
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.getByRole("button", { name: "Open visual editor" }).click();
  await expect.poll(() => page.evaluate(() => window.mfcHelperCalls)).toBe(1);
  await page
    .locator("magical-family-clock-card-editor")
    .getByRole("button", { name: "People", exact: true })
    .click();
  await expect(
    page.locator("magical-family-clock-card-editor ha-selector"),
  ).toHaveCount(8);
});
test("portraits remain clipped and upright, stacking recomputes on state changes", async ({
  page,
}) => {
  await page.route("**/portrait.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60"><rect width="60" height="60" fill="green"/></svg>',
    }),
  );
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(() => {
    const card = document.querySelector("magical-family-clock-card");
    const c = card._config;
    c.collision = "stack";
    c.members[0].portrait = "/portrait.svg";
    c.members[0].portrait_rotation = 20;
    card.setConfig(c);
  });
  const card = page.locator("section magical-family-clock-card").first();
  await expect(card.locator(".hand image")).toHaveCount(1);
  await expect(card.locator(".hand image")).toHaveAttribute(
    "transform",
    "rotate(20)",
  );
  const old = await card
    .locator(".hand")
    .nth(1)
    .locator(":scope > g:not(.along-label)")
    .getAttribute("transform");
  await page.evaluate(() => {
    const card = document.querySelector("magical-family-clock-card");
    const states = {};
    card._config.members.forEach(
      (m, i) => (states[m.entity] = { state: i === 1 ? "not_home" : "home" }),
    );
    card.hass = { states };
  });
  await expect(
    card.locator(".hand").nth(1).locator(":scope > g:not(.along-label)"),
  ).not.toHaveAttribute("transform", old);
  expect(
    await card
      .locator(".hand")
      .first()
      .evaluate(
        (e) =>
          parseFloat(e.style.transform.match(/[-\d.]+/)[0]) +
          parseFloat(
            e.querySelector(".counter").style.transform.match(/[-\d.]+/)[0],
          ),
      ),
  ).toBe(0);
});
test("appearance presets save and load without changing household configuration", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.getByRole("button", { name: "Open visual editor" }).click();
  const e = page.locator("magical-family-clock-card-editor");
  await e.getByRole("button", { name: "Presets", exact: true }).click();
  await e.getByLabel("Preset name").fill("My brass");
  await e.getByRole("button", { name: "Save appearance preset" }).click();
  expect(await e.getByLabel("Saved appearance preset").inputValue()).toBe(
    "My brass",
  );
  const stored = await page.evaluate(() =>
    localStorage.getItem("magical-family-clock-presets"),
  );
  expect(stored).not.toContain("Rowan");
  expect(stored).not.toContain("sensor.mfc_demo");
  await e.getByRole("button", { name: "Load appearance preset" }).click();
  expect(
    await page
      .locator("section magical-family-clock-card")
      .first()
      .evaluate((c) => c._config.members[0].name),
  ).toBe("Rowan");
});
test("background changes retain hands and use configured fade opacity", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(() => {
    const card = document.querySelector("magical-family-clock-card");
    card.setConfig({
      ...card._config,
      background_mode: "manual",
      background: "night",
      background_images: { night: "/night.svg" },
      background_opacity: 0.7,
      background_transition: 0,
    });
    window.mfcFirstHand = card.shadowRoot.querySelector(".hand");
  });
  const card = page.locator("section magical-family-clock-card").first();
  await expect(card.locator(".background-image").first()).toHaveAttribute(
    "href",
    "/night.svg",
  );
  await expect(card.locator(".background-image").first()).toHaveCSS(
    "opacity",
    "0.7",
  );
  await page.evaluate(() => {
    const card = document.querySelector("magical-family-clock-card");
    card.hass = { states: {} };
  });
  expect(
    await page.evaluate(
      () =>
        window.mfcFirstHand ===
        document
          .querySelector("magical-family-clock-card")
          .shadowRoot.querySelector(".hand"),
    ),
  ).toBe(true);
});
test("four themes render all four coincident hands and move independently", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  const cards = page.locator("section magical-family-clock-card");
  await expect(cards).toHaveCount(4);
  for (let i = 0; i < 4; i++) {
    await expect(cards.nth(i).locator(".hand")).toHaveCount(4);
    await expect(cards.nth(i).locator(".empty")).toBeHidden();
    const transforms = await cards
      .nth(i)
      .locator(".hand")
      .evaluateAll((es) => es.map((e) => e.style.transform));
    expect(new Set(transforms).size).toBe(4);
  }
  const before = await cards
    .nth(0)
    .locator(".hand")
    .first()
    .getAttribute("style");
  await page.getByRole("button", { name: "Move household" }).click();
  await expect(cards.nth(0).locator(".hand").first()).not.toHaveAttribute(
    "style",
    before,
  );
  await page.evaluate(() => {
    const a = document.querySelector("magical-family-clock-card");
    a.setConfig({ ...a._config, title: "Independent" });
  });
  await expect(cards.nth(0).locator(".title")).toHaveText("Independent");
  await expect(cards.nth(1).locator(".title")).toHaveText("The Wayfarers");
  expect(errors).toEqual([]);
});
test("editor persists consecutive changes, people CRUD and import validation", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.getByRole("button", { name: "Open visual editor" }).click();
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.getByLabel("Title", { exact: true }).fill("Kitchen");
  await editor.getByLabel("Title", { exact: true }).dispatchEvent("change");
  await editor
    .getByText("Advanced layout and rendering", { exact: true })
    .click();
  await editor.getByLabel("Maximum size (pixels)").fill("550");
  await editor.getByLabel("Maximum size (pixels)").dispatchEvent("change");
  await expect(
    page.locator("section magical-family-clock-card").first().locator(".title"),
  ).toHaveText("Kitchen");
  await editor.getByRole("button", { name: "People", exact: true }).click();
  await editor.getByRole("button", { name: "Add person", exact: true }).click();
  await expect(editor.getByLabel("Display name", { exact: true })).toHaveCount(
    5,
  );
  await editor.getByRole("button", { name: "Remove person" }).last().click();
  await expect(editor.getByLabel("Display name", { exact: true })).toHaveCount(
    4,
  );
  await editor.getByRole("button", { name: "Presets", exact: true }).click();
  await editor.getByLabel("Configuration JSON").fill('{"version":99}');
  await editor
    .getByRole("button", { name: "Import configuration", exact: true })
    .click();
  await expect(editor.getByRole("alert")).toContainText("Unsupported");
  await editor
    .getByRole("button", { name: "Export configuration", exact: true })
    .click();
  const exported = await editor.getByLabel("Configuration JSON").inputValue();
  expect(exported).not.toContain("Rowan");
  expect(exported).not.toContain("sensor.mfc_demo");
});
test("narrow display, theme switch, safe text and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(() => {
    const card = document.querySelector("magical-family-clock-card");
    card.setConfig({
      ...card._config,
      title: "<img src=x onerror=alert(1)>",
      theme: "living-magical",
    });
  });
  const card = page.locator("section magical-family-clock-card").first();
  await expect(card.locator(".title")).toHaveText(
    "<img src=x onerror=alert(1)>",
  );
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
  await expect(card.locator(".hand")).toHaveCount(4);
  expect(
    await card
      .locator(".hand")
      .first()
      .evaluate((e) => getComputedStyle(e).transitionDuration),
  ).toBe("0s");
});
test("screenshots of original themes", async ({ page, browserName }) => {
  test.skip(browserName !== "chromium", "Capture once");
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.waitForTimeout(100);
  const cards = page.locator("section magical-family-clock-card");
  for (const [i, name] of [
    "enchanted-spoons",
    "brass-clockwork",
    "living-magical",
    "whimsical-workshop",
  ].entries())
    await cards
      .nth(i)
      .screenshot({ path: `docs/${name}.png`, animations: "disabled" });
});
test("production bundle registers editor and picker, survives rapid states and theme switching", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/?production");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(() => {
    const card = document.querySelector("magical-family-clock-card");
    for (let i = 0; i < 30; i++) {
      card.hass = {
        states: { "sensor.mfc_demo_0": { state: i % 2 ? "home" : "not_home" } },
      };
    }
    card.setConfig({ ...card._config, theme: "brass-clockwork" });
  });
  await expect(
    page.locator("section magical-family-clock-card").first().locator(".hand"),
  ).toHaveCount(4);
  const registered = await page.evaluate(() => ({
    picker: window.customCards.some(
      (c) => c.type === "magical-family-clock-card",
    ),
    editor: !!customElements.get("magical-family-clock-card").getConfigElement()
      .setConfig,
  }));
  expect(registered).toEqual({ picker: true, editor: true });
  expect(errors).toEqual([]);
});
test("location dial keyboard editing persists and spacing changes all angles", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.getByRole("button", { name: "Open visual editor" }).click();
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.getByRole("button", { name: "Locations", exact: true }).click();
  const slider = editor.getByRole("slider", { name: "Home", exact: true });
  await slider.focus();
  await page.keyboard.press("ArrowRight");
  await expect(
    editor.getByRole("slider", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-valuenow", "-89");
  await editor.getByRole("button", { name: "Space locations evenly" }).click();
  await expect(
    editor.getByRole("slider", { name: "Home", exact: true }),
  ).toHaveAttribute("aria-valuenow", "-90");
});
test("fullscreen fallback enters and exits without altering other cards", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(() => {
    document
      .querySelector("magical-family-clock-card")
      .shadowRoot.querySelector("ha-card").requestFullscreen = undefined;
  });
  const first = page.locator("section magical-family-clock-card").first();
  await first.getByRole("button", { name: "Expand clock" }).click();
  await expect(first.locator("ha-card")).toHaveClass(/expanded/);
  await expect(
    page.locator("section magical-family-clock-card").nth(1).locator("ha-card"),
  ).not.toHaveClass(/expanded/);
  await first.getByRole("button", { name: "Expand clock" }).click();
  await expect(first.locator("ha-card")).not.toHaveClass(/expanded/);
});
test("editor uses HA selector contract and preserves entity changes", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.getByRole("button", { name: "Open visual editor" }).click();
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.getByRole("button", { name: "People", exact: true }).click();
  await editor
    .locator("ha-selector")
    .first()
    .evaluate((e) =>
      e.dispatchEvent(
        new CustomEvent("value-changed", {
          detail: { value: "person.example" },
        }),
      ),
    );
  expect(
    await page
      .locator("section magical-family-clock-card")
      .first()
      .evaluate((e) => e._config.members[0].entity),
  ).toBe("person.example");
  expect(
    await editor
      .locator("ha-selector")
      .first()
      .evaluate((e) => e.selector.entity.domain),
  ).toContain("person");
});

test("layered castle loads sixteen scene cells beneath a fixed frame and keeps hands", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(async () => {
    const { legacyLayout } = await import("/src/engine.js");
    const card = document.querySelector("magical-family-clock-card");
    const config = legacyLayout();
    config.members = card._config.members;
    config.artwork = "castle";
    config.face_image = "";
    config.pivot_y = 47;
    config.duration = 0;
    config.background_transition = 0;
    card.setConfig(config);
    window.castleHand = card.shadowRoot.querySelector(".hand");
  });
  const card = page.locator("section magical-family-clock-card").first();
  const artwork = card.locator(".castle-artwork");
  await expect(artwork).toBeVisible();
  const frame = await card.locator(".castle-frame").getAttribute("href");
  for (const season of ["spring", "summer", "autumn", "winter"])
    for (const period of ["dawn", "day", "dusk", "night"]) {
      await card.evaluate(
        (card, { season, period }) => {
          card._config.season_override = season;
          card._config.period_override = period;
          card._update();
        },
        { season, period },
      );
      await expect(artwork).toHaveAttribute(
        "data-scene",
        season + "-" + period,
      );
    }
  expect(await card.locator(".castle-frame").getAttribute("href")).toBe(frame);
  expect(
    await page.evaluate(
      () =>
        window.castleHand ===
        document
          .querySelector("magical-family-clock-card")
          .shadowRoot.querySelector(".hand"),
    ),
  ).toBe(true);
  await card.screenshot({ path: "docs/layered-castle.png" });
});
test("broken layered scene keeps its previous frame, scene and hands", async ({
  page,
}) => {
  await page.route("**/broken-scene.png", (route) =>
    route.fulfill({ status: 404, body: "missing" }),
  );
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate((card) => {
    card.setConfig({
      ...card._config,
      artwork: "castle",
      face_image: "",
      period_override: "day",
      season_override: "summer",
    });
  });
  const art = card.locator(".castle-artwork");
  await expect(art).toHaveAttribute("data-scene", "summer-day");
  await card.evaluate((card) => {
    card._config.background_images["winter-night"] = "/broken-scene.png";
    card._config.season_override = "winter";
    card._config.period_override = "night";
    card._update();
  });
  await expect
    .poll(() => card.evaluate((c) => c._sceneError))
    .toContain("keeping");
  await expect(art).toHaveAttribute("data-scene", "summer-day");
  await expect(card.locator(".hand")).toHaveCount(4);
});
