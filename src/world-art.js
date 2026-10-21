// Small, shaded vector inhabitants. Geometry is original and remains crisp at dashboard sizes.
const wing =
  '<path class="creature-wing near-wing" d="M-1-3Q-8-23-25-23L-20-11-10-8-17-5Z" fill="currentColor"/><path class="creature-wing far-wing" d="M0-3Q8-24 24-22L19-11 9-7 16-5Z" fill="currentColor"/>';
const bird = (owl = false) =>
  owl
    ? `<path class="creature-wing near-wing" d="M-3-2Q-20-21-25-9L-21 3-7 5Z"/><path class="creature-wing far-wing" d="M3-2Q20-21 25-9L21 3 7 5Z"/><ellipse cy="1" rx="7" ry="11" fill="currentColor"/><path d="M-6-7L-7-15-1-11 7-15 6-6Z"/><circle cx="-3" cy="-6" r="3" fill="#e8ce83"/><circle cx="3" cy="-6" r="3" fill="#e8ce83"/><circle cx="-3" cy="-6" r="1" fill="#251e19"/><circle cx="3" cy="-6" r="1" fill="#251e19"/><path d="M-2-2H2L0 2Z" fill="#c28e36"/>`
    : `<path class="creature-wing near-wing" d="M0 0Q-8-17-24-13L-15-3-8 1Z"/><path class="creature-wing far-wing" d="M0 0Q8-17 24-13L15-3 8 1Z"/><path d="M-4 0Q0-8 4 0L0 13-5 21-1 10-7 17Z"/><circle cy="-3" r="3"/><path d="M2-4L7-3 2-1" fill="#b99546"/>`;
const rider = (wizard) =>
  `<path d="M-32 10L29 2" stroke="#8a5627" stroke-width="2.5"/><path d="M-27 6L-42 3-40 8-45 12-37 13-37 18-25 12Z" fill="#b48b42"/><path d="M-27 8L-40 6M-26 11L-38 15" stroke="#dfc981" stroke-width=".7"/><path class="rider-cloak" d="M2-9Q-11-4-23 7L6 9 14 0Z" fill="url(#creature-cloth)"/><path d="M7 3L14 13 22 11M5 4L9 14 17 13" fill="none" stroke="#332238" stroke-width="3"/><path d="M10-9L19-2 24-3" fill="none" stroke="#7461a0" stroke-width="3"/><circle cx="10" cy="-14" r="5" fill="#e3bca3"/><path d="M1-18L9-37 13-23 23-18Z" fill="url(#creature-cloth)"/><path d="M4-20L18-19" stroke="#e7c480" stroke-width="1.5"/>${wizard ? '<path d="M10-10L18-7 10 3 7-7" fill="#e3e2d7"/>' : '<path d="M6-15Q-1-13 1-5" fill="none" stroke="#291c20" stroke-width="3"/>'}<circle class="creature-spark" cx="27" cy="-5" r="1.2" fill="#fff4ac"/>`;
const dragon = `<path class="dragon-far-wing creature-wing" d="M-3-3Q2-35 25-32L18-19 27-16 12-11 13-3Z" fill="url(#dragon-membrane)"/><path d="M-15 8Q-35 2-29-12-25-1-12-2L8-8 17-4 13 9-3 12Z" fill="url(#creature-body)"/><path d="M5-6Q13-28 22-23L26-19 34-16 31-11 23-11 18 2Z" fill="url(#creature-body)"/><path d="M23-23L18-30 27-25 29-29 29-21M-13-1L-17-8-6-4-8-10 1-6" fill="#d2b46b"/><path class="dragon-near-wing creature-wing" d="M-7-3Q-14-38-34-35L-24-20-34-16-16-10-18-2Z" fill="url(#dragon-membrane)"/><path d="M-8-3L-25-29M-8-3L-25-17M-8-3L-16-10" stroke="#c7dbbc" stroke-width=".65"/><path d="M-3 9L-9 20-16 21M6 9L9 18 3 20" stroke="#416654" stroke-width="3" fill="none"/><circle cx="26" cy="-19" r="1.2" fill="#fff2a6"/>`;
const serpent = `<path d="M-29 8Q-35-13-20-14T-3 6Q3-18 9-27T25-31L30-25 21-21 16-8 18 8" fill="none" stroke="url(#creature-body)" stroke-width="9" stroke-linecap="round"/><path d="M-28-1l-5-8 8 2M-17-10l-2-10 8 8M9-22L9-33 16-28" fill="#d9bc75"/><circle cx="24" cy="-28" r="1.4" fill="#fff2ba"/><path d="M14-18l5 1M11-11l6 1M12-4l6 1" stroke="#d2e7cf" stroke-width="1.4"/>`;
const merfolk = (male) =>
  `<path class="mer-tail" d="M0-8Q12 0 3 14T16 24L24 19 21 32 11 29Q-3 25-6 14L-6-7Z" fill="url(#creature-body)"/><path d="M-5-7L-7-20 3-22 8-7Z" fill="#e5b79e"/><path d="M-6-16L-14-8-20-12M5-17L12-9 18-15" fill="none" stroke="#dfb69c" stroke-width="3"/><circle cx="-1" cy="-28" r="6" fill="#e5b79e"/><path d="M-7-28Q-8-39 2-35T6-20L10-13-1-20 4-28Z" fill="${male ? "#3e3542" : "#b45843"}"/>${male ? "" : '<path d="M-6-17L-2-20 2-17 6-20 6-14-6-14Z" fill="#b69bc8"/>'}<path d="M-2 2l5 1M-2 7l6 1M-1 12l5 1" stroke="#def1ce"/>`;
