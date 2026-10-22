const random = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
  return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
};
export function frostMarkup(intensity, opening = { x: 300, y: 282, r: 180 }) {
  const { x: cx, y: cy, r: radius } = opening,
    rand = random(919),
    paths = [];
  // All crystal geometry already exists on the glass. A continuous inward
  // growth front reveals the attached branches in spatial order, never by
  // fading complete fern/leaf silhouettes into view.
  for (let n = 0; n < Math.round(34 * intensity); n++) {
    const a = n * 2.399 + rand() * 0.13,
      r = radius - 1 - rand() * 3;
    const x = cx + Math.cos(a) * r,
      y = cy + Math.sin(a) * r;
    const direction = a + Math.PI + (rand() - 0.5) * 0.38,
      length = 28 + rand() * 40,
      bend = (rand() - 0.5) * 11;
    const point = (u, v) => {
      v += Math.sin((u / length) * Math.PI) * bend;
      return [
        x + Math.cos(direction) * u - Math.sin(direction) * v,
        y + Math.sin(direction) * u + Math.cos(direction) * v,
      ]
        .map((v) => v.toFixed(2))
        .join(" ");
    };
    let d = "M" + point(0, 0);
    for (let j = 1; j <= 20; j++) d += "L" + point((length * j) / 20, 0);
    for (let j = 1; j < 18; j++)
      for (const side of [-1, 1]) {
        const u = (length * j) / 20,
          branch = (1 - j / 21) * length * (0.17 + rand() * 0.13),
          slant = 0.48 + rand() * 0.3;
        d += "M" + point(u, 0) + "L" + point(u + branch * slant, side * branch);
        for (let k = 1; k <= 5; k++) {
          const t = k / 6,
            twig = branch * (1 - t) * (0.22 + rand() * 0.17);
          d +=
            "M" +
            point(u + branch * slant * t, side * branch * t) +
            "L" +
            point(
              u + branch * slant * t + twig * 0.85,
              side * (branch * t + twig),
            );
        }
      }
    paths.push(
      `<path d="${d}" stroke-width="${(0.25 + rand() * 0.2).toFixed(2)}" opacity="${(0.68 + rand() * 0.3).toFixed(2)}"/>`,
    );
  }
  // Six-fold needle crystals add the angular anatomy of real window ice.
  for (let n = 0; n < 18 * intensity; n++) {
    const a = rand() * Math.PI * 2,
      size = 3 + rand() * 7,
      r = radius - size - 2 - rand() * 30,
      x = cx + Math.cos(a) * r,
      y = cy + Math.sin(a) * r;
    let d = "";
    for (let arm = 0; arm < 6; arm++) {
      const angle = a + (arm * Math.PI) / 3,
        point = (u, v) =>
          `${x + Math.cos(angle) * u - Math.sin(angle) * v} ${y + Math.sin(angle) * u + Math.cos(angle) * v}`;
      d += "M" + point(0, 0) + "L" + point(size, 0);
      for (let k = 1; k < 4; k++)
        for (const side of [-1, 1])
          d +=
            "M" +
            point((size * k) / 4, 0) +
            "L" +
            point((size * k) / 4 + size * 0.17, side * size * 0.17);
    }
    paths.push(`<path d="${d}" stroke-width=".19" opacity=".7"/>`);
  }
  return `<defs><radialGradient id="frost-glass-edge" gradientUnits="userSpaceOnUse" cx="${cx}" cy="${cy}" r="${radius}"><stop offset=".65" stop-color="#e4f1f4" stop-opacity="0"/><stop offset="1" stop-color="#e4f1f4" stop-opacity=".18"/></radialGradient><filter id="frost-front-softness" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="1.15"/></filter><mask id="frost-growth-mask" maskUnits="userSpaceOnUse" x="${cx - radius}" y="${cy - radius}" width="${radius * 2}" height="${radius * 2}"><circle cx="${cx}" cy="${cy}" r="${radius + 2}" fill="white"/><circle class="frost-growth-front" cx="${cx}" cy="${cy}" r="${radius + 2}" fill="black" filter="url(#frost-front-softness)" style="transform-origin:${cx}px ${cy}px"/></mask></defs><g class="watchglass-frost" mask="url(#frost-growth-mask)"><circle class="frost-film" cx="${cx}" cy="${cy}" r="${radius}" fill="url(#frost-glass-edge)"/><g class="frost-needles" fill="none" stroke="#edfaff" stroke-linecap="round">${paths.join("")}</g></g>`;
}
export function lightningMarkup(layer = "near") {
  let out = `<defs><filter id="lightning-halo-${layer}" x="-50%" y="-25%" width="200%" height="150%"><feGaussianBlur stdDeviation="1.5"/></filter></defs>`;
  for (let n = 0; n < 10; n++) {
    if ((n % 2 === 0 ? "far" : "near") !== layer) continue;
    const rand = random(517 + n * 179),
      x = 125 + rand() * 340,
      y = 95 + rand() * 18,
      points = [[x, y]];
    for (let j = 1; j < 13; j++)
      points.push([
        points[j - 1][0] + (rand() - 0.5) * 22,
        y + j * (7 + rand() * 3),
      ]);
    const line = points
      .map(([x, y], j) => (j ? "L" : "M") + x.toFixed(2) + " " + y.toFixed(2))
      .join("");
    let branches = "";
    for (const j of [3, 5, 8]) {
      let [x, y] = points[j];
      branches += "M" + x + " " + y;
      const side = rand() > 0.5 ? 1 : -1;
      for (let k = 0; k < 4; k++) {
        x += side * (3 + rand() * 9);
        y += 4 + rand() * 8;
        branches += "L" + x.toFixed(2) + " " + y.toFixed(2);
      }
    }
    const timing = `animation-duration:${26 + n * 3.73}s;animation-delay:${1.8 + n * 2.2}s`;
    out += `<g class="lightning-strike lightning-${layer}" style="${timing}"><rect class="lightning-illumination" x="108" y="90" width="384" height="384" fill="#d7e6ff" opacity="${layer === "far" ? 0.08 : 0.16}"/><g clip-path="url(#weather-sky)"><path d="${line + branches}" fill="none" stroke="#b1caff" stroke-width="${layer === "far" ? 2 : 4}" opacity=".6" filter="url(#lightning-halo-${layer})"/><path class="lightning-core" d="${line}" fill="none" stroke="#f9fbff" stroke-width="${layer === "far" ? 0.6 : 1.2}"/><path d="${branches}" fill="none" stroke="#dfebff" stroke-width=".42"/></g></g>`;
  }
  return out;
}
