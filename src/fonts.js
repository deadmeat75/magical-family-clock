import pirata from "./assets/pirata-one.ttf";
let loaded;
export function ensureFonts() {
  if (loaded) return loaded;
  if (typeof FontFace === "undefined" || !document.fonts)
    return Promise.resolve();
  const face = new FontFace("Pirata One", `url("${pirata}")`);
  document.fonts.add(face);
  loaded = face.load().catch(() => null);
  return loaded;
}
