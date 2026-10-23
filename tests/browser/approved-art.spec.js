import { test, expect } from "@playwright/test";
async function boot(page, extra = {}) {
  await page.goto("/");
  const card = page.locator("section magical-family-clock-card").first();
  await card.evaluate(
    (c, extra) =>
      c.setConfig({
        ...c._config,
        demo: false,
        show_branding: false,
        ...extra,
      }),
    extra,
  );
  return card;
}
test("every approved hand silhouette uses its own textured artwork and real pivot", async ({
  page,
}) => {
  const styles = [
    "spoon",
    "classic",
    "legacy-curved",
    "standalone-pointed",
    "arrow",
    "leaf",
    "sword",
    "cathedral",
    "filigree",
    "skeleton",
    "quill",
    "compass",
  ];
  const card = await boot(page, {
    members: styles.map((hand_design, i) => ({
      id: "hand-" + i,
      entity: "person.a",
      name: "A",
      hand_design,
      material: "silver",
      show_portrait: false,
      name_attachment: "parchment",
    })),
  });
  await expect(card.locator(".hand")).toHaveCount(12);
  for (const style of styles) {
    const pattern = card.locator(`pattern[data-hand-style="${style}"]`);
    await expect(pattern).toHaveCount(1);
    await expect(pattern.locator("image").first()).toHaveAttribute(
      "href",
      /\.webp/,
    );
  }
  await expect(card.locator(".name-attachment")).toHaveCount(12);
});
test("all twelve approved inhabitants render painted articulated parts and removed props stay absent", async ({
  page,
}) => {
  const kinds = [
    "bird",
    "owl",
    "witch",
    "wizard",
    "dragon",
    "phoenix",
    "fairy",
    "sea-monster",
    "mermaid",
    "merman",
    "unicorn",
    "sailboat",
  ];
  const card = await boot(page, {
    artwork: "castle",
    period_override: "day",
    background_transition: 0,
    world: {
      objects: kinds.map((kind, i) => ({
        id: "inhabitant-" + i,
        kind,
        period: "any",
        x: 50,
        y: 30,
      })),
      moon: { enabled: false },
    },
  });
  await expect(card.locator(".approved-inhabitant")).toHaveCount(12);
  await expect(card.locator(".painted-wing").first()).toHaveCSS(
    "animation-play-state",
    "running",
  );
  await expect(
    card.locator('[data-kind="unicorn"] .world-encounter'),
  ).toHaveClass(/idle/);
  await expect(
    card.locator('[data-kind="sailboat"] .world-encounter'),
  ).toHaveCSS("opacity", "1");
  await expect(card.locator('[data-kind="fairy"]')).toHaveAttribute(
    "transform",
    /scale/,
  );
  const result = await card.locator(".world-depth").evaluateAll((groups) =>
    groups.map((g) => ({
      kind: g.querySelector(".world-object").dataset.kind,
      mask: g.getAttribute("mask"),
    })),
  );
  expect(result.find((g) => g.kind === "fairy").mask).toBeNull();
  expect(result.find((g) => g.kind === "unicorn").mask).toBeNull();
});
test("brass age changes finish while preserving connected gear count and motion", async ({
  page,
}) => {
  const card = await boot(page, {
    artwork: "vector",
    theme: "brass-clockwork",
    brass_age: 0,
  });
  const before = await card
    .locator("#clockwork-age feFuncR")
    .getAttribute("slope");
  await card.evaluate((c) => c.setConfig({ ...c._config, brass_age: 1 }));
  await expect(card.locator(".live-gear")).toHaveCount(4);
  expect(
    await card.locator("#clockwork-age feFuncR").getAttribute("slope"),
  ).not.toBe(before);
});

test("early sensor refresh cannot leave moving scenery on an older lighting source", async ({
  page,
}) => {
  await page.route("**/S06.webp", async (route) => {
    await new Promise((r) => setTimeout(r, 350));
    await route.continue();
  });
  const card = await boot(page, {
    artwork: "castle",
    season_override: "summer",
    period_override: "day",
    weather_effect: "clouds",
    background_transition: 0,
    world: {
      objects: [],
      clouds: true,
      water: true,
      trees: true,
      moon: { enabled: false },
    },
  });
  await card.evaluate(
    (c) =>
      (c.hass = {
        states: { "sensor.early": { state: "on", attributes: {} } },
      }),
  );
  await expect
    .poll(() =>
      card.evaluate((c) => {
        const photo = c.shadowRoot
            .querySelector(".hd-scene image")
            ?.getAttribute("href"),
          motion = c.shadowRoot
            .querySelector("#world-photo-source")
            ?.getAttribute("href");
        return Boolean(
          photo?.startsWith("data:image/webp") && photo === motion,
        );
      }),
    )
    .toBe(true);
});

test("spoon-tip name plate sits inside the physical bowl rather than above its tip", async ({
  page,
}) => {
  const card = await boot(page, {
    members: [
      {
        id: "bowl",
        name: "ROWAN",
        entity: "person.bowl",
        hand_design: "spoon",
        name_position: "tip",
        show_portrait: false,
      },
    ],
    name_size: 26,
  });
  const result = await card.evaluate((c) => {
    const h = c._hands.get("bowl"),
      y = 300 - h.r * h.headFraction;
    return {
      inside: h.path.isPointInFill(new DOMPoint(300, y)),
      center: h.head.transform.baseVal.getItem(0).matrix.f,
      expected: y,
    };
  });
  expect(result.inside).toBe(true);
  expect(result.center).toBeCloseTo(result.expected, 3);
  await expect(card.locator(".hand-head")).toBeVisible();
});
