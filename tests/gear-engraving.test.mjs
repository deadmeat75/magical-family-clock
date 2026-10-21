import test from "node:test";
import assert from "node:assert/strict";
import {
  gearModel,
  gearAngle,
  meshError,
  gearOutline,
  toothHalfAngle,
} from "../src/gears.js";
import { fitEngraving, letteringRotation } from "../src/engraving.js";
import { legacyTextRotation } from "../src/hands.js";
import { normalize } from "../src/engine.js";
test("meshing gear centers, tooth pitch and velocities describe one connected drive", () => {
  const model = gearModel();
  assert.equal(model.contacts.length, 4);
  const pitch = model.module * Math.PI;
  for (const g of model.gears) {
    assert.ok(
      Math.abs((2 * Math.PI * g.pitchRadius) / g.teeth - pitch) < 1e-10,
    );
    assert.ok(Math.hypot(g.x - 300, g.y - 300) + g.outerRadius < 190);
    assert.ok(!/NaN|Infinity/.test(gearOutline(g)));
  }
  for (const [a, b] of model.contacts) {
    const x = model.gears[a],
      y = model.gears[b];
    assert.ok(
      Math.abs(
        Math.hypot(x.x - y.x, x.y - y.y) - x.pitchRadius - y.pitchRadius,
      ) < 1e-10,
    );
    assert.equal(x.direction, -y.direction);
    assert.ok(
      Math.abs(
        (x.direction * x.pitchRadius) / x.periodRatio +
          (y.direction * y.pitchRadius) / y.periodRatio,
      ) < 1e-10,
    );
  }
  for (let a = 0; a < model.gears.length; a++)
    for (let b = a + 1; b < model.gears.length; b++)
      if (!model.contacts.some((e) => e[0] === a && e[1] === b))
        assert.ok(
          Math.hypot(
            model.gears[a].x - model.gears[b].x,
            model.gears[a].y - model.gears[b].y,
          ) >
            model.gears[a].outerRadius + model.gears[b].outerRadius,
        );
});
test("every contact preserves tooth-to-gap phase over many drive turns", () => {
  const { gears, contacts } = gearModel();
  for (const phase of [0, 0.01, 0.16, 0.7, Math.PI, 37.9, 234.56])
    for (const [a, b] of contacts)
      assert.ok(
        Math.abs(meshError(gears[a], gears[b], phase)) < 1e-8,
        `${a}/${b} at ${phase}`,
      );
  assert.ok(
    Math.abs(gearAngle(gears[1], 1) - gears[1].phase) >
      Math.abs(gearAngle(gears[0], 1) - gears[0].phase),
  );
});
test("involute teeth get thinner toward the tip with intentional backlash", () => {
  for (const g of gearModel().gears) {
    assert.ok(toothHalfAngle(g, g.outerRadius) > 0);
    assert.ok(
      toothHalfAngle(g, g.outerRadius) < toothHalfAngle(g, g.pitchRadius),
    );
    assert.ok(toothHalfAngle(g, g.pitchRadius) < Math.PI / (2 * g.teeth));
  }
});
test("lettering fits narrow filled material instead of inflating short names", () => {
  const fit = fitEngraving({
    length: 180,
    width: 1,
    box: { width: 45, height: 10 },
    size: 13,
    contains: (x, y) => Math.abs(x - 300) <= 4 && y >= 150 && y <= 275,
  });
  assert.ok(fit);
  assert.ok(fit.fontSize < 13);
  assert.ok(fit.textHeight + 2 * fit.margin <= 8);
  const hole = fitEngraving({
    length: 180,
    width: 1,
    box: { width: 200, height: 30 },
    size: 26,
    contains: (x, y) =>
      Math.abs(x - 300) >= 2 && Math.abs(x - 300) <= 3 && y >= 150 && y <= 275,
  });
  assert.equal(hole, null);
});
test("parallel, perpendicular, fixed rotation and bowl placement keep their selected orientation", () => {
  for (let angle = -720; angle < 720; angle += 0.5)
    assert.equal(
      letteringRotation(
        { name_orientation: "parallel", name_upright: true },
        angle,
      ),
      legacyTextRotation(angle),
    );
  assert.equal(
    letteringRotation(
      {
        name_orientation: "perpendicular",
        name_upright: false,
        name_rotation: 30,
      },
      0,
    ),
    30,
  );
  const bowlRadius = 21,
    cy = 120;
  const fit = fitEngraving({
    length: 180,
    width: 1,
    box: { width: 30, height: 10 },
    size: 13,
    position: "tip",
    bowlRadius,
    rotation: 0,
    contains: (x, y) => Math.hypot(x - 300, y - cy) <= bowlRadius,
  });
  assert.ok(fit);
  assert.equal(fit.y, cy);
  assert.equal(fit.fontSize, 13);
  const m = normalize({
    members: [
      {
        name_position: "tip",
        name_orientation: "perpendicular",
        name_rotation: 999,
      },
    ],
  }).members[0];
  assert.equal(m.name_position, "tip");
  assert.equal(m.name_rotation, 180);
});
