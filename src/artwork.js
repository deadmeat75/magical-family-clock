import winterURL from "./assets/castle-winter-hd.png";
import dayURL from "./assets/castle-day-hd.png";
export const frameURL = ""; // The new frame is scalable vector artwork, with no baked-in lettering.
export const atlasURL = dayURL; // Kept as a compatibility export for integrations importing the old asset module.
const cache = new Map();
export function preloadImage(url) {
  if (!url) return Promise.resolve();
  if (cache.has(url)) return cache.get(url);
  const promise = new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      cache.delete(url);
      reject(Error("Image could not be loaded."));
    };
    image.src = url;
  });
  cache.set(url, promise);
  if (cache.size > 24) cache.delete(cache.keys().next().value);
  return promise;
}
export function sceneSource(scene) {
  return scene?.season === "winter" ? winterURL : dayURL;
}
export function preloadArtwork(scene) {
  return preloadImage(sceneSource(scene));
}
export function atlasMarkup(scene) {
  const night = scene.period === "night";
  const grades = {
    spring: "saturate(1.05)",
    summer: "saturate(1.15)",
    autumn: "sepia(.38) saturate(1.2)",
    winter: "saturate(.45) brightness(1.1)",
  };
  const grade =
    (grades[scene.season] || "") +
    (night ? " brightness(.3) hue-rotate(8deg)" : "");
  const tint =
    scene.period === "dawn"
      ? "#ecac9b"
      : scene.period === "dusk"
        ? "#e97e52"
        : night
          ? "#0e224b"
          : null;
  return `<g class="hd-scene" data-source-resolution="1254" data-scene-key="${scene.key}"><image href="${sceneSource(scene)}" x="108" y="90" width="384" height="384" preserveAspectRatio="xMidYMid slice" style="filter:${grade}"/>${tint ? `<rect x="108" y="90" width="384" height="384" fill="${tint}" opacity="${night ? 0.2 : 0.2}"/>` : ""}${night ? '<g fill="#e9f2ff"><circle cx="380" cy="132" r="12"/><circle cx="385" cy="128" r="11" fill="#101f3a"/><circle cx="216" cy="139" r="1"/><circle cx="352" cy="177" r="1.2"/><circle cx="265" cy="116" r="1"/></g>' : ""}</g>`;
}
export function castleFrame() {
  let out =
    '<defs><mask id="castle-frame-mask"><rect width="600" height="600" fill="white"/><circle cx="300" cy="282" r="190" fill="black"/></mask></defs><g class="scalable-castle-frame" mask="url(#castle-frame-mask)"><circle cx="300" cy="300" r="285" fill="#102b34"/>';
  const hues = [
    "#175877",
    "#244c66",
    "#77332b",
    "#742e51",
    "#683875",
    "#a17128",
    "#b08c30",
    "#95834b",
    "#28584a",
    "#215745",
    "#23524a",
    "#25485e",
  ];
  for (let i = 0; i < 12; i++) {
    out += `<defs><linearGradient id="gem-${i}" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#101c25"/><stop offset=".32" stop-color="${hues[i]}"/><stop offset=".52" stop-color="${hues[i]}"/><stop offset="1" stop-color="#0b141e"/></linearGradient></defs>`;
    const a = ((-105 + i * 30) * Math.PI) / 180,
      b = a + Math.PI / 6;
    const point = (r, t) => `${300 + Math.cos(t) * r} ${300 + Math.sin(t) * r}`;
    out += `<path d="M${point(278, a)} A278 278 0 0 1 ${point(278, b)}L${point(197, b)}A197 197 0 0 0 ${point(197, a)}Z" fill="url(#gem-${i})" stroke="url(#material-brass)" stroke-width="3"/>`;
  }
  // Clear the scene opening; the parent places this frame over the independently rendered scenery.
  out += '<circle cx="300" cy="282" r="190" fill="#000" style="display:none"/>';
  out +=
    '<circle cx="300" cy="300" r="282" fill="none" stroke="url(#material-brass)" stroke-width="12"/><circle cx="300" cy="282" r="194" fill="none" stroke="url(#material-brass)" stroke-width="7"/><circle cx="300" cy="282" r="189" fill="none" stroke="#e7c878" stroke-width="1"/>';
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    out += `<circle cx="${300 + Math.cos(a) * 282}" cy="${300 + Math.sin(a) * 282}" r="4" fill="url(#material-brass)" stroke="#3c281a"/>`;
  }
  return out + "</g>";
}
