// The skyline is traced in source-image coordinates. All sky layers share it,
// so clouds, moon, stars and visitors pass behind the same tower edges.
export const skyline = [
  [0, 477],
  [4, 473],
  [17, 479],
  [39, 463],
  [46, 466],
  [66, 453],
  [72, 461],
  [94, 477],
  [107, 489],
  [127, 479],
  [136, 492],
  [156, 502],
  [183, 484],
  [190, 488],
  [227, 466],
  [241, 477],
  [248, 478],
  [260, 479],
  [284, 493],
  [302, 487],
  [324, 501],
  [341, 498],
  [355, 506],
  [366, 496],
  [382, 456],
  [387, 428],
  [392, 457],
  [408, 495],
  [425, 492],
  [430, 431],
  [447, 361],
  [455, 315],
  [461, 357],
  [474, 428],
  [484, 424],
  [486, 445],
  [496, 434],
  [496, 412],
  [517, 412],
  [526, 346],
  [547, 247],
  [550, 207],
  [554, 249],
  [568, 321],
  [577, 316],
  [582, 332],
  [587, 280],
  [587, 251],
  [590, 279],
  [593, 308],
  [604, 295],
  [620, 243],
  [628, 214],
  [631, 158],
  [635, 217],
  [646, 257],
  [655, 319],
  [663, 318],
  [660, 214],
  [670, 161],
  [681, 77],
  [684, 27],
  [688, 77],
  [702, 168],
  [713, 210],
  [714, 254],
  [721, 276],
  [726, 247],
  [735, 208],
  [738, 182],
  [742, 216],
  [752, 310],
  [760, 324],
  [765, 384],
  [779, 347],
  [781, 315],
  [784, 356],
  [801, 420],
  [805, 488],
  [820, 473],
  [824, 446],
  [828, 479],
  [836, 484],
  [842, 481],
  [862, 500],
  [875, 499],
  [882, 503],
  [923, 486],
  [934, 496],
  [970, 505],
  [985, 501],
  [995, 505],
  [1013, 500],
  [1027, 484],
  [1047, 464],
  [1051, 467],
  [1091, 437],
  [1118, 454],
  [1126, 453],
  [1144, 471],
  [1160, 472],
  [1188, 462],
  [1204, 478],
  [1232, 475],
  [1254, 485],
];
export function skyPath(points = skyline) {
  const p = ([x, y]) =>
    `${(108 + (x * 384) / 1254).toFixed(3)} ${(90 + (y * 384) / 1254).toFixed(3)}`;
  return (
    "M108 90H492V" +
    (90 + (468 * 384) / 1254).toFixed(3) +
    "L" +
    [...points].reverse().map(p).join("L") +
    "Z"
  );
}
export const lakePath =
  "M115 355Q270 350 479 358V404L453 450 420 474H271L224 426 177 411 145 391Z";

export function flightFrames(object, opening = 180) {
  const x = 108 + object.x * 3.84,
    y = 90 + object.y * 3.84,
    scale = object.scale * 0.36;
  // Even a short requested route enters/exits outside the whole dial. No opacity
  // transition can expose a figure appearing or resetting in the open sky.
  const margin = 70 * scale + 12,
    half = Math.max(opening + margin, object.span * 1.92);
  const left = Math.min(300 - half, x - half),
    right = Math.max(300 + half, x + half);
  const start = object.facing === "left" ? right : left,
    end = object.facing === "left" ? left : right;
  // Distinct, smoothly curved routes: broad glides for larger creatures and
  // shorter rising/falling arcs for small birds and pixies. The saved identity
  // supplies variation without changing a route on a sensor refresh.
  let seed = 0;
  for (const char of String(object.id || object.kind))
    seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0;
  const phase = ((seed % 997) / 997) * Math.PI * 2,
    bend =
      ({ bird: 26, fairy: 30, phoenix: 26, owl: 23, dragon: 25 }[object.kind] ||
        23) *
      (0.85 + (seed % 101) / 335),
    height = (u) =>
      y +
      bend *
        (-0.6 * Math.sin(Math.PI * u) +
          0.7 * Math.sin(2 * Math.PI * u + phase) * Math.sin(Math.PI * u) +
          0.23 * Math.sin(4 * Math.PI * u + phase) * Math.sin(Math.PI * u));
  const frames = [];
  for (let i = 0; i <= 48; i++) {
    const u = i / 48,
      travel = u + 0.045 * Math.sin(2 * Math.PI * u),
      px = start + (end - start) * travel,
      py = height(u),
      slope =
        (height(u + 0.0001) - height(u - 0.0001)) /
        (0.0002 *
          (end - start) *
          (1 + 0.09 * Math.PI * Math.cos(2 * Math.PI * u))),
      bank = ((Math.atan(slope) * 180) / Math.PI) * 0.8;
    frames.push({
      offset: u * 0.72,
      x: (px - x) / scale,
      y: (py - y) / scale,
      bank,
    });
  }
  frames.push({ ...frames[frames.length - 1], offset: 1 });
  return frames;
}
export function flightKeyframes(object, index, opening) {
  return (
    `@keyframes world-flight-${index}{` +
    flightFrames(object, opening)
      .map(
        (f) =>
          `${(f.offset * 100).toFixed(2)}%{transform:translate(${f.x.toFixed(3)}px,${f.y.toFixed(3)}px) rotate(${f.bank.toFixed(3)}deg)}`,
      )
      .join("") +
    "}"
  );
}
