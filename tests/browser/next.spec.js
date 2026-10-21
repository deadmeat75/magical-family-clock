import { test, expect } from "@playwright/test";
test("new face, caption, metrics and weather update safely without replacing hands", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(() => {
    const card = document.querySelector("section magical-family-clock-card");
    const c = structuredClone(card._config);
    c.theme = "whimsical-workshop";
    c.caption = "<Custom family>";
    c.weather_effect = "snow";
    c.members[0].metrics = [
      { entity: "sensor.battery", label: "Battery", unit: "%", decimals: 0 },
    ];
    c.demo = false;
    card.setConfig(c);
    card.hass = {
      states: { "sensor.battery": { state: "74", attributes: {} } },
    };
    window.savedHand = card.shadowRoot.querySelector(".hand");
  });
  const card = page.locator("section magical-family-clock-card").first();
  await expect(card.locator(".caption")).toHaveText("<Custom family>");
  await expect(card.locator(".weather")).toHaveAttribute(
    "data-weather",
    "snow",
  );
  await expect(card.locator(".metric").first()).toHaveText("Battery: 74 %");
  expect(
    await page.evaluate(() => {
      const c = document.querySelector("section magical-family-clock-card");
      c.hass = { states: { "sensor.battery": { state: "unavailable" } } };
      return window.savedHand === c.shadowRoot.querySelector(".hand");
    }),
  ).toBe(true);
  await expect(card.locator(".metric").first()).toHaveText("");
});
test("GUI image upload embeds optimized raster and rejects SVG", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.locator("#edit").click();
  await page.waitForSelector("magical-family-clock-card-editor");
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.getByRole("button", { name: "People", exact: true }).click();
  const input = editor.getByLabel("Upload Portrait", { exact: true }).first();
  await input.setInputFiles({
    name: "bad.svg",
    mimeType: "image/svg+xml",
    buffer: Buffer.from("<svg/>"),
  });
  await expect(
    editor.getByText(
      "Choose a PNG, JPEG, or WebP image. SVG and animated formats are not supported.",
    ),
  ).toBeVisible();
  await input.setInputFiles({
    name: "portrait.png",
    mimeType: "image/png",
    buffer: Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+j0N8AAAAASUVORK5CYII=",
      "base64",
    ),
  });
  await expect(editor.getByAltText("Portrait preview").first()).toBeVisible();
  expect(
    await editor.evaluate((e) =>
      e.config.members[0].portrait.startsWith("data:image/"),
    ),
  ).toBe(true);
});
test("saved clocks GUI loads independent copies through Home Assistant storage API", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.locator("#edit").click();
  await page.waitForSelector("magical-family-clock-card-editor");
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.evaluate((e) => {
    let value = null;
    e.hass = {
      states: {},
      callWS: async (m) => {
        if (m.type === "frontend/get_user_data") return { value };
        value = structuredClone(m.value);
      },
    };
  });
  await editor
    .getByRole("button", { name: "Saved clocks", exact: true })
    .click();
  await editor.getByLabel("Saved clock name", { exact: true }).fill("Hallway");
  await editor
    .getByRole("button", { name: "Save as new clock", exact: true })
    .click();
  await expect(editor.getByText("Hallway", { exact: true })).toBeVisible();
  await editor
    .getByRole("button", { name: "Duplicate saved clock", exact: true })
    .click();
  await expect(editor.getByText("Hallway copy", { exact: true })).toBeVisible();
  await editor
    .getByRole("button", { name: "Load independent copy", exact: true })
    .first()
    .click();
  await expect(
    editor.getByLabel("Clock caption (blank to hide)"),
  ).toBeVisible();
});
test("weather animation can stop independently and empty captions remain empty", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.evaluate(() => {
    const card = document.querySelector("section magical-family-clock-card");
    card.setConfig({
      ...card._config,
      weather_effect: "lightning",
      weather_motion: false,
      caption: "",
    });
  });
  const card = page.locator("section magical-family-clock-card").first();
  await expect(card.locator(".caption")).toBeEmpty();
  expect(
    await card
      .locator(".fall")
      .first()
      .evaluate((e) => getComputedStyle(e).animationPlayState),
  ).toBe("paused");
  expect(
    await card
      .locator(".flash")
      .evaluate((e) => getComputedStyle(e).animationName),
  ).toBe("none");
});
test("GUI exposes hand shapes, width, sensor readings and dynamic location rules", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  await page.locator("#edit").click();
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.getByRole("button", { name: "People", exact: true }).click();
  await editor
    .getByText("Customize hand and portrait", { exact: true })
    .first()
    .click();
  await editor
    .getByLabel("Hand design", { exact: true })
    .first()
    .selectOption("leaf");
  await editor
    .getByLabel("Hand width (0.5–2.5)", { exact: true })
    .first()
    .fill("1.8");
  await editor
    .getByLabel("Hand width (0.5–2.5)", { exact: true })
    .first()
    .dispatchEvent("change");
  await editor
    .getByText("Optional hand information and location rules", { exact: true })
    .first()
    .click();
  await editor
    .getByRole("button", { name: "Add hand information", exact: true })
    .first()
    .click();
  // The editor retains open sections when adding a reading.
  await editor.getByLabel("Reading label", { exact: true }).fill("Battery");
  await editor
    .getByLabel("Reading label", { exact: true })
    .dispatchEvent("change");
  await editor
    .getByLabel("Reading placement", { exact: true })
    .selectOption("above");
  expect(
    await editor.evaluate((e) => ({
      shape: e.config.members[0].hand_design,
      width: e.config.members[0].width,
      metric: e.config.members[0].metrics[0],
    })),
  ).toMatchObject({
    shape: "leaf",
    width: 1.8,
    metric: { label: "Battery", placement: "above" },
  });
});
