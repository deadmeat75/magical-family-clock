const random = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let n = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  n ^= n + Math.imul(n ^ (n >>> 7), 61 | n);
  return ((n ^ (n >>> 14)) >>> 0) / 4294967296;
};
export function frostMarkup(intensity) {
  const rand = random(919),
    ferns = [];
  for (let n = 0; n < Math.round(25 * intensity); n++) {
    const a = n * 2.399 + rand() * 0.2,
      r = 260 - rand() * 5,
      len = 10 + rand() * 16,
      x = 300 + Math.cos(a) * r,
      y = 300 + Math.sin(a) * r,
      angle = a + Math.PI + (rand() - 0.5) * 0.5;
    const point = (u, v) =>
      [
        x + Math.cos(angle) * u - Math.sin(angle) * v,
        y + Math.sin(angle) * u + Math.cos(angle) * v,
      ]
        .map((v) => v.toFixed(2))
        .join(" ");
    let d = "M" + point(0, 0);
    for (let j = 1; j <= 12; j++)
      d += "L" + point((len * j) / 12, Math.sin(j * 1.8 + n) * 0.22);
    for (let j = 2; j < 12; j++)
      for (const sign of [-1, 1]) {
        const u = (len * j) / 12,
          b = (1 - j / 14) * len * (0.2 + rand() * 0.12),
          v = sign * b;
        d +=
          "M" +
          point(u, 0) +
          "Q" +
          point(u + b * 0.12, v * 0.4) +
          " " +
          point(u + b * 0.7, v);
        for (let k = 1; k < 4; k++)
          d +=
            "M" +
            point(u + (b * 0.7 * k) / 4, (v * k) / 4) +
            "L" +
            point(
              u + (b * 0.7 * k) / 4 + b * 0.23,
              (v * k) / 4 + sign * b * 0.2,
            );
      }
    ferns.push(
      `<path class="frost-crystal" pathLength="1" d="${d}" style="animation-delay:${(rand() * 8).toFixed(2)}s"/>`,
    );
  }
  return `<defs><radialGradient id="frost-glass-edge" gradientUnits="userSpaceOnUse" cx="300" cy="300" r="264"><stop offset=".88" stop-color="#d6f0ff" stop-opacity="0"/><stop offset=".96" stop-color="#d6f0ff" stop-opacity=".08"/><stop offset="1" stop-color="#e5f6ff" stop-opacity=".22"/></radialGradient></defs><circle class="frost-film" cx="300" cy="300" r="264" fill="url(#frost-glass-edge)"/><g class="watchglass-frost" fill="none" stroke-linecap="round"><g stroke="#346c8c" stroke-width="1.1" opacity=".23">${ferns.join("")}</g><g stroke="#e4f7ff" stroke-width=".42" opacity=".76">${ferns.join("")}</g></g>`;
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
