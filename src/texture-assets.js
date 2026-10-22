// Inject bundled artwork from the browser entry point. Keeping configuration
// modules asset-free also permits the existing Node validation/import tools.
export let materialTextureURL = "";
export function setMaterialTextureURL(url) {
  materialTextureURL = url;
}

export let solidWoodTextureURL = "";
export function setSolidWoodTextureURL(url) {
  solidWoodTextureURL = url;
}
