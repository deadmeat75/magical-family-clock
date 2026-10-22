import artwork from "./assets/astronomical-dial.png";
import { astronomicalReading } from "./astronomical-model.js";
import { renderMoons } from "./lunar.js";

const wheels = [
  ["year", 380, 337, 70, "THE SOLAR YEAR"],
  ["day", 209, 375, 61, "DAY OF MONTH"],
  ["weekday", 312, 395, 54, "DAY OF WEEK"],
];
function wheel(name, x, y, r, label) {
  const clip = "astro-clip-" + name;
  return `<g class="astronomical-wheel" data-wheel="${name}"><title>${label}</title><defs><clipPath id="${clip}"><circle cx="${x}" cy="${y}" r="${r}"/></clipPath></defs><g clip-path="url(#${clip})"><image class="astro-rotor" data-rotor="${name}" href="${artwork}" width="600" height="600"/></g><circle cx="${x}" cy="${y}" r="${r - 1}" fill="none" stroke="#f0ce86" stroke-width=".8"/><g data-scale="${name}" font-family="Georgia,serif" font-size="7" fill="#ffe6a2" paint-order="stroke" stroke="#0c1d29" stroke-width="2"></g><path d="M${x - 4} ${y - r - 3}L${x} ${y - r + 8}L${x + 4} ${y - r - 3}Z" fill="#ffe1a0" stroke="#392817"/><rect x="${x - r * 0.63}" y="${y + 12}" width="${r * 1.26}" height="15" rx="5" fill="#0e1d2b" stroke="#b68e48" stroke-width=".5"/><text data-reading="${name}" x="${x}" y="${y + 23}" text-anchor="middle" fill="#ffe6aa" font-family="Georgia,serif" font-size="8"/></g>`;
}
export function astronomicalFace() {
  return `<g class="astronomical-face"><image href="${artwork}" width="600" height="600"/>${wheels.map((w) => wheel(...w)).join("")}<g class="astro-clock" transform="translate(247 212)"><circle r="72" fill="#0b1e2b" fill-opacity=".32"/><g fill="#ffe5a0" stroke="#172333" stroke-width="1.3" paint-order="stroke" font-size="11" font-family="Georgia,serif" text-anchor="middle">${Array.from(
    { length: 12 },
    (_, i) => {
      const a = ((i + 1) * Math.PI) / 6;
      return `<text x="${Math.sin(a) * 76}" y="${-Math.cos(a) * 76 + 4}">${["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"][i]}</text>`;
    },
  ).join(
    "",
  )}</g><path class="astro-hour" d="M-2 8L-3-36 0-49 3-36 2 8Z" fill="#efcd7e" stroke="#322817"/><path class="astro-minute" d="M-1 9L-2-54 0-68 2-54 1 9Z" fill="#fff0b3" stroke="#57401e" stroke-width=".5"/><circle r="4" fill="#d4a346" stroke="#ffdfa0"/></g><g class="astronomical-moon" transform="translate(391 206)"><circle r="42" fill="#102330"/><image data-lunar-phase=".5" x="-34" y="-34" width="68" height="68"/><text data-reading="moon" y="39" fill="#ffe4a0" font-family="Georgia,serif" font-size="6" text-anchor="middle"/></g></g>`;
}
export function updateAstronomical(
  root,
  config,
  states,
  now = new Date(),
  zone,
) {
  if (!root.querySelector(".astronomical-face")) return;
  const reading = astronomicalReading(config, states, now, zone);
  for (const [key, angle] of [
    ["hour", reading.hourAngle],
    ["minute", reading.minuteAngle],
  ])
    root
      .querySelector(".astro-" + key)
      .setAttribute("transform", `rotate(${angle})`);
  const values = {
    year: [
      reading.yearAngle,
      `${reading.year} · ${new Intl.DateTimeFormat("en", { month: "short", timeZone: zone || "UTC" }).format(now)}`,
    ],
    day: [reading.dayAngle, `${reading.day} / ${reading.daysInMonth}`],
    weekday: [
      reading.weekdayAngle,
      [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
      ][reading.weekday],
    ],
  };
  const ns = "http://www.w3.org/2000/svg";
  for (const [key, x, y, r] of wheels) {
    const [angle, label] = values[key];
    root
      .querySelector(`[data-rotor="${key}"]`)
      .setAttribute("transform", `rotate(${-angle} ${x} ${y})`);
    root.querySelector(`[data-reading="${key}"]`).textContent = label;
    const scale = root.querySelector(`[data-scale="${key}"]`);
    const labels =
      key === "year"
        ? [
            "JAN",
            "FEB",
            "MAR",
            "APR",
            "MAY",
            "JUN",
            "JUL",
            "AUG",
            "SEP",
            "OCT",
            "NOV",
            "DEC",
          ]
        : key === "weekday"
          ? ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
          : Array.from({ length: reading.daysInMonth }, (_, i) =>
              String(i + 1),
            );
    scale.replaceChildren();
    labels.forEach((name, i) => {
      // Month positions use actual calendar boundaries, including leap years.
      const fraction =
        key === "year"
          ? (Date.UTC(reading.year, i, 1) - Date.UTC(reading.year, 0, 1)) /
            86400000 /
            reading.daysInYear
          : i / labels.length;
      const a = fraction * 360 - angle,
        radians = (a * Math.PI) / 180;
      const t = document.createElementNS(ns, "text");
      t.setAttribute("x", x + Math.sin(radians) * (r - 11));
      t.setAttribute("y", y - Math.cos(radians) * (r - 11) + 2);
      t.setAttribute("text-anchor", "middle");
      if (key === "day") t.setAttribute("font-size", "5.5");
      t.textContent = name;
      scale.appendChild(t);
    });
  }
  const moon = root.querySelector(".astronomical-moon image");
  const phase = reading.moon.visible ? reading.moon.phase : null;
  moon.style.visibility = phase == null ? "hidden" : "visible";
  if (phase != null) moon.dataset.lunarPhase = phase;
  const moonLabel = root.querySelector('[data-reading="moon"]');
  moonLabel.textContent =
    phase == null
      ? "MOON SENSOR UNAVAILABLE"
      : `${Math.round((reading.moon.illumination ?? 0) * 100)}% · ${reading.moon.label.replaceAll("_", " ")}`;
  moonLabel.setAttribute("data-source", reading.moon.source);
  return renderMoons(root);
}
