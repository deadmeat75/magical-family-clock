import test from "node:test";
import assert from "node:assert/strict";
import { nextPaintDeadline, sceneryFPS } from "../src/frame-pacing.js";
import { svgSurface } from "../src/canvas-surface.js";
test("scenery pacing holds its frame grid on 60 and 120 Hz displays without catch-up bursts", () => {
  for (const refresh of [60, 120]) {
    let due = 0,
      frames = [];
    for (let i = 0; i < refresh * 4; i++) {
      const now = (i * 1000) / refresh,
        next = nextPaintDeadline(now, due, 30);
      if (next !== null) {
        frames.push(now);
        due = next;
      }
    }
    assert.equal(frames.length, 120);
    for (let i = 1; i < frames.length; i++)
      assert.ok(Math.abs(frames[i] - frames[i - 1] - 1000 / 30) < 0.01);
  }
  assert.equal(nextPaintDeadline(500, 0, 30), 500 + 1000 / 30);
  assert.equal(nextPaintDeadline(505, 500 + 1000 / 30, 30), null);
  assert.equal(sceneryFPS("rich", true), 30);
  assert.equal(sceneryFPS("light", true), 20);
});
function fixture() {
  const node = new EventTarget();
  node.dataset = {};
  const attributes = new Map();
  node.setAttribute = (key, value) => attributes.set(key, value);
  node.removeAttribute = (key) => attributes.delete(key);
  const callbacks = [],
    canvas = { width: 384, height: 384, toBlob: (fn) => callbacks.push(fn) };
  return { node, canvas, callbacks, attributes };
}
test("SVG frames are decoded by their displayed image, retain one pending frame and release URLs", async () => {
  const { node, canvas, callbacks, attributes } = fixture(),
    surface = svgSurface(node, canvas);
  surface.publish();
  surface.publish();
  surface.publish();
  assert.equal(callbacks.length, 1);
  assert.equal(surface.busy, true);
  callbacks.shift()(new Blob(["first"]));
  const first = attributes.get("href");
  assert.ok(first.startsWith("blob:"));
  assert.equal(node.dataset.displayTick, undefined);
  node.dispatchEvent(new Event("load"));
  await surface.ready;
  assert.equal(node.dataset.displayTick, "1");
  assert.equal(callbacks.length, 1);
  callbacks.shift()(new Blob(["second"]));
  node.dispatchEvent(new Event("load"));
  assert.equal(surface.busy, false);
  assert.equal(node.dataset.displayTick, "2");
  await assert.rejects(fetch(first));
  const second = attributes.get("href");
  surface.stop();
  await assert.rejects(fetch(second));
  assert.equal(canvas.width, 0);
});
test("stopping an in-flight frame releases its canvas when encoding completes", async () => {
  const { node, canvas, callbacks, attributes } = fixture(),
    surface = svgSurface(node, canvas);
  surface.publish();
  surface.stop();
  assert.equal(canvas.width, 384);
  callbacks.shift()(new Blob(["aborted"]));
  await surface.ready;
  assert.equal(canvas.width, 0);
  assert.equal(attributes.size, 0);
});
test("a failed SVG frame preserves the last displayed image and can be retried", async () => {
  const { node, canvas, callbacks, attributes } = fixture(),
    surface = svgSurface(node, canvas);
  surface.publish();
  callbacks.shift()(new Blob(["first"]));
  node.dispatchEvent(new Event("load"));
  const first = attributes.get("href");
  surface.publish();
  callbacks.shift()(new Blob(["bad"]));
  const failed = attributes.get("href");
  node.dispatchEvent(new Event("error"));
  assert.equal(attributes.get("href"), first);
  await assert.rejects(fetch(failed));
  assert.equal(surface.busy, false);
  surface.stop();
});
