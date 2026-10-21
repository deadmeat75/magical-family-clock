import test from "node:test";
import assert from "node:assert/strict";
import { flightFrames, skyPath } from "../src/world-paths.js";
import { worldObject } from "../src/world-config.js";
test("flight routes enter and reset beyond the opening for either facing, short spans and large figures", () => {
  for (const facing of ["left", "right"])
    for (const x of [0, 50, 100])
      for (const scale of [0.25, 1, 3])
        for (const span of [0, 80, 180]) {
          const o = { ...worldObject("dragon"), x, scale, span, facing },
            frames = flightFrames(o, 205),
            k = scale * 0.36;
          const world = (f) => ({
            x: 108 + x * 3.84 + f.x * k,
            y: 90 + o.y * 3.84 + f.y * k,
          });
          const first = world(frames[0]),
            last = world(frames.at(-1));
          assert.ok(Math.abs(first.x - 300) > 205 + 60 * k);
          assert.ok(Math.abs(last.x - 300) > 205 + 60 * k);
          for (let i = 1; i < frames.length - 1; i++)
            assert.ok(
              (frames[i].x - frames[i - 1].x) * (facing === "left" ? -1 : 1) >
                0,
            );
          assert.equal(frames.at(-1).x, frames.at(-2).x);
        }
});
test("sky silhouette preserves tower occlusion and is a finite path in scene coordinates", () => {
  const path = skyPath();
  assert.ok(path.startsWith("M108 90H492"));
  assert.ok(!/NaN|Infinity/.test(path));
  assert.ok(path.split("L").length > 70);
});
