import { sharedImageURL } from "./image-url.js";
// Asset-free registry keeps configuration/import validation usable in Node.
import { approvedShapes } from "./approved-shapes.js";
export let approvedAssets = {};
export function setApprovedAssets(assets) {
  approvedAssets = Object.fromEntries(
    Object.entries(assets).map(([key, value]) => [key, value]),
  );
  for (const [key, value] of Object.entries(assets))
    Object.defineProperty(approvedAssets, key, {
      enumerable: true,
      get: () => sharedImageURL(value),
    });
}
export const handIds = {
  spoon: "H01",
  classic: "H02",
  "legacy-curved": "H03",
  "standalone-pointed": "H04",
  arrow: "H05",
  leaf: "H06",
  sword: "H07",
  cathedral: "H08",
  filigree: "H09",
  skeleton: "H10",
  quill: "H11",
  compass: "H12",
};
const materials = {
  color: "M01",
  brass: "M02",
  "aged-brass": "M03",
  copper: "M04",
  silver: "M05",
  steel: "M06",
  wood: "M07",
  ivory: "M08",
  obsidian: "M09",
  glass: "M10",
};
const tones = {
  brass: "#dab260",
  "aged-brass": "#9b8950",
  copper: "#d78c60",
  silver: "#c5d4df",
  steel: "#8fadc6",
  wood: "#977044",
  ivory: "#e6d7af",
  obsidian: "#495779",
  glass: "#96c9ca",
};
export function craftedHandPattern(style, length, member) {
  const shape = approvedShapes[style],
    url = approvedAssets[handIds[style]];
  if (!shape || !url) return "";
  const id = "crafted-hand-" + member.id.replace(/[^a-zA-Z0-9_-]/g, ""),
    scale = length / (shape.height * shape.pivot[1]),
    w = shape.width * scale,
    h = shape.height * scale,
    x = 300 - w * shape.pivot[0],
    y = 300 - h * shape.pivot[1];
  const tint =
      member.material === "color"
        ? member.color
        : tones[member.material] || tones.brass,
    rgb = [1, 3, 5].map((i) => parseInt(tint.slice(i, i + 2), 16) / 255);
  const texture =
    approvedAssets[
      member.material === "brass" && member.finish
        ? { polished: "M11", brushed: "M12", aged: "M13" }[member.finish]
        : materials[member.material]
    ];
  return `<pattern id="${id}" data-material="${member.material}" data-hand-style="${style}" patternUnits="userSpaceOnUse" x="${x}" y="${y}" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none"><defs><filter id="${id}-tone" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${rgb.map((v, i) => `<feFunc${"RGB"[i]} type="table" tableValues=".015 ${v * 0.4} ${v * 0.82} ${Math.min(1, v * 1.12)} 1"/>`).join("")}</feComponentTransfer></filter></defs><image href="${url}" width="${w}" height="${h}" preserveAspectRatio="none" filter="url(#${id}-tone)"/>${texture ? `<svg width="${w}" height="${h}" viewBox="35 35 30 70" preserveAspectRatio="none" opacity=".3" style="mix-blend-mode:soft-light"><image href="${texture}" width="100" height="600" preserveAspectRatio="none"/></svg>` : ""}</pattern>`;
}
export const craftedHandFill = (member) =>
  "url(#crafted-hand-" + member.id.replace(/[^a-zA-Z0-9_-]/g, "") + ")";
export const symbolIds = {
  home: "I01",
  work: "I02",
  school: "I03",
  gym: "I04",
  travel: "I05",
  away: "I06",
  hospital: "I07",
  shop: "I08",
  family: "I09",
  garden: "I10",
  bed: "I11",
  magic: "I12",
  pin: "I13",
};
export function craftedSymbol(kind, color = "#f4d67b") {
  const url = approvedAssets[symbolIds[kind]];
  if (!url) return "";
  // Preserve the approved metal relief; a restrained color glaze allows UI tinting.
  const id = "metalwork-" + color.replace("#", "");
  const rgb = [1, 3, 5].map((i) => parseInt(color.slice(i, i + 2), 16) / 255);
  return `<defs><filter id="${id}" color-interpolation-filters="sRGB"><feColorMatrix type="saturate" values="0"/><feComponentTransfer>${rgb.map((v, i) => `<feFunc${"RGB"[i]} type="table" tableValues=".015 ${v * 0.45} ${v * 0.85} ${Math.min(1, v * 1.15)} 1"/>`).join("")}</feComponentTransfer></filter></defs><image class="crafted-location-symbol" filter="url(#${id})" href="${url}" x="-22" y="-22" width="44" height="44" preserveAspectRatio="xMidYMid meet"/>`;
}
