// A session seed keeps an encounter stable through sensor-driven rerenders,
// while each new meteor has its own quiet interval, position and trajectory.
export function createMeteorTimeline(seed) {
  let state, event;
  const random = () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
  const next = (previousEnd) => {
    const start = previousEnd + 20 + random() * 55,
      duration = 0.7 + random() * 0.65,
      rightward = random() >= 0.5,
      angle = (18 + random() * 42) * Math.PI / 180,
      distance = 48 + random() * 45;
    return {
      previousEnd,
      start,
      end: start + duration,
      duration,
      x: rightward ? 155 + random() * 65 : 380 + random() * 65,
      y: 112 + random() * 36,
      dx: Math.cos(angle) * distance * (rightward ? 1 : -1),
      dy: Math.sin(angle) * distance,
    };
  };
  const reset = () => {
    state = seed >>> 0;
    event = next(0);
  };
  reset();
  return {
    at(time) {
      if (time < event.previousEnd) reset();
      while (time > event.end) event = next(event.end);
      return event;
    },
  };
}
