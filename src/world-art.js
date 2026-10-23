import { paintedCreature } from "./painted-creatures.js";
// Small, shaded vector inhabitants. Geometry is original and remains crisp at dashboard sizes.
const wing =
  '<path class="creature-wing near-wing" d="M-1-3Q-8-23-25-23L-20-11-10-8-17-5Z" fill="currentColor"/><path class="creature-wing far-wing" d="M0-3Q8-24 24-22L19-11 9-7 16-5Z" fill="currentColor"/>';
const bird = (owl = false) =>
  owl
    ? `<path class="creature-wing near-wing" d="M-3-2Q-20-21-25-9L-21 3-7 5Z"/><path class="creature-wing far-wing" d="M3-2Q20-21 25-9L21 3 7 5Z"/><ellipse cy="1" rx="7" ry="11" fill="currentColor"/><path d="M-6-7L-7-15-1-11 7-15 6-6Z"/><circle cx="-3" cy="-6" r="3" fill="#e8ce83"/><circle cx="3" cy="-6" r="3" fill="#e8ce83"/><circle cx="-3" cy="-6" r="1" fill="#251e19"/><circle cx="3" cy="-6" r="1" fill="#251e19"/><path d="M-2-2H2L0 2Z" fill="#c28e36"/>`
    : `<path class="creature-wing far-wing" d="M-1-2Q-6-20-22-22L-16-7-7 1Z"/><path d="M-17 1L-31-5-26 3-32 10-16 6Q-1 10 11 1L17-2 11-5Q6-11 2-4Z"/><path class="creature-wing near-wing" d="M-2-1Q-11-27-29-26L-20-14-16-5-7 3Z"/><path d="M10-3L20-2 11 0" fill="#9f813e"/><circle cx="9" cy="-5" r=".9" fill="#d3dfdf"/>`;
const rider = (wizard) =>
  `<path d="M-32 10L29 2" stroke="#8a5627" stroke-width="2.5"/><path d="M-27 6L-42 3-40 8-45 12-37 13-37 18-25 12Z" fill="#b48b42"/><path d="M-27 8L-40 6M-26 11L-38 15" stroke="#dfc981" stroke-width=".7"/><path class="rider-cloak" d="M2-9Q-11-4-23 7L6 9 14 0Z" fill="url(#creature-cloth)"/><path d="M7 3L14 13 22 11M5 4L9 14 17 13" fill="none" stroke="#332238" stroke-width="3"/><path d="M10-9L19-2 24-3" fill="none" stroke="#7461a0" stroke-width="3"/><circle cx="10" cy="-14" r="5" fill="#e3bca3"/><path d="M1-18L9-37 13-23 23-18Z" fill="url(#creature-cloth)"/><path d="M4-20L18-19" stroke="#e7c480" stroke-width="1.5"/>${wizard ? '<path d="M10-10L18-7 10 3 7-7" fill="#e3e2d7"/>' : '<path d="M6-15Q-1-13 1-5" fill="none" stroke="#291c20" stroke-width="3"/>'}<circle class="creature-spark" cx="27" cy="-5" r="1.2" fill="#fff4ac"/>`;
