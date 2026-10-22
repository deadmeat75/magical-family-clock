import { astronomicalFace } from "./astronomical.js";
import { gearTrain } from "./motion.js";
import whimsicalURL from "./assets/whimsical-workshop-dial.png";
import agedBrassURL from "./assets/aged-brass-dial.png";
// Original vector artwork; no remote fonts, images, or runtime libraries.
export const palettes = {
  astronomical: {
    paper: "#e2d0a5",
    ink: "#402d1b",
    metal: "#bb9554",
    rim: "#33271b",
  },
  "whimsical-workshop": {
    paper: "#baa16c",
    ink: "#392818",
    metal: "#bd8a49",
    rim: "#53402f",
  },
  "enchanted-spoons": {
    paper: "#dcc79b",
    ink: "#493622",
    metal: "#c49a52",
    rim: "#665037",
  },
  "brass-clockwork": {
    paper: "#292a27",
    ink: "#f2d596",
    metal: "#c18a43",
    rim: "#9b6734",
  },
  "living-magical": {
    paper: "#152d39",
    ink: "#f5dca0",
    metal: "#c9aa62",
    rim: "#293f43",
  },
};
export const skies = {
  day: ["#a9d7d6", "#c8ba7a"],
  night: ["#111b37", "#48416b"],
  sunrise: ["#b8758c", "#eed3a1"],
  sunset: ["#6d467a", "#d88a56"],
  spring: ["#92b7a1", "#ced5a0"],
  summer: ["#7bb9b8", "#dcc887"],
  autumn: ["#8e6649", "#bd9252"],
  winter: ["#7397ad", "#d4dfde"],
  rain: ["#3a5369", "#94a5ae"],
};
export function metalDefs() {
  return `<linearGradient id="aged-brass" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#35291a"/><stop offset=".18" stop-color="#b88a43"/><stop offset=".32" stop-color="#f2d18a"/><stop offset=".48" stop-color="#785324"/><stop offset=".64" stop-color="#cfaa61"/><stop offset=".82" stop-color="#5e4829"/><stop offset="1" stop-color="#d0a45c"/></linearGradient><radialGradient id="aged-dial"><stop stop-color="#b39657"/><stop offset=".7" stop-color="#87703e"/><stop offset="1" stop-color="#342d20"/></radialGradient><filter id="metal-grain"><feTurbulence type="fractalNoise" baseFrequency=".9 .025" numOctaves="3" seed="8"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".09"/></feComponentTransfer><feBlend in="SourceGraphic" mode="soft-light"/></filter>`;
}
export function face(theme) {
  if (theme === "astronomical") return astronomicalFace();
  if (theme === "whimsical-workshop")
    return `<image class="material-art" href="${whimsicalURL}" x="12" y="12" width="576" height="576"/>`;
  let marks = "";
  for (let i = 0; i < 60; i++) {
    const a = (i * Math.PI) / 30;
    const r = i % 5 === 0 ? 244 : 250;
    marks += `<path d="M ${300 + Math.cos(a) * r} ${300 + Math.sin(a) * r} L ${300 + Math.cos(a) * 256} ${300 + Math.sin(a) * 256}"/>`;
  }
  let filigree = "";
  for (let i = 0; i < 12; i++)
    filigree += `<g transform="rotate(${i * 30} 300 300)"><path d="M282 54 Q300 25 318 54 Q300 78 282 54 M300 60 V85"/><circle cx="300" cy="48" r="3"/></g>`;
  let gears = "";
  if (theme === "brass-clockwork")
    for (const [x, y, r] of [
      [190, 200, 60],
      [400, 225, 75],
      [345, 420, 64],
      [180, 395, 44],
    ]) {
      let teeth = "";
      for (let i = 0; i < 16; i++)
        teeth += `<rect x="-5" y="-${r + 8}" width="10" height="18" transform="rotate(${i * 22.5})"/>`;
      gears += `<g transform="translate(${x} ${y})"><g class="gear">${teeth}<circle r="${r}" fill="none" stroke-width="9"/><circle r="${r * 0.65}" fill="none" stroke-width="3"/><path d="M-${r} 0 H${r} M0 -${r} V${r}" fill="none" stroke-width="8"/><circle r="12"/></g></g>`;
    }
  const aged = theme === "brass-clockwork";
  if (aged)
    return `<defs><mask id="clockwork-rim"><circle cx="300" cy="300" r="300" fill="white"/><circle cx="300" cy="300" r="201" fill="black"/></mask></defs><circle cx="300" cy="300" r="280" fill="#131f22"/><image class="material-art" href="${agedBrassURL}" x="12" y="12" width="576" height="576" mask="url(#clockwork-rim)"/>${gearTrain()}`;
  return `<circle cx="300" cy="300" r="288" class="outer" style="${aged ? "fill:url(#aged-brass);filter:url(#metal-grain)" : ""}"/><circle cx="300" cy="300" r="273" class="dial" style="${aged ? "fill:url(#aged-dial);filter:url(#metal-grain)" : ""}"/><g class="filigree">${filigree}</g><circle cx="300" cy="300" r="260" class="ring"/><g class="ticks">${marks}</g><g class="gears" style="${aged ? "opacity:.65;fill:url(#aged-brass);stroke:#dab778;filter:url(#metal-grain)" : ""}">${gears}</g><circle cx="300" cy="300" r="168" class="ring inner"/>`;
}
export function landscape() {
  return '<path d="M20 450 Q110 330 230 422 Q340 300 580 440 V580 H20Z" fill="#253e3d" opacity=".5"/><path d="M15 485 Q170 385 310 470 Q450 370 590 490 V590 H15Z" fill="#153033" opacity=".7"/><g fill="#f5e0a4" opacity=".7"><circle cx="165" cy="160" r="2"/><circle cx="420" cy="120" r="3"/><circle cx="385" cy="200" r="2"/><circle cx="200" cy="350" r="2"/></g>';
}
