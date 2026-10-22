import { materialTextureURL as panelTexturesURL } from "./texture-assets.js";
import { finite, color, locationName } from "./design.js";
export const PANEL_TEXTURES = [
  "cracked-glass",
  "hammered-metal",
  "parchment",
  "wood",
  "plain",
];
export const LOCATION_GRAPHICS = [
  "auto",
  "home",
  "work",
  "school",
  "gym",
  "travel",
  "away",
  "hospital",
  "shop",
  "family",
  "garden",
  "bed",
  "magic",
  "pin",
  "none",
  "custom",
];
const hues = [
  "#153f75",
  "#1d6155",
  "#71392b",
  "#794c85",
  "#a36b17",
  "#186359",
  "#5c385b",
  "#26486b",
];
export const escapeXML = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c],
  );
export function normalizePanels(c) {
  c.location_panels = {
    enabled: true,
    on_all_faces: false,
    texture: "cracked-glass",
    font: "Pirata One, Georgia, serif",
    font_size: 25,
    inner_radius: 180,
    frame_color: "#d9b25c",
    ...c.location_panels,
  };
  const p = c.location_panels;
  p.texture = PANEL_TEXTURES.includes(p.texture) ? p.texture : "cracked-glass";
  p.font_size = finite(p.font_size, 25, 8, 38);
  p.inner_radius = finite(p.inner_radius, 180, 155, 205);
  p.frame_color = color(p.frame_color, "#d9b25c");
  p.font = String(p.font || "Pirata One, Georgia, serif");
}
export function normalizeSlot(slot = {}) {
  slot = slot && typeof slot === "object" ? slot : {};
  return {
    ...slot,
    graphic: LOCATION_GRAPHICS.includes(slot.graphic) ? slot.graphic : "auto",
    texture: ["inherit", ...PANEL_TEXTURES].includes(slot.texture)
      ? slot.texture
      : "inherit",
    background: color(slot.background),
    graphic_color: color(slot.graphic_color, "#f4d67b"),
    graphic_size: finite(slot.graphic_size, 34, 10, 62),
    graphic_x: finite(slot.graphic_x, 0, -30, 30),
    graphic_y: finite(slot.graphic_y, 0, -25, 25),
    name_offset: finite(slot.name_offset, 0, -24, 24),
    layout: ["name-above", "name-below", "name-only", "graphic-only"].includes(
      slot.layout,
    )
      ? slot.layout
      : "name-above",
    image: slot.image || "",
  };
}
const radians = (n) => (n * Math.PI) / 180,
  angle = (n) => ((n % 360) + 360) % 360;