const dragon = `<g class="dragon-far-wing creature-wing" style="transform-origin:0px -3px"><path d="M0-3Q13-26 30-49L36-31 53-28Q39-25 38-13 27-18 21-6L11 5Z" fill="url(#dragon-leather)" stroke="#222c2d" stroke-width=".7"/><path d="M0-3L30-49M0-3L36-31M0-3L53-28M0-3L38-13" fill="none" stroke="#a19370" stroke-width=".65" opacity=".65"/></g><g class="dragon-tail"><path d="M-18-1Q-34-2-43 10T-69 15Q-57 27-42 17T-15 12Z" fill="url(#dragon-scale)" stroke="#1b3032" stroke-width=".65"/><path d="M-65 16Q-49 20-41 12T-21 5" fill="none" stroke="#93a88c" stroke-width=".55"/><path d="M-65 17L-75 11-69 20-61 23Z" fill="#816d4c"/></g><path d="M-20 5Q-29 7-29 15L-24 20-33 22-25 24-20 22-19 17-11 9" fill="url(#dragon-scale)" stroke="#1d2a2d" stroke-width=".7"/><path d="M-25 22l-5 4m8-4-2 5" stroke="#c3b38c" stroke-width=".7"/><path class="dragon-body" d="M-27 4Q-24-8-8-9L8-8Q15-11 19-19 26-30 35-22L43-18 49-15 57-14 60-10 56-6 44-6 37-10Q30-12 28-4L24 7Q17 15 3 13L-14 12Z" fill="url(#dragon-scale)" stroke="#172b2f" stroke-width=".8"/><path d="M-27 4Q-24-8-8-9L8-8Q15-11 19-19 26-30 35-22L43-18 49-15 57-14 60-10 56-6 44-6 37-10Q30-12 28-4L24 7Q17 15 3 13L-14 12Z" fill="url(#dragon-scales)" opacity=".38"/><path d="M-12 8Q10 17 20 4L26-10 33-16" fill="none" stroke="#a29672" stroke-width="2.4" opacity=".55"/><path d="M-22-4l-4-9 9 7-1-12 9 10 4-12 5 12 8-11 1 10 9-6" fill="#807554" stroke="#25332f" stroke-width=".4"/><path d="M32-22Q26-26 27-35L37-24M42-19L41-30 48-18" fill="#b3a481" stroke="#3c4036" stroke-width=".55"/><path d="M39-17L47-15 43-12Z" fill="#132627"/><path d="M41-15l4 .2" stroke="#e4ba62" stroke-width="1"/><circle cx="55" cy="-11" r=".7" fill="#0a1d24"/><path d="M45-8L56-8M50-7l1 2 1-2M55-7l1 1" fill="none" stroke="#b7b091" stroke-width=".6"/><path d="M11 7L14 16 24 14 26 17 18 20 10 18 4 10" fill="url(#dragon-scale)" stroke="#1a2a2e" stroke-width=".65"/><path d="M22 16l5 2m-8 1 5 3" stroke="#b9ad8a" stroke-width=".7"/><g class="dragon-near-wing creature-wing" style="transform-origin:-7px -4px"><path d="M-7-4Q-15-29-39-55L-34-33-52-25Q-37-27-30-11-20-18-15-1L-7 7Z" fill="url(#dragon-leather)" stroke="#263333" stroke-width=".85"/><path d="M-7-4Q-13-26-39-55M-7-4L-34-33M-7-4L-52-25M-7-4L-30-11M-7-4L-15-1" fill="none" stroke="#b0a07a" stroke-width=".75" opacity=".72"/><path d="M-34-34L-35-39-31-36" fill="#cab792"/></g>`;
const serpent = `<path d="M-29 8Q-35-13-20-14T-3 6Q3-18 9-27T25-31L30-25 21-21 16-8 18 8" fill="none" stroke="url(#creature-body)" stroke-width="9" stroke-linecap="round"/><path d="M-28-1l-5-8 8 2M-17-10l-2-10 8 8M9-22L9-33 16-28" fill="#d9bc75"/><circle cx="24" cy="-28" r="1.4" fill="#fff2ba"/><path d="M14-18l5 1M11-11l6 1M12-4l6 1" stroke="#d2e7cf" stroke-width="1.4"/>`;
const merfolk = (male) =>
  `<path class="mer-tail" d="M0-8Q12 0 3 14T16 24L24 19 21 32 11 29Q-3 25-6 14L-6-7Z" fill="url(#creature-body)"/><path d="M-5-7L-7-20 3-22 8-7Z" fill="#e5b79e"/><path d="M-6-16L-14-8-20-12M5-17L12-9 18-15" fill="none" stroke="#dfb69c" stroke-width="3"/><circle cx="-1" cy="-28" r="6" fill="#e5b79e"/><path d="M-7-28Q-8-39 2-35T6-20L10-13-1-20 4-28Z" fill="${male ? "#3e3542" : "#b45843"}"/>${male ? "" : '<path d="M-6-17L-2-20 2-17 6-20 6-14-6-14Z" fill="#b69bc8"/>'}<path d="M-2 2l5 1M-2 7l6 1M-1 12l5 1" stroke="#def1ce"/>`;
