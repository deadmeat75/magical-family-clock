import test from "node:test";
import assert from "node:assert/strict";
import { createMeteorTimeline } from "../src/meteors.js";

test("meteors vary their quiet intervals, sky origins and directions without changing an encounter on refresh", () => {
  const timeline = createMeteorTimeline(137), samples = [];
  let time = 0;
  for (let i = 0; i < 20; i++) {
    const e = { ...timeline.at(time) };
    assert.ok(e.start - e.previousEnd >= 20 && e.start - e.previousEnd <= 75);
    assert.ok(e.duration >= 0.7 && e.duration <= 1.35);
    assert.ok(e.y >= 112 && e.y <= 148);
    assert.ok(e.dy > 0);
    const refreshed = createMeteorTimeline(137).at(e.start + e.duration / 2);
    assert.deepEqual(refreshed, e);
    samples.push(e); time = e.end + 0.001;
  }
  assert.ok(samples.some(e => e.dx < 0) && samples.some(e => e.dx > 0));
  assert.equal(new Set(samples.map(e => e.x)).size, samples.length);
  assert.equal(new Set(samples.map(e => e.start - e.previousEnd)).size, samples.length);
  assert.deepEqual(timeline.at(0), samples[0]);
});
