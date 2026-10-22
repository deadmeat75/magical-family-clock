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
test("illustrated discs respond to sensors without astronomical hands or scales", async ({
  page,
}) => {
  const c = await card(page, {
    members: [],
    weather_effect: "auto",
    weather_entity: "weather.home",
    sun_entity: "sun.sun",
    season_override: "summer",
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
  const update = (phase) =>
    c.evaluate(
      (c, phase) =>
        (c.hass = {
          states: {
            "sensor.moon": { state: phase },
            "sun.sun": { state: "below_horizon" },
            "weather.home": { state: "snowy" },
          },
          config: { time_zone: "America/Los_Angeles" },
        }),
      phase,
    );
  await update("first_quarter");
  await expect(c.locator('[data-moon-cell="2"]')).toHaveAttribute(
    "data-lunar-phase",
    "0.25",
  );
  await expect(c.locator('[data-reading="moon"]')).toHaveText("FIRST QUARTER");
  await expect(c.locator('[data-reading="period"]')).toHaveText("NIGHT");
  await expect(c.locator('[data-reading="season"]')).toHaveText("SUMMER");
  await expect(c.locator('[data-reading="weather"]')).toHaveText("SNOW");
  await expect(c.locator(".astronomical-disc")).toHaveCount(4);
  await expect(
    c.locator(".astro-clock,.astro-hour,.astro-minute,[data-scale]"),
  ).toHaveCount(0);
  await update("waning_crescent");
  const before = await c
    .locator('[data-rotor="moon"]')
    .getAttribute("data-index");
  await update("new_moon");
  const after = await c
    .locator('[data-rotor="moon"]')
    .getAttribute("data-index");
  expect(Number(after) - Number(before)).toBe(1);
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

test("castle window illumination excludes foreground foliage", async ({
  page,
}) => {
  const c = await card(page, {
    artwork: "castle",
    period_override: "night",
    world: {
      objects: [],
      clouds: false,
      windows: true,
      trees: false,
      moon: { enabled: false },
    },
  });
  await expect
    .poll(() => c.evaluate((c) => Boolean(c._worldPainter)))
    .toBe(true);
  const result = await c.evaluate(async (c) => {
    await c._worldPainter.ready;
    c._worldPainter.seek(3);
    const canvas = c.shadowRoot.querySelector(
        'canvas[data-world-paint="windows"]',
      ),
      data = canvas
        .getContext("2d")
        .getImageData(0, 0, canvas.width, canvas.height).data;
    let lit = 0,
      foliage = 0;
    for (let n = 0; n < data.length / 4; n++)
      if (data[n * 4 + 3] > 20) {
        const x = ((n % canvas.width) * 1254) / canvas.width,
          y = (Math.floor(n / canvas.width) * 1254) / canvas.height;
        lit++;
        if (
          (x > 510 && x < 620 && y > 560 && y < 700) ||
          (x > 695 && x < 800 && y > 510 && y < 650)
        )
          foliage++;
      }
    return { lit, foliage };
  });
  expect(result.lit).toBeGreaterThan(30);
  expect(result.foliage).toBe(0);
});

test("curved bezel lettering stays on the smooth band for all three frames", async ({
  page,
}) => {
  for (const material of ["aged-brass", "silver", "wood"]) {
    const c = await card(page, {
      members: [],
      artwork: "castle",
      bezel: {
        enabled: true,
        width: 64,
        material,
        items: [
          {
            id: "top",
            kind: "text",
            text: "18 °C · CLEAR SKIES",
            angle: -90,
            size: 17,
          },
          {
            id: "bottom",
            kind: "text",
            text: "EVERY ROAD LEADS HOME",
            angle: 90,
            size: 16,
          },
        ],
      },
    });
    await c.evaluate(async (c) => {
      await c._bezelArtReady;
      await document.fonts.ready;
    });
    const extents = await c.locator(".bezel-value").evaluateAll((nodes) =>
      nodes.map((n) => {
        let min = Infinity,
          max = 0;
        for (let i = 0; i < n.getNumberOfChars(); i++) {
          const b = n.getExtentOfChar(i);
          for (const x of [b.x, b.x + b.width])
            for (const y of [b.y, b.y + b.height]) {
              const r = Math.hypot(x - 300, y - 300);
              min = Math.min(min, r);
              max = Math.max(max, r);
            }
        }
        return { min, max };
      }),
    );
    for (const b of extents) {
      expect(b.min, material).toBeGreaterThan(310);
      expect(b.max, material).toBeLessThan(346);
    }
  }
});
