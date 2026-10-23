import { approvedAssets } from "./approved-art.js";
import { lightingTransfer, sampleSky } from "./registered-lighting.js";
import winterURL from "./assets/optimized/castle-winter-hd.webp";
import dayURL from "./assets/optimized/castle-day-hd.webp";
export const frameURL = ""; // The new frame is scalable vector artwork, with no baked-in lettering.
export const atlasURL = dayURL; // Kept as a compatibility export for integrations importing the old asset module.
const cache = new Map(),
  registered = new Map(),
  loading = new Map(),
  skyColors = new Map();
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
  return (
    registered.get(scene?.key) ||
    (scene?.season === "winter" ? winterURL : dayURL)
  );
}
export function preloadArtwork(scene) {
  if (registered.has(scene.key)) return preloadImage(registered.get(scene.key));
  if (loading.has(scene.key)) return loading.get(scene.key);
  const index =
    ["spring", "summer", "autumn", "winter"].indexOf(scene.season) * 4 +
    ["dawn", "day", "dusk", "night"].indexOf(scene.period) +
    1;
  const reference = approvedAssets["S" + String(index).padStart(2, "0")];
  if (!reference) return preloadImage(sceneSource(scene));
  const promise = Promise.all([
    preloadImage(scene.season === "winter" ? winterURL : dayURL),
    preloadImage(reference),
  ])
    .then(([base, study]) => {
      const c = document.createElement("canvas");
      c.width = c.height = 1254;
      c.getContext("2d").drawImage(base, 0, 0, 1254, 1254);
      lightingTransfer(c, scene);
      skyColors.set(scene.key, sampleSky(study));
      const url = c.toDataURL("image/webp", 0.96);
      registered.set(scene.key, url);
      loading.delete(scene.key);
      return preloadImage(url);
    })
    .catch((error) => {
      loading.delete(scene.key);
      throw error;
    });
  loading.set(scene.key, promise);
  return promise;
}
export function sceneSkyColors(scene) {
  return skyColors.get(scene.key);
}

export function imageGrade(scene) {
  if (registered.has(scene.key)) return "";
  const night = scene.period === "night";
  const grades = {
    spring: "saturate(1.05)",
    summer: "saturate(1.15)",
    autumn: "sepia(.12) saturate(1.12)",
    winter: "saturate(1.02)",
  };
  const grade = (grades[scene.season] || "") + (night ? " saturate(.92)" : "");
  return grade;
}
export function atlasMarkup(scene) {
  const grade = imageGrade(scene);
  return `<g class="hd-scene" data-source-resolution="1254" data-scene-key="${scene.key}"><image href="${sceneSource(scene)}" x="108" y="90" width="384" height="384" preserveAspectRatio="xMidYMid slice" style="filter:${grade}"/></g>`;
}
export function castleFrame(openingRadius = 180) {
  let out = `<defs><mask id="castle-frame-mask"><rect width="600" height="600" fill="white"/><circle cx="300" cy="282" r="${openingRadius}" fill="black"/></mask></defs><g class="scalable-castle-frame" mask="url(#castle-frame-mask)"><circle cx="300" cy="300" r="285" fill="#102b34"/>`;
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
    out += `<path d="M${point(278, a)} A278 278 0 0 1 ${point(278, b)}L${point(openingRadius + 7, b)}A${openingRadius + 7} ${openingRadius + 7} 0 0 0 ${point(openingRadius + 7, a)}Z" fill="url(#gem-${i})" stroke="url(#material-brass)" stroke-width="3"/>`;
  }
  // Clear the scene opening; the parent places this frame over the independently rendered scenery.
  out += `<circle cx="300" cy="282" r="${openingRadius}" fill="#000" style="display:none"/>`;
  out += `<circle cx="300" cy="300" r="282" fill="none" stroke="url(#material-brass)" stroke-width="12"/><circle cx="300" cy="282" r="${openingRadius + 4}" fill="none" stroke="url(#material-brass)" stroke-width="7"/><circle cx="300" cy="282" r="${openingRadius - 1}" fill="none" stroke="#e7c878" stroke-width="1"/>`;
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    out += `<circle cx="${300 + Math.cos(a) * 282}" cy="${300 + Math.sin(a) * 282}" r="4" fill="url(#material-brass)" stroke="#3c281a"/>`;
  }
  out +=
    '<circle cx="300" cy="300" r="286" fill="none" stroke="#fff2b4" stroke-width=".7" opacity=".8"/><circle cx="300" cy="300" r="278.3" fill="none" stroke="#493116" stroke-width=".8"/>';
  for (let i = 0; i < 120; i++) {
    const a = (i * Math.PI) / 60;
    out += `<circle cx="${300 + Math.cos(a) * 282}" cy="${300 + Math.sin(a) * 282}" r=".85" fill="${i % 2 ? "#6c4a1e" : "#ffe9a6"}" opacity=".8"/>`;
  }
  return out + "</g>";
}

export function registeredLightingVersion(scene) {
  return registered.has(scene.key);
}
