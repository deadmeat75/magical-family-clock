// Keep the sampling grid stable across 60/120 Hz displays. Resetting a deadline
// to each RAF timestamp loses fractional frames and produces uneven cadence.
export function nextPaintDeadline(now, due, fps) {
  const interval = 1000 / fps;
  if (now + 0.1 < due) return null;
  return due + (Math.floor((now + 0.1 - due) / interval) + 1) * interval;
}
export function sceneryFPS(quality, webkit) {
  return webkit
    ? quality === "light"
      ? 20
      : 30
    : quality === "light"
      ? 12
      : quality === "balanced"
        ? 18
        : 24;
}
