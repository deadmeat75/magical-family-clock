import pictures from "./assets/astronomical-pictures.png";
const tile = (i, x = -50, y = -50, w = 100, h = 100) =>
  `<svg x="${x}" y="${y}" width="${w}" height="${h}" viewBox="${(i % 4) * 256} ${Math.floor(i / 4) * 256} 256 256" preserveAspectRatio="xMidYMid slice" overflow="hidden"><image href="${pictures}" width="1024" height="768"/></svg>`;
export function periodPicture(period, id) {
  const index = ["dawn", "day", "dusk", "night"].indexOf(period);
  let image = tile(index);
  if (period === "night") {
    for (let i = 0; i < 19; i++)
      image += `<circle cx="${-43 + ((i * 37) % 86)}" cy="${-42 + ((i * 19) % 65)}" r="${i % 5 === 0 ? 0.7 : 0.28}" fill="#ffedbf"/>`;
  } else {
    const y = period === "day" ? -20 : 10;
    image += `<defs><clipPath id="${id}-sun"><circle cx="0" cy="${y}" r="17"/></clipPath></defs><g clip-path="url(#${id}-sun)">${tile(10, -17, y - 17, 34, 34)}</g>`;
  }
  return image;
}
export const seasonPicture = (season) =>
  tile(4 + ["spring", "summer", "autumn", "winter"].indexOf(season));
export function weatherPicture(kind, id) {
  let image = tile(8);
  if (!["clear", "ice"].includes(kind))
    image += `<defs><linearGradient id="${id}-cloud-fade" x2="0" y2="1"><stop offset=".25" stop-color="white"/><stop offset=".72" stop-color="black"/></linearGradient><mask id="${id}-cloud"><rect x="-50" y="-50" width="100" height="100" fill="url(#${id}-cloud-fade)"/></mask></defs><g mask="url(#${id}-cloud)" opacity="${kind === "fog" ? 0.6 : 0.9}">${tile(9)}</g>`;
  if (kind === "clear")
    image += `<defs><clipPath id="${id}-sun"><circle cx="17" cy="-26" r="12"/></clipPath></defs><g clip-path="url(#${id}-sun)">${tile(10, 5, -38, 24, 24)}</g>`;
  if (["rain", "light-rain", "sleet", "lightning"].includes(kind))
    for (let i = 0; i < (kind === "light-rain" ? 25 : 65); i++) {
      const x = -48 + ((i * 31) % 96),
        y = -42 + ((i * 19) % 83);
      image += `<path d="M${x} ${y}l-2 7" stroke="#d3e6ed" stroke-width=".5" opacity=".8"/>`;
    }
  if (["snow", "sleet"].includes(kind))
    for (let i = 0; i < 53; i++)
      image += `<circle cx="${-48 + ((i * 31) % 96)}" cy="${-45 + ((i * 23) % 91)}" r="${i % 3 === 0 ? 0.9 : 0.45}" fill="#fff8e4"/>`;
  if (kind === "wind")
    for (let i = 0; i < 12; i++) {
      const x = -42 + ((i * 37) % 84),
        y = -30 + ((i * 21) % 64);
      image += `<path d="M${x} ${y}q6 -4 11-1q-5 6-11 1" fill="#c89d4a" transform="rotate(${i * 43} ${x} ${y})"/><path d="M${x - 15} ${y + 4}q9 3 16-2" fill="none" stroke="#d5d6c1" stroke-width=".5"/>`;
    }
  if (kind === "fog")
    for (let i = 0; i < 4; i++)
      image += `<path d="M-50 ${-8 + i * 13}Q-20 ${-21 + i * 13} 7 ${-7 + i * 13}T50 ${-10 + i * 13}" fill="none" stroke="#c9d9d7" stroke-width="10" opacity=".6"/>`;
  if (kind === "lightning")
    image +=
      '<path d="M19-47L7-28 16-29-4-1 3-18-6-15 6-42M-23-39L-32-19-24-21-34-3" fill="none" stroke="#fff2c6" stroke-width="1.3"/>';
  if (kind === "ice")
    for (let i = 0; i < 10; i++) {
      const a = (i * Math.PI) / 5,
        x = Math.cos(a) * 44,
        y = Math.sin(a) * 44;
      image += `<g transform="translate(${x} ${y}) rotate(${i * 36 + 180})" stroke="#dfefea" stroke-width=".6" fill="none"><path d="M0 0H19M5 0L11-5M5 0L11 5M10 0L15-4M10 0L15 4M15 0L19-3M15 0L19 3"/></g>`;
    }
  return image;
}
