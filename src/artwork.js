import frameURL from "./assets/castle-frame.png";
import atlasURL from "./assets/castle-scenes.png";
export { frameURL, atlasURL };
export function preloadImage(url) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(Error("Image could not be loaded."));
    image.src = url;
  });
}
let ready;
export function preloadArtwork() {
  if (!ready)
    ready = Promise.all([preloadImage(frameURL), preloadImage(atlasURL)]);
  return ready;
}
// SVG viewport cropping keeps the original generated atlas intact on disk.
export function atlasMarkup(scene) {
  return `<svg x="108" y="90" width="384" height="384" viewBox="${scene.column} ${scene.row} 1 1" preserveAspectRatio="xMidYMid slice" overflow="hidden"><image href="${atlasURL}" x="0" y="0" width="4" height="4" preserveAspectRatio="none"/></svg>`;
}
