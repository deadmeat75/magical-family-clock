import { test, expect } from "@playwright/test";
const boot = async (page, editor = false) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  if (editor) await page.locator("#edit").click();
};
test("blank lettering remains blank across edit, normalize and reload configuration", async ({
  page,
}) => {
  await boot(page, true);
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.getByRole("button", { name: "People", exact: true }).click();
  await editor
    .getByRole("button", { name: "Remove hand lettering", exact: true })
    .first()
    .click();
  const card = page.locator("section magical-family-clock-card").first();
  await expect(
    card.locator(".hand").first().locator(".along-label"),
  ).toHaveCount(0);
  expect(await editor.evaluate((e) => e.config.members[0].name)).toBe("");
  expect(
    await card
      .locator(".hand")
      .first()
      .locator(".counter text")
      .first()
      .textContent(),
  ).toBe("");
  await editor.getByRole("button", { name: "General", exact: true }).click();
  await editor.getByRole("button", { name: "People", exact: true }).click();
  await expect(
    editor
      .getByLabel("Hand lettering (blank for none)", { exact: true })
      .first(),
  ).toHaveValue("");
});
test("per-label positions, fonts and sensor names update on the castle without moving destinations", async ({
  page,
}) => {
  await boot(page);
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate((c) => {
    const config = structuredClone(c._config);
    config.artwork = "castle";
    config.title = "Higher title";
    config.title_y = 22;
    config.caption_y = 28;
    config.title_color = "#55aaff";
    config.caption_opacity = 0.4;
    config.show_location_labels = true;
    config.locations[0] = {
      ...config.locations[0],
      label_mode: "sensor",
      label_entity: "sensor.room",
      label_fallback: "No room",
      x: 30,
      y: 18,
      size: 22,
      color: "#aaffcc",
    };
    config.demo = false;
    c.setConfig(config);
    c.hass = { states: { "sensor.room": { state: "Kitchen" } } };
  });
  await expect(card.locator(".castle-artwork")).toBeVisible();
  await expect(card.locator(".title")).toHaveAttribute("y", "132");
  await expect(card.locator(".label").first()).toHaveText("Kitchen");
  await expect(card.locator(".label").first()).toHaveAttribute("x", "180");
  await card.evaluate(
    (c) => (c.hass = { states: { "sensor.room": { state: "Bedroom" } } }),
  );
  await expect(card.locator(".label").first()).toHaveText("Bedroom");
  expect(await card.evaluate((c) => c._config.locations[0].angle)).toBe(-90);
});
test("clockwork gears actually rotate and pause when reduced motion is selected", async ({
  page,
}) => {
  await boot(page);
  const card = page.locator("section magical-family-clock-card").nth(1),
    gear = card.locator(".live-gear").first();
  await expect(gear).toBeVisible();
  const before = await gear.evaluate((e) => getComputedStyle(e).transform);
  await page.waitForTimeout(220);
  expect(await gear.evaluate((e) => getComputedStyle(e).transform)).not.toBe(
    before,
  );
  await card.evaluate((c) =>
    c.setConfig({ ...c._config, reduced_motion: true }),
  );
  expect(
    await gear.evaluate((e) => getComputedStyle(e).animationPlayState),
  ).toBe("paused");
});
test("castle motion and high resolution sources persist across season changes", async ({
  page,
}) => {
  await boot(page);
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate((c) =>
    c.setConfig({
      ...c._config,
      artwork: "castle",
      period_override: "day",
      weather_effect: "clouds",
      season_override: "summer",
      show_location_labels: true,
    }),
  );
  await expect(card.locator(".castle-artwork")).toBeVisible();
  const cloud = card.locator(".scene-cloud").first();
  const canvas = cloud.locator("canvas");
  await expect(canvas).toHaveAttribute("data-paint-tick", /\d+/);
  const before = await canvas.getAttribute("data-paint-tick");
  await expect
    .poll(() => canvas.getAttribute("data-paint-tick"))
    .not.toBe(before);
  const resolution = await card
    .locator(".hd-scene image")
    .first()
    .evaluate(async (e) => {
      const img = new Image();
      img.src = e.getAttribute("href");
      await img.decode();
      return img.naturalWidth;
    });
  expect(resolution).toBeGreaterThan(1200);
  await card.evaluate((c) => {
    c._config.season_override = "winter";
    c._update();
  });
  await expect(card.locator(".castle-artwork")).toHaveAttribute(
    "data-scene",
    "winter-day",
  );
  await card.evaluate((c) =>
    c.setConfig({ ...c._config, reduced_motion: true }),
  );
  expect(
    await cloud.evaluate((e) => getComputedStyle(e).animationPlayState),
  ).toBe("paused");
});
test("click, swipe and remembered face selection keep people and readings intact", async ({
  page,
}) => {
  await boot(page);
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate((c) => {
    const config = structuredClone(c._config);
    config.instance_id = "carousel-test";
    config.carousel = {
      enabled: true,
      remember: true,
      templates: [
        {
          id: "a",
          label: "Clockwork",
          theme: "brass-clockwork",
          artwork: "vector",
        },
        {
          id: "b",
          label: "Workshop",
          theme: "whimsical-workshop",
          artwork: "vector",
        },
        {
          id: "c",
          label: "Castle",
          theme: "living-magical",
          artwork: "castle",
        },
      ],
    };
    window.cycleConfig = config;
    c.setConfig(config);
    window.memberIds = c._config.members.map((m) => m.id);
  });
  await expect(card.locator(".template-name")).toHaveText("Clockwork");
  await card
    .getByRole("button", { name: "Next clock face", exact: true })
    .click();
  await expect(card.locator(".template-name")).toHaveText("Workshop");
  const frame = await card.locator(".frame").boundingBox();
  await page.mouse.move(
    frame.x + frame.width * 0.8,
    frame.y + frame.height * 0.6,
  );
  await page.mouse.down();
  await page.mouse.move(
    frame.x + frame.width * 0.2,
    frame.y + frame.height * 0.6,
    { steps: 5 },
  );
  await page.mouse.up();
  await expect(card.locator(".template-name")).toHaveText("Castle");
  expect(
    await card.evaluate((c) => c._config.members.map((m) => m.id)),
  ).toEqual(await page.evaluate(() => window.memberIds));
  await card.evaluate((c) => {
    const copy = document.createElement("magical-family-clock-card");
    copy.setConfig(window.cycleConfig);
    copy.hass = c._hass;
    c.replaceWith(copy);
  });
  await expect(
    page
      .locator("section magical-family-clock-card")
      .first()
      .locator(".template-name"),
  ).toHaveText("Castle");
});
test("preview ignores an older slow image and stays live across input and section changes", async ({
  page,
}) => {
  await page.route("**/slow-face.svg", async (route) => {
    await new Promise((r) => setTimeout(r, 650));
    await route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>',
    });
  });
  await page.route("**/fast-face.svg", (route) =>
    route.fulfill({
      contentType: "image/svg+xml",
      body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="blue"/></svg>',
    }),
  );
  await boot(page, true);
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.getByRole("button", { name: "Appearance", exact: true }).click();
  const faceBox = editor
    .getByText("Complete clock face", { exact: true })
    .locator("..");
  await faceBox
    .getByText("Use an image URL or /local/ path", { exact: true })
    .click();
  const field = editor.getByLabel("Complete clock face URL", { exact: true });
  await field.fill("/slow-face.svg");
  await page.waitForTimeout(40);
  await field.fill("/fast-face.svg");
  const preview = editor.locator("magical-family-clock-card");
  await expect(preview.locator(".face-image")).toHaveAttribute(
    "href",
    "/fast-face.svg",
  );
  await page.waitForTimeout(750);
  await expect(preview.locator(".face-image")).toHaveAttribute(
    "href",
    "/fast-face.svg",
  );
  await editor.getByRole("button", { name: "General", exact: true }).click();
  await editor.getByLabel("Title", { exact: true }).fill("Immediate preview");
  await expect(preview.locator(".title")).toHaveText("Immediate preview");
  await expect(preview.locator(".face-image")).toHaveAttribute(
    "href",
    "/fast-face.svg",
  );
});
test("people library GUI saves once and adds a separate configured person", async ({
  page,
}) => {
  await boot(page, true);
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.evaluate((e) => {
    const values = {};
    e.hass = {
      states: {},
      callWS: async (m) => {
        if (m.type === "frontend/get_user_data")
          return { value: values[m.key] };
        values[m.key] = structuredClone(m.value);
      },
    };
  });
  await editor.getByRole("button", { name: "People", exact: true }).click();
  await editor
    .getByLabel("Editor label", { exact: true })
    .first()
    .fill("Reusable Rowan");
  await editor
    .getByRole("button", { name: "Save person profile", exact: true })
    .first()
    .click();
  await expect(
    editor.getByText(
      "Profile saved to your Home Assistant account. Add it from Saved people on another clock.",
      { exact: true },
    ),
  ).toBeVisible();
  await editor
    .getByRole("button", { name: "Saved people", exact: true })
    .click();
  await expect(
    editor.getByText("Reusable Rowan", { exact: true }),
  ).toBeVisible();
  await editor
    .getByRole("button", { name: "Add person to this clock", exact: true })
    .click();
  await expect(editor.getByLabel("Display name", { exact: true })).toHaveCount(
    5,
  );
  expect(
    await editor.evaluate(
      (e) => e.config.members[0].id !== e.config.members[4].id,
    ),
  ).toBe(true);
});
test("bezel renders live data and every ordinary control has inline guidance", async ({
  page,
}) => {
  await boot(page, true);
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.getByRole("button", { name: "Bezel", exact: true }).click();
  await editor
    .getByRole("button", { name: "Add time and date examples", exact: true })
    .click();
  const preview = editor.locator("magical-family-clock-card");
  await expect(preview.locator(".bezel-value")).toHaveCount(2);
  expect(
    (await preview.locator(".bezel-value").first().textContent()).length,
  ).toBeGreaterThan(3);
  for (const section of [
    "General",
    "People",
    "Locations",
    "Labels & effects",
    "Face cycling",
  ]) {
    await editor.getByRole("button", { name: section, exact: true }).click();
    expect(
      await editor.evaluate((e) =>
        [
          ...e.shadowRoot.querySelectorAll(
            "label input,label select,label textarea,label ha-selector",
          ),
        ].every(
          (c) =>
            c.getAttribute("aria-describedby") &&
            e.shadowRoot.getElementById(c.getAttribute("aria-describedby"))
              ?.textContent.length > 25,
        ),
      ),
    ).toBe(true);
  }
});
test("surface effects respond independently and a hidden portrait leaves a plain dimensional hand", async ({
  page,
}) => {
  await boot(page);
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate((c) => {
    const config = structuredClone(c._config);
    config.members[0].material = "wood";
    config.members[0].finish = "brushed";
    config.members[0].show_portrait = false;
    config.effects.hands.reflection = 0;
    config.effects.hands.glare = 0;
    config.effects.frame.patina = 0.8;
    c.setConfig(config);
  });
  await expect(card.locator(".hand-head").first()).toBeHidden();
  await expect(card.locator(".hand > path").first()).toHaveAttribute(
    "fill",
    /url\(#crafted-hand-/,
  );
  expect(
    await card
      .locator(".hand-reflection")
      .first()
      .evaluate((e) => Number(getComputedStyle(e).opacity)),
  ).toBe(0);
  await expect(card.locator(".frame-finish circle").nth(1)).toHaveAttribute(
    "opacity",
    "0.52",
  );
});
test("choosing castle artwork preserves custom locations and people", async ({
  page,
}) => {
  await boot(page, true);
  const editor = page.locator("magical-family-clock-card-editor");
  const before = await editor.evaluate((e) => ({
    locations: e.config.locations,
    members: e.config.members,
  }));
  await editor.getByRole("button", { name: "Appearance", exact: true }).click();
  await editor
    .getByRole("button", { name: "Use layered castle artwork", exact: true })
    .click();
  expect(
    await editor.evaluate((e) => ({
      locations: e.config.locations,
      members: e.config.members,
    })),
  ).toEqual(before);
  await expect(
    editor.locator("magical-family-clock-card").locator(".castle-artwork"),
  ).toBeVisible();
});
test("failed image has a retry action that recovers without changing configuration", async ({
  page,
}) => {
  let attempts = 0;
  await page.route("**/recover-face.svg", (route) => {
    attempts++;
    return attempts === 1
      ? route.fulfill({ status: 503, body: "offline" })
      : route.fulfill({
          contentType: "image/svg+xml",
          body: '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><circle cx="50" cy="50" r="49" fill="gold"/></svg>',
        });
  });
  await boot(page);
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate((c) =>
    c.setConfig({ ...c._config, face_image: "/recover-face.svg" }),
  );
  const before = await card.evaluate((c) => c._baseConfig);
  await expect(card.locator(".face-image")).toBeHidden();
  await expect(card.locator(".image-status")).toContainText(
    "Face image could not load",
  );
  expect(attempts).toBe(1);
  await card.getByRole("button", { name: "Retry images", exact: true }).click();
  await expect(card.locator(".face-image")).toHaveAttribute(
    "href",
    "/recover-face.svg",
  );
  await expect(card.locator(".face-image")).toBeVisible();
  await expect(card.locator(".image-status")).toBeHidden();
  expect(await card.evaluate((c) => c._baseConfig)).toEqual(before);
  // The retry must issue a fresh request. Some Chromium versions also fetch
  // again when the preloaded image is assigned to SVG, independently of retries.
  expect(attempts).toBeGreaterThanOrEqual(2);
});

test("text-color picker updates hand lettering and portrait initials in the live preview", async ({
  page,
}) => {
  await boot(page, true);
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.evaluate((e) => {
    const c = structuredClone(e.config);
    c.members[0].portrait = "";
    c.members[0].show_portrait = true;
    e.setConfig(c);
  });
  await editor.getByRole("button", { name: "People", exact: true }).click();
  await editor
    .getByText("Customize hand and portrait", { exact: true })
    .first()
    .click();
  await editor
    .getByLabel("Text color", { exact: true })
    .first()
    .fill("#42ccaa");
  const preview = editor.locator("magical-family-clock-card");
  await expect(preview.locator(".portrait-initials").first()).toHaveAttribute(
    "fill",
    "#42ccaa",
  );
  expect(await editor.evaluate((e) => e.config.members[0].text_color)).toBe(
    "#42ccaa",
  );
  await editor.getByRole("button", { name: "General", exact: true }).click();
  await editor
    .getByLabel("Clock theme", { exact: true })
    .selectOption("brass-clockwork");
  await editor.getByRole("button", { name: "People", exact: true }).click();
  const customization = editor
    .getByText("Customize hand and portrait", { exact: true })
    .first();
  if ((await customization.locator("..").getAttribute("open")) === null)
    await customization.click();
  await editor
    .getByLabel("Text color", { exact: true })
    .first()
    .fill("#fff5dc");
  await expect(preview.locator(".engraved").first()).toHaveAttribute(
    "fill",
    "#fff5dc",
  );
  await expect(preview.locator(".portrait-initials").first()).toHaveAttribute(
    "fill",
    "#fff5dc",
  );
});

test("bezel readout text colors can be edited independently in the GUI", async ({
  page,
}) => {
  await boot(page, true);
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.evaluate((e) =>
    e.setConfig({
      ...e.config,
      bezel: {
        enabled: true,
        width: 64,
        material: "silver",
        items: [
          {
            id: "top",
            kind: "text",
            text: "CLEAR SKIES",
            angle: -90,
            color: "#eeeecc",
          },
          {
            id: "bottom",
            kind: "text",
            text: "HOME",
            angle: 90,
            color: "#ddeecc",
          },
        ],
      },
    }),
  );
  await editor.getByRole("button", { name: "Bezel", exact: true }).click();
  await editor
    .getByLabel("Readout color", { exact: true })
    .first()
    .fill("#3873c4");
  expect(await editor.evaluate((e) => e.config.bezel.items[0].color)).toBe(
    "#3873c4",
  );
  expect(await editor.evaluate((e) => e.config.bezel.items[1].color)).toBe(
    "#ddeecc",
  );
  await expect(editor.locator(".bezel-value").first()).toHaveAttribute(
    "fill",
    "#3873c4",
  );
  await expect(editor.locator(".bezel-value").nth(1)).toHaveAttribute(
    "fill",
    "#ddeecc",
  );
});
