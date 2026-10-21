// Original vector artwork; no remote fonts, images, or runtime libraries.
export const palettes = {
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
export function face(theme) {
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
  return `<circle cx="300" cy="300" r="288" class="outer"/><circle cx="300" cy="300" r="273" class="dial"/><g class="filigree">${filigree}</g><circle cx="300" cy="300" r="260" class="ring"/><g class="ticks">${marks}</g><g class="gears">${gears}</g><circle cx="300" cy="300" r="168" class="ring inner"/>`;
}
export function landscape() {
  return '<path d="M20 450 Q110 330 230 422 Q340 300 580 440 V580 H20Z" fill="#253e3d" opacity=".5"/><path d="M15 485 Q170 385 310 470 Q450 370 590 490 V590 H15Z" fill="#153033" opacity=".7"/><g fill="#f5e0a4" opacity=".7"><circle cx="165" cy="160" r="2"/><circle cx="420" cy="120" r="3"/><circle cx="385" cy="200" r="2"/><circle cx="200" cy="350" r="2"/></g>';
}