export function panelGeometry(locations, castle = true, openingRadius = 180) {
  const origin = { x: 300, y: castle ? 282 : 300 },
    inner = castle ? openingRadius + 8 : 196,
    outer = 278;
  const sorted = locations
    .map((l, i) => ({ location: l, index: i, a: angle(l.angle) }))
    .sort((a, b) => a.a - b.a || a.index - b.index);
  const clusters = [];
  for (const v of sorted) {
    const last = clusters[clusters.length - 1];
    if (last && Math.abs(last.a - v.a) < 0.01) last.items.push(v);
    else clusters.push({ a: v.a, items: [v] });
  }
  const distance = (a) => {
    const dy = origin.y - 300,
      dot = dy * Math.sin(radians(a));
    return -dot + Math.sqrt(dot * dot - dy * dy + outer * outer);
  };
  const point = (r, a) => ({
    x: origin.x + r * Math.cos(radians(a)),
    y: origin.y + r * Math.sin(radians(a)),
  });
  const str = (p) => `${p.x.toFixed(4)} ${p.y.toFixed(4)}`;
  return clusters.flatMap((cluster, i) => {
    const prev = clusters[(i + clusters.length - 1) % clusters.length],
      next = clusters[(i + 1) % clusters.length];
    const before =
        clusters.length === 1 ? 180 : (angle(cluster.a - prev.a) || 360) / 2,
      after =
        clusters.length === 1 ? 180 : (angle(next.a - cluster.a) || 360) / 2;
    const slice = (before + after) / cluster.items.length,
      gap = Math.min(0.5, slice * 0.1);
    return cluster.items.map((v, j) => {
      const start = cluster.a - before + j * slice + gap,
        end = start + slice - gap * 2,
        center = cluster.items.length === 1 ? v.a : (start + end) / 2,
        thickness = distance(center) - inner;
      const op = point(distance(start), start),
        oq = point(distance(end), end),
        ip = point(inner, start),
        iq = point(inner, end),
        large = end - start > 180 ? 1 : 0;
      const path = `M${str(op)}A${outer} ${outer} 0 ${large} 1 ${str(oq)}L${str(iq)}A${inner} ${inner} 0 ${large} 0 ${str(ip)}Z`;
      const radius = inner + thickness * 0.5,
        halfArc = Math.min(
          110,
          (((end - start) * Math.PI) / 180) * radius * 0.42,
        ),
        samples = [];
      for (let k = 0; k <= 72; k++) {
        const a = start + ((end - start) * k) / 72;
        samples.push(point(inner, a), point(distance(a), a));
      }
      const xs = samples.map((p) => p.x),
        ys = samples.map((p) => p.y),
        bounds = {
          x: Math.min(...xs),
          y: Math.min(...ys),
          width: Math.max(...xs) - Math.min(...xs),
          height: Math.max(...ys) - Math.min(...ys),
        };
      return {
        ...v,
        start,
        end,
        center,
        origin,
        inner,
        outer,
        thickness,
        path,
        radius,
        halfArc,
        bounds,
        point: (r) => point(r, center),
        contains: (x, y) => {
          const dx = x - origin.x,
            dy = y - origin.y,
            r = Math.hypot(dx, dy),
            a = angle((Math.atan2(dy, dx) * 180) / Math.PI - start);
          return (
            r >= inner &&
            Math.hypot(x - 300, y - 300) <= outer &&
            a <= end - start
          );
        },
      };
    });
  });
}
export function graphicFor(location) {
  const s = location.slot || {};
  if (s.graphic && s.graphic !== "auto") return s.graphic;
  const text = (location.id + " " + location.name).toLowerCase();
  return /home|house/.test(text)
    ? "home"
    : /work|office/.test(text)
      ? "work"
      : /school|college/.test(text)
        ? "school"
        : /gym|fitness/.test(text)
          ? "gym"
          : /travel|transit|moving/.test(text)
            ? "travel"
            : /away|abroad/.test(text)
              ? "away"
              : /hospital|doctor/.test(text)
                ? "hospital"
                : /shop|store/.test(text)
                  ? "shop"
                  : /garden/.test(text)
                    ? "garden"
                    : "pin";
}
const graphics = {
  home: '<path d="M-19 0L0-17 19 0H14V19H-14V0Z"/><path d="M-3 19V5H5V19M-10-1h5v5h-5M8-1h4v5H8" fill="#34271a"/>',
  work: '<rect x="-19" y="-9" width="38" height="28" rx="3"/><path d="M-7-9v-7H7v7M-19 0Q0 10 19 0" fill="none" stroke="currentColor" stroke-width="3"/><path d="M-3 2h6v7h-6Z" fill="#49301a"/>',
  school:
    '<path d="M-19-1L0-14 19-1V19H-19Z"/><path d="M-5 19V7H5V19M-13 1h4v5h-4M9 1h4v5H9" fill="#49301a"/><path d="M0-14V-25l12 3-12 4" stroke="currentColor" stroke-width="2"/>',
  gym: '<path d="M-8-3H8V3H-8Z"/><rect x="-19" y="-13" width="6" height="26" rx="2"/><rect x="-11" y="-18" width="6" height="36" rx="2"/><rect x="13" y="-13" width="6" height="26" rx="2"/><rect x="5" y="-18" width="6" height="36" rx="2"/>',
  travel:
    '<circle r="19" fill="none" stroke="currentColor" stroke-width="2"/><path d="M0-25L5-5 24 0 5 5 0 25-5 5-24 0-5-5Z"/><path d="M0-17V17M-17 0H17" stroke="#80531b"/>',
  away: '<circle r="20" fill="none" stroke="currentColor" stroke-width="2"/><path d="M-16-9L-8-17 0-15 2-8-3-4 1 2-6 6-9 0-15-2ZM7 1l11 1-3 10-8 6-3-8Z"/>',
  hospital: '<path d="M-6-19H6V-6H19V6H6V19H-6V6H-19V-6H-6Z"/>',
  shop: '<path d="M-18-6H18V19H-18Z M-21-6l6-13h30l6 13Z"/><path d="M-5 19V4H5V19M-14 1h5v7h-5M9 1h5v7H9" fill="#49301a"/>',
  family:
    '<circle cx="-9" cy="-12" r="7"/><circle cx="10" cy="-10" r="6"/><path d="M-22 18v-8q2-16 13-16t13 16v8M0 18V9q1-13 10-13t13 13v9Z"/>',
  garden:
    '<path d="M0 21V-3M0 8Q-26 5-19-13 0-16 0 8M0 0Q22 1 20-18 2-23 0 0" stroke="currentColor" stroke-width="2"/>',
  bed: '<path d="M-21-14h4v17H21v15H17V11H-17v7H-21Z M-14-3H18V3H-14Z"/><rect x="-14" y="-10" width="12" height="7" rx="3"/>',
  magic:
    '<path d="M-13 19L15-14" stroke="currentColor" stroke-width="5"/><path d="M13-25l3 9 10 3-10 3-3 9-3-9-10-3 10-3ZM-15-13l2 5 6 2-6 2-2 6-2-6-6-2 6-2Z"/>',
  pin: '<path d="M0 22C-6 10-18 0-17-10A17 17 0 1 1 17-10C18 0 6 10 0 22Z"/><circle cy="-8" r="6" fill="#49301a"/>',
};
function materialPatterns() {
  // Each crop uses a different photographic texture. A large tile avoids the
  // regular repeated dots/stripes of the former procedural patterns.
  return [
    ["hammered-metal", 0, 0],
    ["parchment", 627, 0],
    ["wood", 0, 627],
  ]
    .map(
      ([id, x, y]) =>
        `<pattern id="${id}" width="190" height="190" patternUnits="userSpaceOnUse"><svg width="190" height="190" viewBox="${x} ${y} 627 627" overflow="hidden"><image href="${panelTexturesURL}" width="1254" height="1254"/></svg></pattern>`,
    )
    .join("");
}
export function panelDefs() {
  return `<defs><filter id="panel-grain" color-interpolation-filters="sRGB" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency=".22" numOctaves="4" seed="7" result="grain"/><feColorMatrix in="grain" type="saturate" values="0"/><feComponentTransfer result="texture"><feFuncR type="linear" slope=".3" intercept=".72"/><feFuncG type="linear" slope=".3" intercept=".72"/><feFuncB type="linear" slope=".3" intercept=".72"/></feComponentTransfer><feBlend in="SourceGraphic" in2="texture" mode="multiply"/></filter><linearGradient id="panel-gold" x2=".8" y2="1"><stop stop-color="#ffecaa"/><stop offset=".25" stop-color="#bd8a32"/><stop offset=".48" stop-color="#ffe7a0"/><stop offset=".65" stop-color="#79501a"/><stop offset="1" stop-color="#efcb72"/></linearGradient><pattern id="cracked-glass" width="32" height="33" patternTransform="scale(.55)" patternUnits="userSpaceOnUse"><path d="M0 3L13 0 25 7 32 4M13 0L17 15 5 22 0 18M25 7L21 25 32 31M5 22L10 33M17 15L21 25 10 33" fill="none" stroke="#030d1d" stroke-width="1.2" opacity=".65"/><path d="M2 5L12 3 15 14 6 19ZM26 10L30 8 30 26 23 24Z" fill="#c5f9ff" opacity=".08"/></pattern>${materialPatterns()}</defs>`;
}
export function panelsEnabled(c) {
  return (
    c.location_panels.enabled &&
    !c.face_image &&
    (c.artwork === "castle" || c.location_panels.on_all_faces)
  );
}
export function panelMarkup(c, locations, states) {
  return (
    panelDefs() +
    panelGeometry(
      locations,
      c.artwork === "castle",
      c.location_panels.inner_radius,
    )
      .sort((a, b) => a.index - b.index)
      .map((g) => {
        const l = g.location,
          s = normalizeSlot(l.slot),
          texture =
            s.texture === "inherit" ? c.location_panels.texture : s.texture,
          id = "slot-" + g.index,
          name = locationName(l, states),
          bg =
            s.background ||
            {
              home: "#124d7b",
              work: "#174d3c",
              school: "#7a2c23",
              gym: "#a16b13",
              travel: "#125946",
              away: "#5b2c79",
            }[graphicFor(l)] ||
            hues[g.index % hues.length];
        const nameOnly = s.layout === "name-only",
          graphicOnly = s.layout === "graphic-only",
          below = s.layout === "name-below",
          available = g.thickness - 20;
        const glyphSize = Math.min(
            s.graphic_size,
            g.halfArc * 1.6,
            Math.max(10, available - (graphicOnly ? 0 : 24)),
          ),
          center = g.point(g.radius),
          offset = g.point(g.radius + s.name_offset);
        const nameShift = (glyphSize / 2 + 4) * (below ? 1 : -1),
          iconShift =
            ((l.size || c.location_panels.font_size) * 0.55 + 4) *
            (below ? -1 : 1);
        const text = { x: offset.x, y: offset.y + (nameOnly ? 0 : nameShift) },
          icon = { x: center.x, y: center.y + (graphicOnly ? 0 : iconShift) },
          x = l.x == null ? text.x : l.x * 6,
          y = l.y == null ? text.y : l.y * 6;
        let deco = "";
        for (let j = 0; j < 5; j++) {
          const p = g.point(g.inner + 8 + (j * (g.thickness - 16)) / 4);
          if (j === 0 || j === 4)
            deco += `<circle cx="${p.x}" cy="${p.y}" r="1.3" fill="#f7dc8f" opacity=".65"/>`;
        }
        return `<g class="location-panel" data-location="${escapeXML(l.id)}" data-panel-index="${g.index}"><defs><clipPath id="${id}"><path d="${g.path}"/></clipPath><linearGradient id="${id}-icon" x2=".8" y2="1"><stop stop-color="#fff4b6"/><stop offset=".3" stop-color="${s.graphic_color}"/><stop offset=".6" stop-color="${s.graphic_color}"/><stop offset="1" stop-color="#80511c"/></linearGradient><linearGradient id="${id}-light" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#fff" stop-opacity=".18"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".58"/></linearGradient></defs><path class="slot-surface" d="${g.path}" fill="${bg}" stroke="${c.location_panels.frame_color}" stroke-width="3.5"/><g clip-path="url(#${id})"><path d="${g.path}" fill="${bg}" filter="url(#panel-grain)"/>${s.background_image ? `<image href="${escapeXML(s.background_image)}" x="${g.bounds.x}" y="${g.bounds.y}" width="${g.bounds.width}" height="${g.bounds.height}" preserveAspectRatio="xMidYMid slice"/>` : ""}${texture !== "plain" ? `<path d="${g.path}" fill="url(#${texture})" style="mix-blend-mode:luminosity;opacity:.9"/>` : ""}<path d="${g.path}" fill="url(#${id}-light)"/><path d="${g.path}" fill="none" stroke="#fff0b5" stroke-width="7" opacity=".14"/>${deco}${!nameOnly && s.graphic !== "none" ? `<g class="slot-graphic" data-max-scale="${glyphSize / 44}" transform="translate(${icon.x + s.graphic_x} ${icon.y + s.graphic_y}) scale(${glyphSize / 44})" style="color:${s.graphic_color};fill:url(#${id}-icon);filter:drop-shadow(0px 1.5px 1px #0009)">${s.graphic === "custom" && s.image ? `<image href="${escapeXML(s.image)}" x="-22" y="-22" width="44" height="44" preserveAspectRatio="xMidYMid meet"/>` : graphics[graphicFor(l)] || ""}</g>` : ""}</g><text class="label slot-label" data-location="${escapeXML(l.id)}" data-auto-fit="${l.x == null && l.y == null}" data-max-size="${l.size || c.location_panels.font_size}" aria-label="${escapeXML(name)}" x="${x}" y="${y}" text-anchor="middle" dominant-baseline="middle" transform="rotate(${l.rotation || 0} ${x} ${y})" ${graphicOnly ? 'visibility="hidden"' : ""} style="font-family:${escapeXML(l.font || c.location_panels.font)};font-size:${l.size || c.location_panels.font_size}px;fill:${l.color || "#ffe5a0"};opacity:${l.opacity ?? 1};stroke:#25190f;stroke-width:1.1px;letter-spacing:.2px" ${l.x == null && l.y == null ? `clip-path="url(#${id})"` : ""}>${escapeXML(name)}</text></g>`;
      })
      .join("")
  );
}
export function fitPanelLabels(group) {
  const ns = "http://www.w3.org/2000/svg";
  for (const panel of group.querySelectorAll(".location-panel")) {
    const graphic = panel.querySelector(".slot-graphic"),
      surface = panel.querySelector(".slot-surface");
    if (graphic) {
      const scaleTransform = graphic.transform.baseVal.getItem(1),
        base = Number(graphic.dataset.maxScale);
      for (let factor = 1; factor > 0.04; factor *= 0.9) {
        scaleTransform.setScale(base * factor, base * factor);
        const b = graphic.getBBox(),
          matrix = graphic.transform.baseVal
            .getItem(0)
            .matrix.multiply(scaleTransform.matrix);
        let fits = true;
        for (let row = 0; row <= 4 && fits; row++)
          for (let col = 0; col <= 8; col++) {
            const point = new DOMPoint(
              b.x + (b.width * col) / 8,
              b.y + (b.height * row) / 4,
            ).matrixTransform(matrix);
            if (!surface.isPointInFill(point)) {
              fits = false;
              break;
            }
          }
        if (fits) {
          graphic.dataset.fit = "inside";
          break;
        }
      }
    }
    const text = panel.querySelector(".slot-label");
    if (text.dataset.autoFit !== "true" || !text.getAttribute("aria-label"))
      continue;
    const full = text.getAttribute("aria-label"),
      path = panel.querySelector(".slot-surface"),
      matrix = text.transform.baseVal.consolidate()?.matrix,
      max = Number(text.dataset.maxSize);
    text.textContent = full;
    const fits = () => {
      const b = text.getBBox(),
        margin = 0.7;
      for (let row = 0; row <= 4; row++)
        for (let col = 0; col <= 12; col++) {
          const p = new DOMPoint(
              b.x - margin + ((b.width + margin * 2) * col) / 12,
              b.y - margin + ((b.height + margin * 2) * row) / 4,
            ),
            q = matrix ? p.matrixTransform(matrix) : p;
          if (!path.isPointInFill(q)) return false;
        }
      return true;
    };
    let accepted = false;
    for (const wrap of [false, true]) {
      if (wrap) {
        const words = full.split(/\s+/);
        if (words.length < 2) break;
        let split = 1;
        while (
          split < words.length - 1 &&
          words.slice(0, split).join(" ").length < full.length / 2
        )
          split++;
        text.textContent = "";
        for (const [i, line] of [
          words.slice(0, split).join(" "),
          words.slice(split).join(" "),
        ].entries()) {
          const t = document.createElementNS(ns, "tspan");
          t.textContent = line;
          t.setAttribute("x", text.getAttribute("x"));
          t.setAttribute("dy", i ? "1.02em" : "-.51em");
          text.appendChild(t);
        }
      }
      for (let size = max; size >= 6; size *= 0.91) {
        text.style.fontSize = size + "px";
        if (fits()) {
          accepted = true;
          break;
        }
      }
      if (accepted) break;
    }
    if (!accepted) {
      text.style.fontSize = "6px";
      for (let length = Math.min(full.length, 48); length > 0; length--) {
        text.textContent = full.slice(0, length) + "…";
        if (fits()) {
          accepted = true;
          break;
        }
      }
    }
    text.dataset.fit = accepted ? "inside" : "clipped";
  }
}
