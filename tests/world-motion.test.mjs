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
test("flight paths have visible rises and dips, smooth banking and individual variation", () => {
  for (const kind of [
    "bird",
    "owl",
    "witch",
    "wizard",
    "dragon",
    "phoenix",
    "fairy",
  ]) {
    const object = worldObject(kind, "route-one"),
      frames = flightFrames(object),
      ys = frames.slice(0, -1).map((f) => f.y * object.scale * 0.36);
    assert.ok(
      Math.max(...ys) - Math.min(...ys) > 16,
      kind + " must visibly change altitude",
    );
    const changes = ys.slice(1).map((y, i) => y - ys[i]);
    assert.ok(
      changes.some((d) => d > 0.1) && changes.some((d) => d < -0.1),
      kind + " must rise and descend",
    );
    assert.ok(
      frames.some((f) => Math.abs(f.bank) > 3),
      kind + " banks into its path",
    );
    for (let i = 1; i < frames.length; i++)
      assert.ok(
        Math.abs(frames[i].bank - frames[i - 1].bank) < 10,
        "no abrupt banking",
      );
    assert.deepEqual(
      frames,
      flightFrames(object),
      "sensor refresh preserves the route",
    );
    assert.notDeepEqual(frames, flightFrames({ ...object, id: "route-two" }));
  }
});
