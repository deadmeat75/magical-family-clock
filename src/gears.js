// All wheels use the same module and 20° pressure angle. Pitch circles determine
// axle positions; a tooth-count-derived ratio and phase determine every rotor.
export const GEAR_MODULE = 4;
export const PRESSURE_ANGLE = (20 * Math.PI) / 180;
const TAU = Math.PI * 2;
const wrap = (n, period = TAU) => ((n % period) + period) % period;
export function gearModel() {
  const driverTeeth = 40,
    followerTeeth = 24;
  const distance = (GEAR_MODULE * (driverTeeth + followerTeeth)) / 2;
  const offset = distance / 2;
  const gears = [
    { id: "drive", x: 300 + offset, y: 300 - offset, teeth: driverTeeth },
    {
      id: "upper-idler",
      x: 300 - offset,
      y: 300 - offset,
      teeth: followerTeeth,
    },
    { id: "lower-wheel", x: 300 - offset, y: 300 + offset, teeth: driverTeeth },
    {
      id: "lower-idler",
      x: 300 + offset,
      y: 300 + offset,
      teeth: followerTeeth,
    },
  ].map((g) => ({
    ...g,
    pitchRadius: (g.teeth * GEAR_MODULE) / 2,
    outerRadius: (g.teeth / 2 + 1) * GEAR_MODULE,
    rootRadius: (g.teeth / 2 - 1.25) * GEAR_MODULE,
  }));
  const contacts = [];
  for (let a = 0; a < gears.length; a++)
    for (let b = a + 1; b < gears.length; b++) {
      const separation = Math.hypot(
        gears[a].x - gears[b].x,
        gears[a].y - gears[b].y,
      );
      if (
        Math.abs(separation - gears[a].pitchRadius - gears[b].pitchRadius) <
        1e-8
      )
        contacts.push([a, b]);
    }
  gears[0].direction = 1;
  gears[0].phase = 0;
  const queue = [0];
  while (queue.length) {
    const index = queue.shift(),
      a = gears[index];
    for (const edge of contacts) {
      if (!edge.includes(index)) continue;
      const next = edge[0] === index ? edge[1] : edge[0],
        b = gears[next];
      if (b.direction !== undefined) continue;
      const angle = Math.atan2(b.y - a.y, b.x - a.x);
      b.direction = -a.direction;
      // At contact, the tooth center of one wheel faces a tooth gap of the other.
      b.phase = wrap(
        angle + Math.PI + (a.teeth * (angle - a.phase) - Math.PI) / b.teeth,
        TAU / b.teeth,
      );
      queue.push(next);
    }
  }
  gears.forEach((g) => (g.periodRatio = g.teeth / driverTeeth));
  return {
    module: GEAR_MODULE,
    pressureAngle: PRESSURE_ANGLE,
    driverTeeth,
    gears,
    contacts,
  };
}
export function gearAngle(gear, driverAngle) {
  return gear.phase + (gear.direction * driverAngle) / gear.periodRatio;
}
export function meshError(a, b, driverAngle = 0) {
  const angle = Math.atan2(b.y - a.y, b.x - a.x);
  return (
    wrap(
      a.teeth * (angle - gearAngle(a, driverAngle)) +
        b.teeth * (angle + Math.PI - gearAngle(b, driverAngle)) -
        Math.PI +
        Math.PI,
    ) - Math.PI
  );
}
const involute = (angle) => Math.tan(angle) - angle;
export function toothHalfAngle(gear, radius) {
  const base = gear.pitchRadius * Math.cos(PRESSURE_ANGLE);
  const halfThickness =
    Math.PI / (2 * gear.teeth) - 0.12 / (2 * gear.pitchRadius);
  return (
    halfThickness +
    involute(PRESSURE_ANGLE) -
    involute(Math.acos(Math.min(1, base / radius)))
  );
}
export function gearOutline(gear) {
  const base = gear.pitchRadius * Math.cos(PRESSURE_ANGLE),
    start = Math.max(base, gear.rootRadius);
  const point = (radius, angle) =>
    `${(radius * Math.cos(angle)).toFixed(5)} ${(radius * Math.sin(angle)).toFixed(5)}`;
  let path = `M${point(gear.rootRadius, -Math.PI / gear.teeth)}`;
  for (let tooth = 0; tooth < gear.teeth; tooth++) {
    const center = (tooth * TAU) / gear.teeth;
    const rootHalf = toothHalfAngle(gear, start),
      tipHalf = toothHalfAngle(gear, gear.outerRadius);
    path += `A${gear.rootRadius} ${gear.rootRadius} 0 0 1 ${point(gear.rootRadius, center - rootHalf)}L${point(start, center - rootHalf)}`;
    for (let step = 1; step <= 6; step++) {
      const radius = start + ((gear.outerRadius - start) * step) / 6;
      path += `L${point(radius, center - toothHalfAngle(gear, radius))}`;
    }
    path += `A${gear.outerRadius} ${gear.outerRadius} 0 0 1 ${point(gear.outerRadius, center + tipHalf)}`;
    for (let step = 5; step >= 0; step--) {
      const radius = start + ((gear.outerRadius - start) * step) / 6;
      path += `L${point(radius, center + toothHalfAngle(gear, radius))}`;
    }
    path += `L${point(gear.rootRadius, center + rootHalf)}A${gear.rootRadius} ${gear.rootRadius} 0 0 1 ${point(gear.rootRadius, center + Math.PI / gear.teeth)}`;
  }
  return path + "Z";
}