const boat = `<path d="M-25 4Q0 13 25 4L16 14H-15Z" fill="#72482e" stroke="#d7bc77" stroke-width="1"/><path d="M0-27V6" stroke="#946f48" stroke-width="2"/><path d="M-2-25L-23 2-2-1Z" fill="currentColor"/><path d="M3-22L19 0H3Z" fill="#b88c78"/><path d="M0-28L13-25 0-20" fill="#ae5a50"/>`;
const cottage = `<path d="M-20 3L1-18 23 3V28H-20Z" fill="currentColor"/><path d="M-27 4L0-25 29 3 24 9 0-15-22 10Z" fill="#685467"/><path d="M13-17V-29H19V-10" fill="#816651"/><path d="M-5 28V10Q0 4 5 10V28" fill="#4c3a35"/><path d="M-15 10h7v8h-7M10 10h7v8h-7" fill="#f4cb70"/><path d="M-22 27Q-16 15-12 27M15 27q4-17 9 0" fill="#4e7549"/><path class="chimney-smoke" d="M17-29q-8-7-1-13t-3-12" stroke="#cbd9e5" stroke-width="4" opacity=".6" fill="none"/>`;
const mushrooms = `<path d="M-16 26L-14 6M5 25L9-8M20 28L22 15" stroke="#d5c5ab" stroke-width="5"/><path d="M-30 9Q-15-14-1 9Z" fill="#b15c6e"/><path d="M-11-4Q10-33 29-4Z" fill="currentColor"/><path d="M10 16Q21 0 33 16Z" fill="#ae7763"/><g fill="#fff2c6"><circle cx="-15" cy="3" r="2"/><circle cx="8" cy="-12" r="3"/><circle cx="20" cy="-7" r="2"/><circle cx="23" cy="11" r="2"/></g><g class="creature-glow" fill="#d0e4b8"><circle cx="-23" cy="16" r="1.2"/><circle cx="12" cy="0" r="1.2"/></g>`;
const crystals = `<path d="M-8 25L-15-17-6-33 4-19 7 25ZM8 25L11-5 24-20 30-11 20 25ZM-24 26L-33 4-28-8-16 2-10 26Z" fill="url(#crystal-sheen)" stroke="#d8e7f0" stroke-width=".5"/><path d="M-6-33L-2 23M24-20L18 24M-28-8L-20 23" stroke="#b0d5ea" opacity=".7"/>`;
const lantern = `<path d="M-8-11Q-12-3-7 10H7Q12-3 8-11Z" fill="currentColor" stroke="#7b4e2e" stroke-width="1"/><path d="M-6-13H6M-6 12H6M-4-10L-3 10M4-10L3 10" stroke="#9d6e36" fill="none"/><ellipse class="creature-glow" ry="5" rx="2" fill="#fff2b8"/><path d="M-3 14L-2 21M3 14L5 19" stroke="#c38c66"/>`;
const unicorn = `<path d="M-19 4Q-13-10 5-8L15-22 20-21 25-6 18 2 9 1 5 13H-14Z" fill="#ebe2cc"/><path d="M-17 8L-20 25M-8 10L-6 26M5 8L11 24M-17-1Q-32-9-28 16" stroke="#d3c6c9" stroke-width="3.5" fill="none"/><path d="M19-23L25-37 24-19" fill="#ebce8b"/><path d="M12-20Q5-17 5-8L11-10 9-2 17-8" fill="currentColor"/><circle cx="20" cy="-14" r="1" fill="#2c2c39"/>`;
export function inhabitantArt(kind, tint = "") {
  const painted = paintedCreature(kind, tint);
  if (painted) return painted;
  switch (kind) {
    case "bird":
      return bird();
    case "owl":
      return bird(true);
    case "witch":
      return rider(false);
    case "wizard":
      return rider(true);
    case "dragon":
      return dragon;
    case "phoenix":
      return (
        wing +
        '<path d="M-4-7Q8-10 6 3L1 22-3 12-8 27-6 5Z" fill="url(#creature-body)"/><path class="phoenix-tail" d="M0 8Q-19 17-12 36M0 8Q12 23 4 40" stroke="#f9c56b" stroke-width="2" fill="none"/>'
      );
    case "fairy":
      return '<ellipse class="creature-wing near-wing" cx="-8" cy="-7" rx="7" ry="14" fill="#c4def1" opacity=".8"/><ellipse class="creature-wing far-wing" cx="8" cy="-7" rx="7" ry="14" fill="#dccde5" opacity=".8"/><circle cy="-14" r="4" fill="#ebc7ac"/><path d="M-2-8L-8 9H8L2-8M-3 10L-4 22M3 10L4 22" fill="currentColor" stroke="#dbd3b6"/>';
    case "sea-monster":
      return serpent;
    case "mermaid":
      return merfolk(false);
    case "merman":
      return merfolk(true);
    case "sailboat":
      return boat;
    case "cottage":
      return cottage;
    case "mushrooms":
      return mushrooms;
    case "crystals":
      return crystals;
    case "lantern":
      return lantern;
    case "unicorn":
      return unicorn;
    default:
      return "";
  }
}
export function creatureDefs() {
  return '<defs><linearGradient id="creature-body" x2=".6" y2="1"><stop stop-color="#e7d5a4"/><stop offset=".22" stop-color="currentColor"/><stop offset=".65" stop-color="currentColor"/><stop offset="1" stop-color="#203f48"/></linearGradient><linearGradient id="dragon-membrane" x2="0" y2="1"><stop stop-color="#c9d59e"/><stop offset=".5" stop-color="currentColor"/><stop offset="1" stop-color="#334b4c"/></linearGradient><linearGradient id="creature-cloth" x2=".8" y2=".7"><stop stop-color="#ded0dd"/><stop offset=".3" stop-color="currentColor"/><stop offset="1" stop-color="#24172f"/></linearGradient><linearGradient id="crystal-sheen" x2="1" y2=".2"><stop stop-color="#355d88"/><stop offset=".4" stop-color="currentColor"/><stop offset=".52" stop-color="#f2e3f4"/><stop offset="1" stop-color="#527db7"/></linearGradient><linearGradient id="dragon-scale" x1="0" y1="0" x2=".2" y2="1"><stop stop-color="#76958a"/><stop offset=".3" stop-color="currentColor"/><stop offset=".7" stop-color="#26494a"/><stop offset="1" stop-color="#122a32"/></linearGradient><linearGradient id="dragon-leather" x1="0" y1="0" x2=".5" y2="1"><stop stop-color="#9f8b61"/><stop offset=".4" stop-color="#655d43"/><stop offset="1" stop-color="#263c3d"/></linearGradient><pattern id="dragon-scales" width="4" height="3.5" patternUnits="userSpaceOnUse"><path d="M0 0Q1 3 2 0M2 1.7q1 3 2 0" fill="none" stroke="#c5c49f" stroke-width=".35"/></pattern></defs>';
}
