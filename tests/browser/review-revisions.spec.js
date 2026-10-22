import { test, expect } from "@playwright/test";
async function card(page, extra = {}) {
  await page.goto("/");
  const c = page.locator("section magical-family-clock-card").first();
  await c.evaluate(
    (c, extra) =>
      c.setConfig({
        ...c._baseConfig,
        demo: false,
        artwork: "vector",
        theme: "astronomical",
        show_branding: false,
        background_transition: 0,
        ...extra,
      }),
    extra,
  );
  return c;
}
test("astronomical face responds to sensor phases and real time independently of decorative animation", async ({
  page,
}) => {
  const c = await card(page, {
    world: {
      moon: {
        enabled: true,
        source: "entity",
        entity: "sensor.moon",
        fallback: "hide",
      },
    },
    scene_motion: false,
  });
  await c.evaluate(
    (c) =>
      (c.hass = {
        states: { "sensor.moon": { state: "first_quarter" } },
        config: { time_zone: "America/Los_Angeles" },
      }),
  );
  await expect(c.locator(".astronomical-moon image")).toHaveAttribute(
    "data-lunar-phase",
    "0.25",
  );
  await expect(c.locator('[data-reading="moon"]')).toContainText("50%");
  await expect(c.locator('[data-rotor="day"]')).toHaveAttribute(
    "transform",
    /rotate/,
  );
  await c.evaluate(
    (c) =>
      (c.hass = {
        states: { "sensor.moon": { state: "full_moon" } },
        config: { time_zone: "America/Los_Angeles" },
      }),
  );
  await expect(c.locator(".astronomical-moon image")).toHaveAttribute(
    "data-lunar-phase",
    "0.5",
  );
});
test("attachment lettering preserves blank labels and responds to alignment and font controls", async ({
  page,
}) => {
  const c = await card(page, {
    members: [
      {
        id: "rowan",
        entity: "person.rowan",
        name: "Rowan",
        hand_label: "Rowan",
        name_attachment: "parchment",
        text_color: "#37271b",
        attachment_align: "end",
        attachment_text_size: 75,
        attachment_font: "Caveat",
        attachment_text_rotation: 12,
        attachment_text_x: 20,
      },
    ],
  });
  await expect(c.locator(".attachment-lettering")).toHaveAttribute(
    "text-anchor",
    "end",
  );
  await expect(c.locator(".attachment-lettering")).toHaveAttribute(
    "fill",
    "#37271b",
  );
  await expect(c.locator(".attachment-lettering")).toHaveAttribute(
    "transform",
    /rotate\(12/,
  );
  await c.evaluate((c) =>
    c.setConfig({
      ...c._baseConfig,
      members: c._baseConfig.members.map((m) => ({ ...m, hand_label: "" })),
    }),
  );
  await expect(c.locator(".attachment-lettering")).toHaveCount(0);
});
test("bezel labels follow arcs while updating sensor readouts", async ({
  page,
}) => {
  const c = await card(page, {
    bezel: {
      enabled: true,
      width: 50,
      items: [
        {
          id: "speed",
          kind: "sensor",
          entity: "sensor.speed",
          angle: -90,
          size: 15,
        },
      ],
    },
  });
  await c.evaluate(
    (c) =>
      (c.hass = {
        states: {
          "sensor.speed": {
            state: "42",
            attributes: { unit_of_measurement: "km/h" },
          },
        },
      }),
  );
  await expect(c.locator(".bezel-value textPath")).toContainText("42");
  await expect(c.locator(".bezel-value textPath")).toHaveAttribute(
    "startOffset",
    "50%",
  );
});
test("ice is clipped to the central scene and panel textures span the whole dial", async ({
  page,
}) => {
  const c = await card(page, {
    artwork: "castle",
    weather_effect: "ice",
    location_panels: { texture: "parchment", inner_radius: 175 },
  });
  await expect(c.locator(".weather")).toHaveAttribute(
    "clip-path",
    "url(#castle-opening)",
  );
  await expect(c.locator(".frost-film")).toHaveAttribute("r", "175");
  await expect(c.locator("#parchment")).toHaveAttribute("width", "600");
});

test("foreground firefly light stays within the actual circular scene opening", async ({
  page,
}) => {
  const c = await card(page, {
    artwork: "castle",
    period_override: "night",
    world: {
      objects: [],
      fireflies: true,
      clouds: false,
      moon: { enabled: false },
    },
  });
  await expect
    .poll(() => c.evaluate((c) => Boolean(c._worldPainter)))
    .toBe(true);
  const samples = await c.evaluate(async (c) => {
    await c._worldPainter.ready;
    const canvas = c.shadowRoot.querySelector(
      'canvas[data-world-paint="fireflies"]',
    );
    return [0, 2, 4, 7].map((t) => {
      c._worldPainter.seek(t);
      const data = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height).data;
      let visible = 0,
        total = 0;
      for (let n = 0; n < data.length / 4; n++)
        if (data[n * 4 + 3] > 20) {
          const x = 108 + ((n % canvas.width) * 384) / canvas.width,
            y = 90 + (Math.floor(n / canvas.width) * 384) / canvas.height;
          total++;
          if (
            Math.hypot(x - 300, y - 282) <
            c._config.location_panels.inner_radius
          )
            visible++;
        }
      return { total, ratio: visible / total };
    });
  });
  for (const sample of samples) {
    expect(sample.total).toBeGreaterThan(50);
    expect(sample.ratio).toBeGreaterThan(0.85);
  }
});