const boat = `<path d="M-25 4Q0 13 25 4L16 14H-15Z" fill="#72482e" stroke="#d7bc77" stroke-width="1"/><path d="M0-27V6" stroke="#946f48" stroke-width="2"/><path d="M-2-25L-23 2-2-1Z" fill="currentColor"/><path d="M3-22L19 0H3Z" fill="#b88c78"/><path d="M0-28L13-25 0-20" fill="#ae5a50"/>`;
const cottage = `<path d="M-20 3L1-18 23 3V28H-20Z" fill="currentColor"/><path d="M-27 4L0-25 29 3 24 9 0-15-22 10Z" fill="#685467"/><path d="M13-17V-29H19V-10" fill="#816651"/><path d="M-5 28V10Q0 4 5 10V28" fill="#4c3a35"/><path d="M-15 10h7v8h-7M10 10h7v8h-7" fill="#f4cb70"/><path d="M-22 27Q-16 15-12 27M15 27q4-17 9 0" fill="#4e7549"/><path class="chimney-smoke" d="M17-29q-8-7-1-13t-3-12" stroke="#cbd9e5" stroke-width="4" opacity=".6" fill="none"/>`;
const mushrooms = `<path d="M-16 26L-14 6M5 25L9-8M20 28L22 15" stroke="#d5c5ab" stroke-width="5"/><path d="M-30 9Q-15-14-1 9Z" fill="#b15c6e"/><path d="M-11-4Q10-33 29-4Z" fill="currentColor"/><path d="M10 16Q21 0 33 16Z" fill="#ae7763"/><g fill="#fff2c6"><circle cx="-15" cy="3" r="2"/><circle cx="8" cy="-12" r="3"/><circle cx="20" cy="-7" r="2"/><circle cx="23" cy="11" r="2"/></g><g class="creature-glow" fill="#d0e4b8"><circle cx="-23" cy="16" r="1.2"/><circle cx="12" cy="0" r="1.2"/></g>`;
const crystals = `<path d="M-8 25L-15-17-6-33 4-19 7 25ZM8 25L11-5 24-20 30-11 20 25ZM-24 26L-33 4-28-8-16 2-10 26Z" fill="url(#crystal-sheen)" stroke="#d8e7f0" stroke-width=".5"/><path d="M-6-33L-2 23M24-20L18 24M-28-8L-20 23" stroke="#b0d5ea" opacity=".7"/>`;
const lantern = `<path d="M-8-11Q-12-3-7 10H7Q12-3 8-11Z" fill="currentColor" stroke="#7b4e2e" stroke-width="1"/><path d="M-6-13H6M-6 12H6M-4-10L-3 10M4-10L3 10" stroke="#9d6e36" fill="none"/><ellipse class="creature-glow" ry="5" rx="2" fill="#fff2b8"/><path d="M-3 14L-2 21M3 14L5 19" stroke="#c38c66"/>`;
const unicorn = `<path d="M-19 4Q-13-10 5-8L15-22 20-21 25-6 18 2 9 1 5 13H-14Z" fill="#ebe2cc"/><path d="M-17 8L-20 25M-8 10L-6 26M5 8L11 24M-17-1Q-32-9-28 16" stroke="#d3c6c9" stroke-width="3.5" fill="none"/><path d="M19-23L25-37 24-19" fill="#ebce8b"/><path d="M12-20Q5-17 5-8L11-10 9-2 17-8" fill="currentColor"/><circle cx="20" cy="-14" r="1" fill="#2c2c39"/>`;
export function inhabitantArt(kind) {
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
  return '<defs><linearGradient id="creature-body" x2=".6" y2="1"><stop stop-color="#e7d5a4"/><stop offset=".22" stop-color="currentColor"/><stop offset=".65" stop-color="currentColor"/><stop offset="1" stop-color="#203f48"/></linearGradient><linearGradient id="dragon-membrane" x2="0" y2="1"><stop stop-color="#c9d59e"/><stop offset=".5" stop-color="currentColor"/><stop offset="1" stop-color="#334b4c"/></linearGradient><linearGradient id="creature-cloth" x2=".8" y2=".7"><stop stop-color="#ded0dd"/><stop offset=".3" stop-color="currentColor"/><stop offset="1" stop-color="#24172f"/></linearGradient><linearGradient id="crystal-sheen" x2="1" y2=".2"><stop stop-color="#355d88"/><stop offset=".4" stop-color="currentColor"/><stop offset=".52" stop-color="#f2e3f4"/><stop offset="1" stop-color="#527db7"/></linearGradient></defs>';
}
