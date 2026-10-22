import atlas from "./assets/hand-attachments.png";
import { escapeXML } from "./panels.js";
// Separate source coordinates and silhouette clips exclude neighbouring artwork,
// including the letterboxed area that leaked adjacent tags in earlier previews.
export const ATTACHMENTS = {
  parchment: {
    x: 0,
    y: 0,
    w: 780,
    h: 490,
    clip: "M82 278Q88 226 124 221L143 162Q177 180 700 160L723 225Q765 234 758 280L718 320L716 383L122 377L119 321Q83 319 82 278Z",
    tx: 420,
    ty: 282,
    tw: 440,
  },
  tag: {
    x: 780,
    y: 0,
    w: 750,
    h: 490,
    clip: "M43 49Q87 -8 158 74L216 156L266 120Q302 109 342 129L669 245Q688 251 681 293L631 449Q619 478 583 466L229 358Q193 346 190 302L188 233L109 185Q34 116 43 49Z",
    tx: 433,
    ty: 305,
    tw: 310,
    rotation: 20,
  },
  brooch: {
    x: 100,
    y: 540,
    w: 690,
    h: 410,
    clip: "M48 208Q30 183 78 165Q95 84 307 65Q300 11 351 21Q405 19 397 65Q591 87 620 168Q688 173 662 211L621 237Q607 359 365 376Q126 384 80 252Z",
    tx: 355,
    ty: 220,
    tw: 355,
  },
  portrait: {
    x: 820,
    y: 480,
    w: 660,
    h: 490,
    clip: "M37 278Q28 240 82 229L97 174L143 163Q163 74 283 67Q264 14 302 20Q338 19 321 67Q439 73 486 164L534 176L549 232Q616 234 617 278L555 323Q522 450 313 468Q121 464 81 326Z",
    tx: 327,
    ty: 266,
    tw: 285,
  },
};
export function attachmentMarkup(member, name, length) {
  const art = ATTACHMENTS[member.name_attachment];
  if (!art) return "";
  const key = "attachment-" + member.id.replace(/[^a-zA-Z0-9_-]/g, "");
  const scale = member.attachment_scale * 0.145;
  const x = 300 + member.attachment_x,
    y = 300 - length * 0.52 + member.attachment_y;
  const tx = art.tx + member.attachment_text_x,
    ty = art.ty + member.attachment_text_y;
  const anchor = member.attachment_align;
  const offset =
    anchor === "start" ? -art.tw / 2 : anchor === "end" ? art.tw / 2 : 0;
  const font =
    member.attachment_font ||
    (member.name_attachment === "parchment" || member.name_attachment === "tag"
      ? 'Caveat, "Segoe Print", cursive'
      : "Georgia, serif");
  return `<g class="name-attachment" transform="translate(${x} ${y}) rotate(${member.attachment_rotation}) scale(${scale}) translate(${-art.w / 2} ${-art.h / 2})"><defs><clipPath id="${key}"><path d="${art.clip}"/></clipPath><clipPath id="${key}-photo"><ellipse cx="327" cy="266" rx="177" ry="165"/></clipPath></defs><g clip-path="url(#${key})"><svg width="${art.w}" height="${art.h}" viewBox="${art.x} ${art.y} ${art.w} ${art.h}" preserveAspectRatio="none"><image href="${atlas}" width="1536" height="1024"/></svg></g>${member.name_attachment === "portrait" ? '<ellipse cx="327" cy="266" rx="177" ry="165" fill="#e7d8b5"/>' : ""}${member.name_attachment === "portrait" && member.portrait ? `<image class="attachment-photo" href="${escapeXML(member.portrait)}" x="150" y="101" width="354" height="330" preserveAspectRatio="xMidYMid slice" clip-path="url(#${key}-photo)"/>` : ""}${member.show_name && name ? `<text class="attachment-lettering" x="${tx + offset}" y="${ty}" text-anchor="${anchor}" dominant-baseline="middle" transform="rotate(${member.attachment_text_rotation + (art.rotation || 0)} ${tx} ${ty})" fill="${member.text_color}" style="font:italic ${member.attachment_text_size}px ${escapeXML(font)};letter-spacing:-.5px;paint-order:normal;stroke:none">${escapeXML(name)}</text>` : ""}</g>`;
}
