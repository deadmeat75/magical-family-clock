// The skyline is traced in source-image coordinates. All sky layers share it,
// so clouds, moon, stars and visitors pass behind the same tower edges.
const skyline = [
  [0, 470],
  [24, 476],
  [61, 450],
  [91, 474],
  [129, 480],
  [156, 492],
  [187, 470],
  [221, 490],
  [258, 494],
  [290, 512],
  [325, 501],
  [350, 512],
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
  [836, 491],
  [848, 469],
  [860, 487],
  [884, 475],
  [910, 483],
  [935, 468],
  [959, 479],
  [982, 452],
  [1002, 446],
  [1022, 459],
  [1048, 438],
  [1068, 457],
  [1091, 468],
  [1114, 456],
  [1140, 470],
  [1170, 454],
  [1195, 469],
  [1220, 460],
  [1254, 468],
];
export function skyPath() {
  const p = ([x, y]) =>
    `${(108 + (x * 384) / 1254).toFixed(3)} ${(90 + (y * 384) / 1254).toFixed(3)}`;
  return (
    "M108 90H492V" +
    (90 + (468 * 384) / 1254).toFixed(3) +
    "L" +
    [...skyline].reverse().map(p).join("L") +
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
  const bend = object.kind === "bird" ? 9 : object.kind === "fairy" ? 12 : 5;
  const frames = [];
  for (let i = 0; i <= 20; i++) {
    const u = i / 20,
      px = start + (end - start) * u;
    const py =
      y -
      bend * Math.sin(Math.PI * u) +
      Math.sin(u * Math.PI * 2) * bend * 0.22;
    const slope =
      (-bend * Math.PI * Math.cos(Math.PI * u) +
        bend * 0.44 * Math.PI * Math.cos(u * Math.PI * 2)) /
      (end - start);
    const bank = ((Math.atan(slope) * 180) / Math.PI) * 0.55;
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
