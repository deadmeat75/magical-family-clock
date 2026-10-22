import caveat from "./assets/caveat.ttf";
import pirata from "./assets/pirata-one.ttf";
let loaded;
export function ensureFonts() {
  if (loaded) return loaded;
  if (typeof FontFace === "undefined" || !document.fonts)
    return Promise.resolve();
  const face = new FontFace("Pirata One", `url("${pirata}")`);
  document.fonts.add(face);
  const handwriting = new FontFace("Caveat", `url("${caveat}")`);
  document.fonts.add(handwriting);
  loaded = Promise.all([face.load(), handwriting.load()]).catch(() => null);
  return loaded;
}
