import { approvedAssets } from "./approved-art.js";
export const creatureIds = {
  bird: "C01",
  owl: "C02",
  witch: "C03",
  wizard: "C04",
  dragon: "C05",
  phoenix: "C06",
  fairy: "C07",
  "sea-monster": "C08",
  mermaid: "C09",
  merman: "C10",
  unicorn: "C11",
  sailboat: "C12",
};
// Rig coordinates refer to the tight, approved source silhouettes (0–100).
// Parts share their original joint positions, rather than sliding whole pictures.
const rigs = {
  bird: [
    ["wing", "27,0 68,31 73,56 58,63 36,57 22,44", 58, 61],
    ["wing", "42,62 61,63 100,100 68,98 49,82", 52, 65],
  ],
  owl: [
    ["wing", "0,0 38,9 56,45 62,72 48,77 23,64 9,43", 56, 71],
    ["wing", "58,63 88,33 100,34 100,61 74,76", 63, 69],
  ],
  dragon: [
    ["wing", "17,0 51,4 83,35 77,61 59,76 44,65 20,67 30,45 12,35", 63, 73],
  ],
  phoenix: [
    ["wing", "0,0 65,2 76,45 69,65 51,70 16,45", 64, 64],
    ["tail", "0,68 46,62 66,76 53,100 0,100", 52, 68],
  ],
  fairy: [["wing", "0,0 40,3 57,38 58,49 43,55 0,47", 55, 49]],
  witch: [["cloth", "0,19 49,14 64,29 49,46 39,66 12,85 0,73", 57, 33]],
  wizard: [["cloth", "0,25 48,18 62,29 47,45 41,65 13,83 0,70", 56, 33]],
  "sea-monster": [["neck", "45,0 100,0 100,74 62,73 48,46", 65, 70]],
  mermaid: [["tail", "0,61 53,55 78,66 100,100 0,100", 49, 60]],
  merman: [["tail", "0,60 55,55 78,66 100,100 0,100", 50, 60]],
  unicorn: [
    ["cloth", "0,35 20,31 28,49 21,94 0,100", 26, 46],
    ["cloth", "45,15 80,6 85,28 73,60 50,57", 74, 30],
  ],
  sailboat: [["cloth", "0,0 82,0 94,45 78,64 15,64", 48, 20]],
};
const proportions = {
  bird: 543 / 603,
  owl: 481 / 518,
  witch: 515 / 623,
  wizard: 534 / 587,
  dragon: 495 / 686,
  phoenix: 541 / 576,
  fairy: 967 / 1134,
  "sea-monster": 1014 / 1127,
  mermaid: 954 / 1205,
  merman: 898 / 1237,
  unicorn: 1056 / 1244,
  sailboat: 603 / 596,
};
export function paintedCreature(kind, tint = "") {
  const url = approvedAssets[creatureIds[kind]];
  if (!url) return "";
  const width = kind === "fairy" ? 45 : kind === "dragon" ? 135 : 110,
    height = width * proportions[kind],
    anchor = ["mermaid", "merman"].includes(kind)
      ? 0.56
      : kind === "sea-monster"
        ? 0.7
        : kind === "sailboat"
          ? 0.96
          : kind === "unicorn"
            ? 1
            : 0.6;
  const image = `<image class="painted-creature" href="${url}" width="100" height="100" preserveAspectRatio="none"/>`,
    parts = rigs[kind] || [],
    id = "painted-" + kind;
  const tintFilter = tint
    ? `<filter id="${id}-tint" color-interpolation-filters="sRGB"><feComponentTransfer>${[1, 3, 5].map((n, i) => `<feFunc${"RGB"[i]} type="linear" slope="${0.5 + (0.7 * parseInt(tint.slice(n, n + 2), 16)) / 255}"/>`).join("")}</feComponentTransfer></filter>`
    : "";
  const masks = parts
    .map(
      ([type, points, x, y], i) =>
        `<clipPath id="${id}-${i}"><polygon points="${points}"/></clipPath>`,
    )
    .join("");
  const cutouts = parts
    .map(([, points]) => `<polygon points="${points}" fill="black"/>`)
    .join("");
  const layers = parts
    .map(
      ([type, , x, y], i) =>
        `<g class="painted-${type}" style="transform-origin:${x}px ${y}px"><g clip-path="url(#${id}-${i})">${image}</g></g>`,
    )
    .join("");
  return `<g class="approved-inhabitant" data-artwork="${creatureIds[kind]}" ${tint ? `filter="url(#${id}-tint)"` : ""} transform="translate(${-width / 2} ${-height * anchor}) scale(${width / 100} ${height / 100})"><defs>${tintFilter}${masks}<mask id="${id}-body" maskUnits="userSpaceOnUse"><rect width="100" height="100" fill="white"/>${cutouts}</mask></defs><g mask="url(#${id}-body)">${image}</g>${layers}</g>`;
}
export const paintedCSS = `
.painted-wing{animation:painted-wing-motion 5.8s linear infinite;transform-box:view-box}.world-object[data-kind="dragon"] .painted-wing{animation-duration:8.7s}.world-object[data-kind="owl"] .painted-wing{animation-duration:6.5s}.world-object[data-kind="fairy"] .painted-wing{animation-duration:.24s}.painted-tail{animation:painted-tail-motion 4.7s ease-in-out infinite alternate;transform-box:view-box}.painted-cloth{animation:painted-cloth-motion 6.3s ease-in-out infinite alternate;transform-box:view-box}.painted-neck{animation:painted-neck-motion 7.7s ease-in-out infinite alternate;transform-box:view-box}
@keyframes painted-wing-motion{0%,18%,40%,72%,100%{transform:rotate(0deg) scaleY(1)}8%,29%{transform:rotate(-8deg) scaleY(.63)}12%,34%{transform:rotate(2deg) scaleY(1)}48%,64%{transform:rotate(-1deg) scaleY(.93)}}@keyframes painted-tail-motion{from{transform:skewX(-2deg)}to{transform:skewX(2deg)}}@keyframes painted-cloth-motion{from{transform:skewY(-.7deg)}to{transform:skewY(1.2deg)}}@keyframes painted-neck-motion{from{transform:rotate(-1deg)}to{transform:rotate(1deg)}}
`;
