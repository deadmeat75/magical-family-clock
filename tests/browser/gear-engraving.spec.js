import { test, expect } from "@playwright/test";
async function boot(page, editor = false) {
  await page.goto("/");
  await page.waitForSelector("section magical-family-clock-card");
  if (editor) await page.locator("#edit").click();
}
test("engraving bounds fit the filled hand at different widths and text orientations", async ({
  page,
}) => {
  await boot(page);
  const result = await page.evaluate(async () => {
    const { HAND_STYLES } = await import("/src/design.js");
    const card = document.querySelector("section magical-family-clock-card");
    let visible = 0,
      hidden = 0;
    const failures = [];
    for (const width of [0.5, 1, 1.8])
      for (const rotation of [0, 30, 90])
        for (const orientation of ["parallel", "perpendicular"])
          for (const position of ["stem", "tip"]) {
            const config = {
              ...card._config,
              members: HAND_STYLES.filter((s) => s !== "theme").map(
                (shape, i) => ({
                  id: "fit-" + i,
                  name: i % 2 ? "SAGE" : "ROWAN",
                  hand_design: shape,
                  width,
                  name_orientation: orientation,
                  name_position: position,
                  name_rotation: rotation,
                  show_portrait: false,
                }),
              ),
              name_size: 26,
              duration: 0,
            };
            card.setConfig(config);
            for (const hand of card._hands.values()) {
              const name = hand.name;
              if (hand.nameGroup.style.visibility !== "visible") {
                hidden++;
                continue;
              }
              visible++;
              if (hand.design === "spoon" && position === "tip") {
                // The handle must reach into even the smallest spoon bowl.
                if (
                  !hand.path.isPointInFill(new DOMPoint(300, 300 - hand.r + 10))
                )
                  failures.push("detached spoon bowl");
              }
              if (parseFloat(name.style.fontSize) > 26)
                failures.push("inflated font");
              const box = name.getBBox(),
                matrix = hand.nameGroup.transform.baseVal.consolidate().matrix;
              for (let y = 0; y <= 4; y++)
                for (let x = 0; x <= 10; x++) {
                  const point = new DOMPoint(
                    box.x + (box.width * x) / 10,
                    box.y + (box.height * y) / 4,
                  ).matrixTransform(matrix);
                  const inside = hand.bowlRadius
                    ? Math.hypot(
                        point.x - 300,
                        point.y - (300 - hand.r * hand.headFraction),
                      ) <= hand.bowlRadius
                    : hand.path.isPointInFill(
                        new DOMPoint(
                          300 + (point.x - 300) / hand.member.width,
                          point.y,
                        ),
                      );
                  if (!inside)
                    failures.push({
                      shape: hand.design,
                      width,
                      orientation,
                      rotation,
                      position,
                      font: name.style.fontSize,
                    });
                }
              if (
                !hand.g
                  .querySelector(".hand-lettering")
                  .getAttribute("clip-path")
              )
                failures.push("no clip");
            }
          }
    return { visible, hidden, failures };
  });
  expect(result.failures).toEqual([]);
  expect(result.visible).toBeGreaterThan(55);
});
test("rendered involute gears do not collide at their contacts through a tooth cycle", async ({
  page,
}) => {
  await boot(page);
  const result = await page.evaluate(async () => {
    const { gearModel, gearAngle } = await import("/src/gears.js");
    const model = gearModel();
    const card = document.querySelectorAll(
        "section magical-family-clock-card",
      )[1],
      paths = [...card.shadowRoot.querySelectorAll(".gear-profile")];
    let collisions = 0;
    const examples = [];
    for (let step = 0; step <= 20; step++)
      for (const [a, b] of model.contacts) {
        const x = model.gears[a],
          y = model.gears[b],
          normal = Math.atan2(y.y - x.y, y.x - x.x),
          cx = x.x + Math.cos(normal) * x.pitchRadius,
          cy = x.y + Math.sin(normal) * x.pitchRadius;
        const phase = (((2 * Math.PI) / model.driverTeeth) * step) / 20;
        const contains = (index, wx, wy) => {
          const gear = model.gears[index],
            rotation = -gearAngle(gear, phase),
            dx = wx - gear.x,
            dy = wy - gear.y;
          return paths[index].isPointInFill(
            new DOMPoint(
              dx * Math.cos(rotation) - dy * Math.sin(rotation),
              dx * Math.sin(rotation) + dy * Math.cos(rotation),
            ),
          );
        };
        for (let n = -5; n <= 5; n += 0.5)
          for (let tangent = -9; tangent <= 9; tangent += 0.5) {
            const wx = cx + n * Math.cos(normal) - tangent * Math.sin(normal),
              wy = cy + n * Math.sin(normal) + tangent * Math.cos(normal);
            if (contains(a, wx, wy) && contains(b, wx, wy)) {
              collisions++;
              if (examples.length < 4)
                examples.push({ step, a, b, n, tangent });
            }
          }
      }
    return { collisions, examples };
  });
  expect(result).toEqual({ collisions: 0, examples: [] });
});
test("actual animated gear phases and speeds stay synchronized on the browser timeline", async ({
  page,
}) => {
  await boot(page);
  const card = page.locator("section magical-family-clock-card").nth(1);
  const result = await card.evaluate(async (c) => {
    const gears = [...c.shadowRoot.querySelectorAll(".live-gear")];
    const animations = gears.map((g) => g.getAnimations()[0]);
    await Promise.all(animations.map((a) => a.ready));
    const { gearModel } = await import("/src/gears.js");
    const model = gearModel(),
      angles = gears.map((g, i) => {
        const m = new DOMMatrix(getComputedStyle(g).transform);
        return Math.atan2(m.b, m.a) + model.gears[i].phase;
      });
    const errors = model.contacts.map(([a, b]) => {
      const x = model.gears[a],
        y = model.gears[b],
        alpha = Math.atan2(y.y - x.y, y.x - x.x),
        raw =
          x.teeth * (alpha - angles[a]) +
          y.teeth * (alpha + Math.PI - angles[b]) -
          Math.PI;
      return Math.abs(
        ((((raw + Math.PI) % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI)) -
          Math.PI,
      );
    });
    return {
      starts: animations.map((a) => a.startTime),
      durations: animations.map((a) => a.effect.getTiming().duration),
      directions: animations.map((a) => a.effect.getTiming().direction),
      errors,
    };
  });
  expect(Math.max(...result.starts) - Math.min(...result.starts)).toBeLessThan(
    0.01,
  );
  expect(result.durations).toEqual([60000, 36000, 60000, 36000]);
  expect(result.directions).toEqual(["normal", "reverse", "normal", "reverse"]);
  expect(Math.max(...result.errors)).toBeLessThan(0.001);
});
test("GUI puts text on a spoon bowl and changes only lettering orientation and rotation", async ({
  page,
}) => {
  await boot(page, true);
  const editor = page.locator("magical-family-clock-card-editor");
  await editor.getByRole("button", { name: "People", exact: true }).click();
  await editor
    .getByLabel("Lettering position", { exact: true })
    .first()
    .selectOption("tip");
  await editor
    .getByLabel("Lettering direction", { exact: true })
    .first()
    .selectOption("perpendicular");
  const card = editor.locator("magical-family-clock-card");
  await expect(card.locator(".hand-lettering").first()).toHaveAttribute(
    "data-name-position",
    "tip",
  );
  await expect(card.locator(".hand-lettering").first()).toHaveAttribute(
    "data-name-orientation",
    "perpendicular",
  );
  let details = await card.evaluate((c) => {
    const h = [...c._hands.values()][0];
    return {
      y: h.engraving.y,
      expected: h.head.transform.baseVal.getItem(0).matrix.f,
      transform: h.nameGroup.getAttribute("transform"),
      portrait: h.member.portrait_rotation,
    };
  });
  expect(details.y).toBeCloseTo(details.expected, 3);
  expect(details.transform).toMatch(/rotate\((0|180)\)/);
  await editor
    .getByText("Customize hand and portrait", { exact: true })
    .first()
    .click();
  await editor
    .getByLabel("Lettering rotation (degrees)", { exact: true })
    .first()
    .fill("30");
  await expect
    .poll(() =>
      card.evaluate((c) => [...c._hands.values()][0].member.name_rotation),
    )
    .toBe(30);
  details = await card.evaluate((c) => {
    const h = [...c._hands.values()][0];
    return {
      rotation: h.nameGroup.getAttribute("transform"),
      portrait: h.member.portrait_rotation,
    };
  });
  expect(details.rotation).toMatch(/rotate\((30|210)\)/);
  expect(details.portrait).toBe(0);
});
