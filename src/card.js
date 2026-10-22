import { updateAstronomical } from "./astronomical.js";
import { attachmentMarkup } from "./attachments.js";
import { renderBezelArtwork } from "./bezel-art.js";
import materialTexturesURL from "./assets/panel-material-textures-r1.png";
import { setMaterialTextureURL } from "./texture-assets.js";
setMaterialTextureURL(materialTexturesURL);
import { ensureFonts } from "./fonts.js";
import { panelsEnabled, panelMarkup, fitPanelLabels } from "./panels.js";
import { worldCSS, worldMarkup } from "./world.js";
import {
  startWorldPainter,
  captureWorldAnimations,
  restoreWorldAnimations,
} from "./world-painter.js";
import { moonReading } from "./world-config.js";
import { fitEngraving, letteringRotation } from "./engraving.js";
import {
  handName,
  locationName,
  labelPosition,
  textPosition,
  presentationFor,
} from "./design.js";
import { finishDefs, materialFill, surfaceMarkup } from "./finish.js";
import { motionCSS } from "./motion.js";
import { bezelText, bezelArc } from "./bezel.js";
import { metricText, runtimeConfig } from "./data.js";
import {
  weatherFor,
  weatherMarkup,
  weatherCSS,
  windReading,
} from "./weather.js";
import {
  defaults,
  normalize,
  positions,
  backgroundFor,
  safeImage,
  demoStates,
} from "./engine.js";
import { palettes, skies, face, landscape, metalDefs } from "./themes.js";
import "./editor.js";
import { sceneFor } from "./scenes.js";
import {
  castleFrame,
  atlasMarkup,
  preloadImage,
  preloadArtwork,
} from "./artwork.js";
import { handStyle, handRadius, handPath } from "./hands.js";
const NS = "http://www.w3.org/2000/svg";
function svg(tag, attrs = {}, text) {
  const e = document.createElementNS(NS, tag);
  Object.keys(attrs).forEach((k) => e.setAttribute(k, String(attrs[k])));
  if (text !== undefined) e.textContent = text;
  return e;
}
const style = `.scene-layer{transition:opacity var(--fade,1500ms)}@media(prefers-reduced-motion:reduce){.scene-layer{transition:none}}.still .scene-layer{transition:none}.legacy-name{font-weight:500;font-family:var(--font,Georgia,serif);dominant-baseline:middle;text-anchor:middle}:host{display:block;color:var(--primary-text-color,#eee)}*{box-sizing:border-box}[hidden]{display:none!important}ha-card{display:block;position:relative;overflow:hidden;background:var(--card-background-color,#172325);border-radius:20px}.frame{margin:auto;width:100%;position:relative}svg{display:block;width:100%;height:auto;overflow:visible}.outer{fill:var(--rim);stroke:var(--metal);stroke-width:3}.dial{fill:var(--paper);stroke:var(--metal);stroke-width:2}.ring{fill:none;stroke:var(--metal);stroke-width:1;opacity:.55}.inner{stroke-dasharray:2 7}.ticks,.filigree{fill:none;stroke:var(--metal);stroke-width:1.5}.gears{fill:var(--metal);stroke:var(--metal);opacity:.25}.gear{animation:turn var(--gear-speed,60s) linear infinite;transform-box:fill-box;transform-origin:center}.gears-off .gear,.paused .gear,.still .gear{animation-play-state:paused}.hand{transition:transform var(--duration,1000ms) cubic-bezier(.4,0,.2,1);transform-origin:300px 300px}.counter{transition:transform var(--duration,1000ms) cubic-bezier(.4,0,.2,1)}.label{font:600 17px Georgia,serif;fill:var(--ink);letter-spacing:1px;paint-order:stroke;stroke:var(--paper);stroke-width:3px;stroke-linejoin:round}.name{font:600 13px Georgia,serif;paint-order:stroke;stroke:#152326;stroke-width:3px;stroke-linejoin:round}.minimal .filigree,.minimal .inner{display:none}.label,.name,.caption,.title{font-family:var(--font,Georgia,serif)}#sky stop{transition:stop-color var(--fade,1500ms)}.background-image{transition:opacity var(--fade,1500ms)}.caption{font:12px var(--font,Georgia,serif);letter-spacing:4px;fill:var(--ink);opacity:.7}.title{font:italic 23px var(--font,Georgia,serif);fill:var(--ink)}button{border:1px solid #b69657;background:#182a2ee0;color:#f2dfb6;border-radius:24px;padding:8px 12px;cursor:pointer}.fullscreen{position:absolute;right:12px;bottom:12px}.empty{position:absolute;inset:30% 20%;display:flex;align-items:center;text-align:center;color:var(--ink);font:18px Georgia}.expanded{position:fixed!important;inset:0!important;z-index:10000;border-radius:0;background:#101d23!important;display:grid;place-items:center}ha-card:fullscreen{width:100vw;height:100vh;border-radius:0;background:#101d23;display:grid;place-items:center}ha-card:fullscreen .frame{width:95vw;max-width:95vh!important;width:min(95vw,95vh)}.expanded .frame{width:95vw;max-width:95vh!important;width:min(95vw,95vh)}.still .hand,.still .counter,.still .background-image{transition:none}@keyframes turn{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.hand,.counter,.background-image,#sky stop{transition:none}.gear{animation:none}}`;
export class MagicalFamilyClock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hands = new Map();
    this._angles = new Map();
    this._solarHistory = [];
    this._sceneToken = 0;
    this._visible = true;
    this._fullscreenChanged = () => this._syncVisibility();
    this._templateIndex = null;
  }
  static getConfigElement() {
    return document.createElement("magical-family-clock-card-editor");
  }
  static getStubConfig() {
    return defaults();
  }
  getCardSize() {
    return 7;
  }
  getGridOptions() {
    return { columns: 12, rows: 8, min_columns: 4, min_rows: 4 };
  }
  setConfig(config) {
    const base = normalize(config);
    const same = JSON.stringify(base) === this._baseKey;
    if (same) return;
    this._baseKey = JSON.stringify(base);
    const priorIdentity = this._baseConfig?.instance_id;
    this._baseConfig = base;
    if (priorIdentity !== base.instance_id || this._templateIndex == null) {
      this._templateIndex = 0;
      if (base.carousel.enabled && base.carousel.remember)
        try {
          this._templateIndex =
            Number(localStorage.getItem(this._templateStorageKey())) || 0;
        } catch {}
    }
    this._templateIndex = Math.min(
      Math.max(0, this._templateIndex),
      Math.max(0, base.carousel.templates.length - 1),
    );
    this._config = normalize(presentationFor(base, this._templateIndex));
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    this._update();
  }
  connectedCallback() {
    if (!this._config) this.setConfig(defaults());
    if (this._needsReconnectRender) {
      this._needsReconnectRender = false;
      this._render();
    }
    if (window.IntersectionObserver) {
      this._observer = new IntersectionObserver((entries) => {
        this._intersecting = entries[0].isIntersecting;
        this._syncVisibility();
      });
      this._observer.observe(this.shadowRoot.querySelector("ha-card"));
    }
    document.addEventListener("fullscreenchange", this._fullscreenChanged);
    clearInterval(this._timer);
    this._timer = window.setInterval(() => {
      if (!this._visible) return;
      this._updateBezel();
      this._updateAstronomical();
      if (Date.now() - (this._lastSceneTick || 0) > 60000) {
        this._lastSceneTick = Date.now();
        this._update();
      }
      const carousel = this._baseConfig?.carousel;
      if (
        carousel?.enabled &&
        carousel.auto &&
        !this._hover &&
        !this._hasFocus &&
        !this._reduced() &&
        Date.now() - this._lastSwitch >= carousel.interval * 1000
      )
        this._switchTemplate(1);
    }, 1000);
    this._update();
    if (document.fonts?.ready)
      document.fonts.ready.then(() => {
        if (!this.isConnected) return;
        this._hands.forEach((hand) => {
          if (hand.name) {
            hand.fitPending = true;
            this._fitHandName(hand);
          }
        });
      });
  }
  disconnectedCallback() {
    document.removeEventListener("fullscreenchange", this._fullscreenChanged);
    if (this._worldPainter) this._worldElapsed = this._worldPainter.stop();
    this._needsReconnectRender = true;
    this._imageToken = (this._imageToken || 0) + 1;
    this._faceToken = (this._faceToken || 0) + 1;
    this._sceneToken++;
    this._sceneRequest = null;
    if (this._observer) this._observer.disconnect();
    clearInterval(this._timer);
    clearTimeout(this._sceneBoundaryTimer);
    cancelAnimationFrame(this._labelFrame);
    if (this._faceLoad) {
      this._faceLoad.onload = null;
      this._faceLoad.onerror = null;
    }
  }
  _render() {
    this._worldAnimationState = captureWorldAnimations(
      this.shadowRoot.querySelector(".scene-animation"),
    );
    if (this._worldPainter) this._worldElapsed = this._worldPainter.stop();
    const c = this._config,
      p = { ...palettes[c.theme], ...c.colors };
    cancelAnimationFrame(this._labelFrame);
    if (this._faceLoad) {
      this._faceLoad.onload = null;
      this._faceLoad.onerror = null;
    }
    clearTimeout(this._sceneBoundaryTimer);
    this._sceneToken++;
    this._sceneRequest = null;
    this._activeScene = 0;
    this._sceneLoaded = false;
    this._hands.clear();
    this._imageURL = null;
    this._imageRequest = null;
    this._bezelKey = null;
    this._faceToken = (this._faceToken || 0) + 1;
    this._imageToken = (this._imageToken || 0) + 1;
    this._weatherKey = null;
    this._locationKey = null;
    this._worldKey = null;
    this.shadowRoot.innerHTML = `<style>${style}${weatherCSS}${motionCSS}${worldCSS}.engraved{paint-order:stroke;stroke:#170f0970;stroke-width:.25px;filter:drop-shadow(0px .35px .1px #fff7);font-family:var(--name-font);font-size:var(--name-size)}.metric{font:10px system-ui;fill:var(--ink);paint-order:stroke;stroke:var(--paper);stroke-width:2px}.label{font-family:var(--location-font);font-size:var(--location-size)}.caption{font-family:var(--caption-font);font-size:var(--caption-size)}.caption,.title{paint-order:stroke;stroke:var(--paper);stroke-width:2px;stroke-linejoin:round}.image-status{position:absolute;left:12px;bottom:8px;max-width:65%;font:12px system-ui;background:#101c29e8;color:#eddcb9;padding:5px 9px;border-radius:8px}.template-navigation{display:flex;align-items:center;justify-content:center;gap:12px;padding:8px 140px 12px 12px;min-height:56px}.template-name{font:14px system-ui}.template-navigation button{font-size:20px}.frame{touch-action:pan-y}.bezel-value{paint-order:stroke;stroke:#101b20;stroke-width:.35px;stroke-linejoin:round}.portrait-surface{filter:url(#effect-portraits)}.face{filter:url(#effect-face)}.hands{filter:url(#effect-hands)}.bezel{filter:url(#effect-bezel)}.castle-frame,.frame-finish{filter:url(#effect-frame)}.frame-glare{pointer-events:none}</style><ha-card><div class="frame"><svg viewBox="0 0 600 600" role="img" aria-label="Family whereabouts clock"><defs>${metalDefs()}${finishDefs(c.effects)}<clipPath id="dial-clip"><circle cx="300" cy="300" r="266"/></clipPath><clipPath id="castle-opening"><circle cx="300" cy="282" r="${c.location_panels.inner_radius}"/></clipPath><linearGradient id="sky" x2="0" y2="1"><stop/><stop offset="1"/></linearGradient></defs><g class="face">${face(c.theme)}</g><g class="scenery" clip-path="url(#dial-clip)"><circle cx="300" cy="300" r="235" fill="url(#sky)" opacity=".5"/>${landscape()}</g><image class="background-image" x="65" y="65" width="470" height="470" preserveAspectRatio="xMidYMid slice" clip-path="url(#dial-clip)" opacity=".4"/><image class="background-image background-old" x="65" y="65" width="470" height="470" preserveAspectRatio="xMidYMid slice" clip-path="url(#dial-clip)" opacity="0"/><g class="castle-artwork" style="display:none"><g class="castle-scenes" clip-path="url(#castle-opening)"><g class="scene-layer" style="opacity:0"></g><g class="scene-layer" style="opacity:0"></g></g><g class="castle-frame"></g><g class="scene-animation"></g></g><image class="face-image" x="0" y="0" width="600" height="600" preserveAspectRatio="none" style="display:none"/><g class="weather" clip-path="url(#dial-clip)"></g><g class="locations"></g><text class="caption" x="300" y="380" text-anchor="middle">MAGICAL FAMILY CLOCK</text><text class="title" x="300" y="410" text-anchor="middle"></text><image class="center-image" x="255" y="255" width="90" height="90"/><g class="hands"></g><circle class="hub-outer" cx="300" cy="300" r="13" fill="url(#material-brass)" stroke="url(#material-aged-brass)" stroke-width="2"/><circle class="hub-inner" cx="300" cy="300" r="4" fill="url(#material-aged-brass)" stroke="#ffe1a0" stroke-width=".7"/></svg><div class="empty" hidden></div><div class="image-status" role="status" hidden></div></div><div class="template-navigation" hidden><button class="template-previous" aria-label="Previous clock face">‹</button><span class="template-name" aria-live="polite"></span><button class="template-next" aria-label="Next clock face">›</button></div><button class="fullscreen" aria-label="Expand clock">⛶ Fullscreen</button></ha-card>`;
    const card = this.shadowRoot.querySelector("ha-card");
    Object.keys(p).forEach((k) => card.style.setProperty("--" + k, p[k]));
    card.style.setProperty("--duration", c.duration + "ms");
    card.style.setProperty("--gear-speed", c.gear_speed + "s");
    card.style.setProperty("--motion-speed", c.motion_speed);
    card.style.setProperty("--scene-intensity", c.scene_intensity);
    card.style.setProperty(
      "--template-transition",
      c.carousel.transition + "ms",
    );
    card.classList.toggle("scene-off", !c.scene_motion);
    card.classList.toggle("paused", !this._visible);
    card.classList.add("template-enter");
    card.style.setProperty("--font", c.font);
    for (const key of ["caption", "location", "name"]) {
      card.style.setProperty("--" + key + "-font", c[key + "_font"] || c.font);
      card.style.setProperty("--" + key + "-size", c[key + "_size"] + "px");
    }
    this.shadowRoot.querySelector(".caption").textContent = c.caption;
    if (c.caption.length * (c.caption_size * 0.65 + 4) > 300) {
      this.shadowRoot.querySelector(".caption").setAttribute("textLength", 300);
      this.shadowRoot
        .querySelector(".caption")
        .setAttribute("lengthAdjust", "spacingAndGlyphs");
    }
    this.shadowRoot.querySelector(".caption").style.display = c.show_branding
      ? ""
      : "none";
    card.style.setProperty("--fade", c.background_transition + "ms");
    card.classList.toggle("minimal", c.detail === "minimal");
    card.classList.toggle("still", !!c.reduced_motion);
    card.classList.toggle("gears-off", !c.gears);
    if (c.transparent) card.style.background = "transparent";
    this.shadowRoot.querySelector(".frame").style.maxWidth = c.size + "px";
    this.shadowRoot
      .querySelector("svg")
      .setAttribute(
        "viewBox",
        c.aspect_ratio >= 1
          ? `${300 - 300 * c.aspect_ratio} 0 ${600 * c.aspect_ratio} 600`
          : `0 ${300 - 300 / c.aspect_ratio} 600 ${600 / c.aspect_ratio}`,
      );
    this.shadowRoot.querySelector(".title").textContent = c.title;
    for (const kind of ["title", "caption"]) {
      const label = this.shadowRoot.querySelector("." + kind),
        pos = textPosition(c, kind);
      label.setAttribute("x", pos.x);
      label.setAttribute("y", pos.y);
      label.style.fontFamily = c[kind + "_font"];
      label.style.fontSize = c[kind + "_size"] + "px";
      label.style.fill =
        c[kind + "_color"] ||
        (c.artwork === "castle" ? "#f4dfb1" : "var(--ink)");
      label.style.opacity = c[kind + "_opacity"];
      label.style.display = c.show_branding ? "" : "none";
    }
    this._renderBezel();
    this._setupTemplates();
    this._renderEffects();
    this.shadowRoot
      .querySelector(".center-image")
      .setAttribute("href", c.center_image || "");
    const dx = 6 * c.pivot_x - 300,
      dy = 6 * c.pivot_y - 300;
    this.shadowRoot
      .querySelector(".hands")
      .setAttribute("transform", `translate(${dx} ${dy})`);
    this.shadowRoot.querySelectorAll(".hub-outer,.hub-inner").forEach((e) => {
      e.setAttribute("cx", 300 + dx);
      e.setAttribute("cy", 300 + dy);
    });
    if (c.face_image) {
      const token = ++this._faceToken;
      this._status("loading", "Loading clock face…");
      preloadImage(c.face_image)
        .then(() => {
          if (token !== this._faceToken) return;
          const image = this.shadowRoot.querySelector(".face-image");
          image.setAttribute("href", c.face_image);
          image.style.display = "";
          this.shadowRoot.querySelector(".locations").style.display =
            c.show_location_labels ? "" : "none";
          this._status("ready");
        })
        .catch(() => {
          if (token === this._faceToken)
            this._status(
              "error",
              "Face image could not load. Showing the bundled face.",
            );
        });
    }
    const locations = this.shadowRoot.querySelector(".locations");
    locations.style.display = c.face_image
      ? ""
      : c.show_location_labels
        ? ""
        : "none";
    if (!c.members.length) {
      const empty = this.shadowRoot.querySelector(".empty");
      empty.hidden = false;
      empty.textContent =
        "Open the visual editor to add your household and choose your clock.";
    }
    this.shadowRoot.querySelector(".fullscreen").onclick = async () => {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
        return;
      }
      if (card.classList.contains("expanded")) {
        card.classList.remove("expanded");
        this._syncVisibility();
        return;
      }
      if (card.requestFullscreen) {
        try {
          await card.requestFullscreen();
          return;
        } catch (e) {
          /* In-page expansion works where native fullscreen is unavailable. */
        }
      }
      card.classList.add("expanded");
      this._syncVisibility();
    };
    card.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        card.classList.remove("expanded");
        this._syncVisibility();
      }
    });
    if (this._observer) {
      this._observer.disconnect();
      this._observer.observe(card);
    }
    this._update();
  }
  _syncVisibility() {
    const card = this.shadowRoot.querySelector("ha-card");
    if (!card) return;
    const expanded =
      Boolean(this.shadowRoot.fullscreenElement) ||
      card.classList.contains("expanded");
    const wasVisible = this._visible;
    this._visible = expanded || this._intersecting !== false;
    card.classList.toggle("paused", !this._visible);
    if (this._visible && !wasVisible) this._update();
  }
  _makeHand(p) {
    const m = p.member,
      c = this._config;
    const g = svg("g", { class: "hand", "data-person": m.id });
    g.style.setProperty(
      "--duration",
      (m.duration == null ? c.duration : m.duration) + "ms",
    );
    const design = handStyle(m, c);
    const legacy =
      design === "legacy-curved" || design === "standalone-pointed";
    const r = handRadius(m, c, p.radius);
    const path = svg("path", {
      d: handPath(design, r),
      fill: materialFill(m.material, m.color),
      "fill-rule": "evenodd",
      stroke: legacy ? "none" : "#382c22",
      "stroke-width": 2,
      class: legacy ? "legacy-hand" : "",
    });
    path.setAttribute(
      "transform",
      `translate(300 0) scale(${m.width} 1) translate(-300 0)`,
    );

    g.appendChild(path);
    const surface = svg("g", {
      class: "hand-surfaces",
      transform: path.getAttribute("transform"),
    });
    surface.innerHTML = surfaceMarkup(handPath(design, r), m, c.effects.hands);
    g.appendChild(surface);
    const head = svg("g", {
      class: "hand-head",
      transform: `translate(300 ${300 - r})`,
    });
    const counter = svg("g", { class: "counter portrait-surface" });
    head.appendChild(counter);
    g.appendChild(head);
    const size = 23 * m.head_size;
    const ry = m.portrait_shape === "circle" ? size : size * 1.3;
    counter.appendChild(
      svg("ellipse", {
        rx: size,
        ry,
        fill: materialFill(m.material, m.color),
        stroke: m.portrait_frame === "none" ? m.color : "#ecd097",
        "stroke-width": m.portrait_frame === "none" ? 0 : 3,
      }),
    );
    if (m.show_portrait && m.portrait) {
      const clipId = "portrait-" + m.id.replace(/[^a-zA-Z0-9_-]/g, "");
      const clip = svg("clipPath", { id: clipId });
      clip.appendChild(svg("ellipse", { rx: size - 3, ry: ry - 3 }));
      counter.appendChild(clip);
      const view = svg("g", { "clip-path": `url(#${clipId})` });
      const image = svg("image", {
        href: safeImage(m.portrait),
        x: -size * m.portrait_zoom + (50 - m.portrait_x) * 0.4,
        y: -ry * m.portrait_zoom + (50 - m.portrait_y) * 0.4,
        width: size * 2 * m.portrait_zoom,
        height: ry * 2 * m.portrait_zoom,
        preserveAspectRatio: "xMidYMid slice",
        transform: `rotate(${m.portrait_rotation})`,
      });
      view.appendChild(image);
      counter.appendChild(view);
    } else
      counter.appendChild(
        svg(
          "text",
          {
            "text-anchor": "middle",
            y: 5,
            fill: m.text_color,
            class: "portrait-initials",
            "font-size": 17,
            "font-family": "Georgia",
          },
          m.show_name && m.name_position !== "tip"
            ? handName(m)
                .split(/\s+/)
                .map((s) => s[0] || "")
                .slice(0, 2)
                .join("")
            : "",
        ),
      );
    const portraitEffects = c.effects.portraits;
    for (const [kind, fill, strength] of [
      [
        "reflection",
        "url(#environment-reflection)",
        portraitEffects.reflection,
      ],
      ["glare", "url(#specular-glare)", portraitEffects.glare],
      ["wear", "url(#wear-marks)", portraitEffects.wear],
      ["patina", "url(#patina-marks)", portraitEffects.patina],
    ])
      counter.appendChild(
        svg("ellipse", {
          class: "portrait-" + kind,
          rx: size,
          ry,
          fill,
          opacity: strength * 0.5,
          "pointer-events": "none",
        }),
      );
    counter.appendChild(
      svg("ellipse", {
        rx: size,
        ry,
        fill: "none",
        stroke: "url(#material-silver)",
        "stroke-width": portraitEffects.bevel * 2,
        opacity: portraitEffects.bevel,
      }),
    );
    if (m.name_position === "tip" && design === "spoon")
      head.style.display = "";
    else if (!m.show_portrait || (legacy && !m.portrait))
      head.style.display = "none";
    let nameGroup = null,
      name = null,
      engravingClipPath = null;
    if (m.show_name && handName(m) && m.name_attachment === "none") {
      nameGroup = svg("g", { class: "along-label" });
      name = svg(
        "text",
        {
          class: "legacy-name engraved",
          fill: m.text_color,
        },
        handName(m),
      );
      name.style.fontSize = c.name_size + "px";
      nameGroup.style.visibility = "hidden";
      nameGroup.appendChild(name);
      const clipId = "engraving-" + m.id.replace(/[^a-zA-Z0-9_-]/g, "");
      const clip = svg("clipPath", {
        id: clipId,
        clipPathUnits: "userSpaceOnUse",
      });
      engravingClipPath =
        m.name_position === "tip" && design === "spoon"
          ? svg("circle", { cx: 300, cy: 300 - r, r: size - 2 })
          : svg("path", {
              d: handPath(design, r),
              transform: path.getAttribute("transform"),
              "clip-rule": "evenodd",
              "fill-rule": "evenodd",
            });
      clip.appendChild(engravingClipPath);
      g.appendChild(clip);
      const lettering = svg("g", {
        class: "hand-lettering",
        "data-name-position": m.name_position,
        "data-name-orientation": m.name_orientation,
        "clip-path": `url(#${clipId})`,
      });
      lettering.appendChild(nameGroup);
      g.appendChild(lettering);
    }
    if (m.name_attachment !== "none") {
      const attachment = svg("g");
      attachment.innerHTML = attachmentMarkup(m, handName(m), r);
      g.appendChild(attachment);
    }
    const metrics = svg("g", { class: "hand-data" });
    counter.appendChild(metrics);
    const metricNodes = m.metrics.map((metric, i) => {
      const placement = metric.placement || "below";
      const text = svg("text", {
        class: "metric",
        x: placement === "beside" ? size + 9 : 0,
        y:
          placement === "above"
            ? -ry - 12 - i * 13
            : placement === "beside"
              ? i * 13
              : ry + 20 + i * 13,
        "text-anchor": placement === "beside" ? "start" : "middle",
      });
      metrics.appendChild(text);
      return text;
    });
    if (m.metrics.length && head.style.display === "none") {
      head.style.display = "";
      [...counter.children]
        .filter((e) => e !== metrics)
        .forEach((e) => (e.style.display = "none"));
    }
    const title = svg("title", {}, "");
    g.appendChild(title);
    this.shadowRoot.querySelector(".hands").appendChild(g);
    this._hands.set(m.id, {
      g,
      counter,
      title,
      path,
      surface,
      head,
      r,
      design,
      nameGroup,
      name,
      engravingClipPath,
      member: m,
      bowlRadius:
        m.name_position === "tip" && design === "spoon" ? size - 2 : 0,
      fitPending: !!name,
      metricNodes,
    });
    const hand = this._hands.get(m.id);
    this._fitHandName(hand);
    return hand;
  }
  _update() {
    if (!this._config || !this.shadowRoot.querySelector("svg")) return;
    const c = this._config;
    const states = c.demo ? demoStates() : (this._hass || {}).states || {};
    const runtime = runtimeConfig(c, states);
    const locationKey = JSON.stringify([
      runtime.locations.map((l) => ({ ...l, text: locationName(l, states) })),
      c.location_panels,
      c.artwork,
      c.face_image,
    ]);
    if (locationKey !== this._locationKey) {
      this._locationKey = locationKey;
      const group = this.shadowRoot.querySelector(".locations");
      group.textContent = "";
      if (panelsEnabled(c)) {
        group.innerHTML = panelMarkup(c, runtime.locations, states);
        fitPanelLabels(group);
        ensureFonts().then(() => {
          if (group.isConnected) fitPanelLabels(group);
        });
      } else
        runtime.locations.forEach((l) => {
          const pos = labelPosition(l);
          const label = svg(
            "text",
            {
              x: pos.x,
              y: pos.y,
              class: "label",
              "data-location": l.id,
              "text-anchor": "middle",
              "dominant-baseline": "middle",
              opacity: l.opacity,
              transform: `rotate(${l.rotation || 0} ${pos.x} ${pos.y})`,
            },
            locationName(l, states),
          );
          if (l.color) label.style.fill = l.color;
          if (l.font) label.style.fontFamily = l.font;
          if (l.size) label.style.fontSize = l.size + "px";
          group.appendChild(label);
        });
    }
    const kind = weatherFor(c, states),
      night =
        c.period_override === "night" ||
        (c.period_override === "auto" &&
          states[c.sun_entity]?.state === "below_horizon"),
      wind = windReading(c, states),
      weatherKey =
        kind +
        "|" +
        c.weather_intensity +
        "|" +
        night +
        "|" +
        JSON.stringify(wind);
    const weather = this.shadowRoot.querySelector(".weather");
    weather.classList.toggle("still", !c.weather_motion);
    weather.setAttribute(
      "clip-path",
      c.artwork === "castle" ? "url(#castle-opening)" : "url(#dial-clip)",
    );
    if (weatherKey !== this._weatherKey) {
      weather.innerHTML = weatherMarkup(kind, c.weather_intensity, night, {
        ...wind,
        opening:
          c.artwork === "castle"
            ? { x: 300, y: 282, r: c.location_panels.inner_radius }
            : { x: 300, y: 300, r: 266 },
      });
      weather.setAttribute("data-weather", kind);
      this._weatherKey = weatherKey;
    }
    const clockSVG = this.shadowRoot.querySelector("svg");
    // Frost belongs to the glass over the central scene opening.
    // Other weather belongs to the environment below labels and hands.
    if (kind === "ice") clockSVG.appendChild(weather);
    else clockSVG.insertBefore(weather, clockSVG.querySelector(".locations"));
    const background = backgroundFor(c, states);
    const colors = skies[background] || skies.day;
    const stops = this.shadowRoot.querySelectorAll("#sky stop");
    stops[0].setAttribute("stop-color", colors[0]);
    stops[1].setAttribute("stop-color", colors[1]);
    this.shadowRoot.querySelector(".scenery").style.display =
      c.theme === "living-magical" ? "" : "none";
    this.shadowRoot.querySelector("svg").style.filter =
      `brightness(${c.brightness})`;
    if (c.artwork === "castle" && !c.face_image) {
      const scene = sceneFor(
        c,
        states,
        new Date(),
        (this._hass || {}).config || {},
        this._solarHistory,
      );
      clearTimeout(this._sceneBoundaryTimer);
      const now = Date.now();
      const edges = this._solarHistory
        .flatMap((event) => [event.time - 1800000, event.time + 1800000 + 1])
        .filter((time) => time > now);
      const next = Math.min(...edges);
      if (Number.isFinite(next) && next - now < 60000)
        this._sceneBoundaryTimer = setTimeout(
          () => this._update(),
          Math.max(5, next - now),
        );
      this._updateCastle(scene);
    }
    const imageURL = safeImage((c.background_images || {})[background]);
    if (imageURL !== this._imageRequest) {
      this._imageRequest = imageURL;
      const token = ++this._imageToken;
      if (imageURL) this._status("loading", "Loading background…");
      (imageURL ? preloadImage(imageURL) : Promise.resolve())
        .then(() => {
          if (token !== this._imageToken) return;
          const layers = this.shadowRoot.querySelectorAll(".background-image");
          layers[1].setAttribute("href", this._imageURL || "");
          layers[1].style.opacity = this._imageURL ? c.background_opacity : 0;
          layers[0].setAttribute("href", imageURL);
          layers[0].style.opacity = imageURL ? c.background_opacity : 0;
          requestAnimationFrame(() => {
            if (token === this._imageToken) layers[1].style.opacity = 0;
          });
          this._imageURL = imageURL;
          if (imageURL) this._status("ready");
        })
        .catch(() => {
          if (token === this._imageToken)
            this._status(
              "error",
              "Background could not load. Keeping the previous image.",
            );
        });
    }
    this._updateBezel();
    this._updateAstronomical();
    let changedLegacy = false,
      maxDuration = 0;
    positions(c, states).forEach((p) => {
      const hand = this._hands.get(p.member.id) || this._makeHand(p);
      const r = handRadius(p.member, c, p.radius);
      if (r !== hand.r) {
        hand.head.setAttribute("transform", `translate(300 ${300 - r})`);
        hand.path.setAttribute("d", handPath(hand.design, r));
        hand.surface.innerHTML = surfaceMarkup(
          handPath(hand.design, r),
          p.member,
          c.effects.hands,
        );
        hand.r = r;
        if (hand.engravingClipPath) {
          if (hand.bowlRadius)
            hand.engravingClipPath.setAttribute("cy", 300 - r);
          else
            hand.engravingClipPath.setAttribute("d", handPath(hand.design, r));
        }
        hand.fitPending = !!hand.name;
      }
      hand.artworkAngle = p.angle;
      if (hand.fitPending) this._fitHandName(hand);
      const target = p.angle + 90;
      const prev = this._angles.get(p.member.id);
      const angle =
        prev === undefined
          ? target
          : prev + ((((target - prev + 540) % 360) + 360) % 360) - 180;
      if (hand.nameGroup) {
        if (prev !== angle) {
          changedLegacy = true;
          maxDuration = Math.max(
            maxDuration,
            p.member.duration == null ? c.duration : p.member.duration,
          );
        }
        hand.nameGroup.setAttribute(
          "transform",
          `translate(${hand.engraving?.x ?? 300} ${hand.engraving?.y ?? 300 - r * 0.52}) rotate(${letteringRotation(hand.member, p.angle)})`,
        );
      }
      this._angles.set(p.member.id, angle);
      hand.g.style.transform = `rotate(${angle}deg)`;
      hand.counter.style.transform = `rotate(${-angle}deg)`;
      hand.metricNodes.forEach(
        (node, i) =>
          (node.textContent = metricText(
            p.member.metrics[i],
            states,
            p.member.entity,
          )),
      );
      hand.title.textContent =
        (p.member.editor_label || p.member.name || "Hand") +
        ": " +
        (p.location ? locationName(p.location, states) : "Unknown");
    });
    if (changedLegacy) this._trackLegacyLabels(maxDuration);
  }
  _updateCastle(scene) {
    const c = this._config;
    const weather = weatherFor(
      c,
      c.demo ? demoStates() : this._hass?.states || {},
    );
    const source = safeImage(
      (c.background_images || {})[scene.key + "-" + weather] ||
        (c.background_images || {})[scene.key],
    );
    const request = scene.key + "|" + source;
    if (this._sceneRequest === request) {
      this._updateWorld(scene, source, weather);
      return;
    }
    this._sceneRequest = request;
    const token = ++this._sceneToken;
    this._status("loading", "Loading sharp castle scene…");
    Promise.all([
      preloadArtwork(scene),
      source ? preloadImage(source) : Promise.resolve(),
    ])
      .then(() => {
        if (token !== this._sceneToken || this._config.artwork !== "castle")
          return;
        const parent = this.shadowRoot.querySelector(".castle-artwork");
        const layers = parent.querySelectorAll(".scene-layer");
        const next = this._sceneLoaded
          ? 1 - this._activeScene
          : this._activeScene;
        const layer = layers[next];
        layer.style.transition = "none";
        layer.style.opacity = 0;
        while (layer.firstChild) layer.removeChild(layer.firstChild);
        if (source)
          layer.appendChild(
            svg("image", {
              href: source,
              x: 108,
              y: 90,
              width: 384,
              height: 384,
              preserveAspectRatio: "xMidYMid slice",
            }),
          );
        else layer.innerHTML = atlasMarkup(scene);
        const frame = parent.querySelector(".castle-frame");
        if (!frame.firstChild)
          frame.innerHTML = castleFrame(c.location_panels.inner_radius);
        this._updateWorld(scene, source, weather);
        parent.style.display = "";
        parent.setAttribute("data-scene", scene.key);
        this.shadowRoot.querySelector(".face").style.visibility = "hidden";
        this.shadowRoot.querySelector(".locations").style.display =
          c.show_location_labels ? "" : "none";
        parent.querySelector(".castle-scenes").style.filter =
          "url(#effect-face)";
        layer.getBoundingClientRect();
        layer.style.transition = "";
        layer.style.opacity = 1;
        layers[1 - next].style.opacity = 0;
        this._activeScene = next;
        this._sceneLoaded = true;
        this._sceneError = null;
        this._status("ready");
      })
      .catch(() => {
        if (token === this._sceneToken) {
          this._sceneError =
            "Background failed to load; keeping the previous scene.";
          this._status("error", this._sceneError);
        }
      });
  }
  _updateWorld(scene, source, weather) {
    const c = this._config,
      states = c.demo ? demoStates() : this._hass?.states || {},
      reading = moonReading(c.world, states);
    const key = JSON.stringify([
      c.world,
      scene.key,
      source,
      weather,
      reading.visible,
      reading.phase == null ? null : Number(reading.phase.toFixed(3)),
      reading.source,
    ]);
    if (key === this._worldKey) return;
    this._worldKey = key;
    const target = this.shadowRoot.querySelector(".scene-animation");
    if (target) {
      const snapshot = target.firstChild
        ? captureWorldAnimations(target)
        : this._worldAnimationState;
      if (this._worldPainter) this._worldElapsed = this._worldPainter.stop();
      target.innerHTML = worldMarkup(
        c,
        scene,
        states,
        weather,
        Boolean(source),
        reading,
      );
      this._worldPainter = startWorldPainter(target, c, scene, {
        time: this._worldElapsed || 0,
        weather,
        meteorSeed: (this._worldMeteorSeed ??= Math.floor(
          Math.random() * 4294967296,
        )),
        paused: () =>
          this._reduced() ||
          !c.scene_motion ||
          !this._visible ||
          document.hidden,
      });
      requestAnimationFrame(() => {
        if (this.isConnected) restoreWorldAnimations(target, snapshot);
      });
    }
  }
  previewWorldEncounter(id) {
    if (this._reduced() || !this._config.scene_motion) return false;
    const node = [...this.shadowRoot.querySelectorAll(".world-object")].find(
      (e) => e.dataset.worldId === id,
    );
    if (!node) return false;
    const target = node.querySelector(".world-encounter"),
      animations = target.getAnimations(),
      svgRoot = this.shadowRoot.querySelector("svg"),
      mask = this.shadowRoot.querySelector("#world-flight-sky path"),
      object = this._config.world.objects.find((o) => o.id === id);
    for (const phase of [0.34, 0.18, 0.42, 0.1, 0.48]) {
      for (const animation of animations) {
        const timing = animation.effect.getTiming(),
          duration = timing.duration;
        animation.currentTime =
          (((duration * phase + timing.delay) % duration) + duration) %
          duration;
        animation.play();
      }
      const box = target.getBBox(),
        screen = target.getScreenCTM();
      if (!screen) continue;
      const point = new DOMPoint(box.x + box.width / 2, box.y + box.height / 2)
        .matrixTransform(screen)
        .matrixTransform(svgRoot.getScreenCTM().inverse());
      if (
        Number(getComputedStyle(target).opacity) > 0.5 &&
        Math.hypot(point.x - 300, point.y - 282) <
          this._config.location_panels.inner_radius - 4 &&
        (!object.behind_castle || mask.isPointInFill(point))
      )
        return true;
    }
    return false;
  }

  _status(status, message = "") {
    const target = this.shadowRoot.querySelector(".image-status");
    if (target) {
      target.hidden = status === "ready";
      target.textContent = message;
      if (status === "error") {
        const retry = document.createElement("button");
        retry.type = "button";
        retry.textContent = "Retry images";
        retry.style.marginLeft = "8px";
        retry.onclick = () => this._render();
        target.appendChild(retry);
      }
    }
    this.dispatchEvent(
      new CustomEvent("clock-render-status", {
        detail: { status, message },
        bubbles: true,
        composed: true,
      }),
    );
  }
  _renderEffects() {
    const c = this._config,
      root = this.shadowRoot.querySelector("svg");
    for (const target of ["face", "frame"]) {
      const e = c.effects[target],
        group = svg("g", {
          class: target + "-finish",
          "pointer-events": "none",
        });
      const shape =
        target === "face"
          ? {
              cx: 300,
              cy: c.artwork === "castle" ? 282 : 300,
              r: c.artwork === "castle" ? 187 : 267,
            }
          : { cx: 300, cy: 300, r: 280 };
      for (const [key, paint] of [
        ["wear", "url(#wear-marks)"],
        ["patina", "url(#patina-marks)"],
        ["reflection", "url(#glass-glare)"],
        ["glare", "url(#glass-glare)"],
      ]) {
        if (target === "face" && c.artwork === "castle" && key === "patina")
          continue;
        const glassWear =
          target === "face" && c.artwork === "castle" && key === "wear";
        group.appendChild(
          svg("circle", {
            ...shape,
            class: "finish-" + key,
            fill: target === "face" && !glassWear ? paint : "none",
            stroke: target === "frame" || glassWear ? paint : "none",
            "stroke-width": target === "frame" ? 18 : glassWear ? 1 : 0,
            opacity: e[key] * 0.65,
          }),
        );
      }
      group.appendChild(
        svg("circle", {
          ...shape,
          fill: "none",
          stroke: "url(#material-silver)",
          "stroke-width": e.bevel * 2,
          opacity: e.bevel * 0.65,
        }),
      );
      root.insertBefore(group, root.querySelector(".locations"));
    }
  }
  _renderBezel() {
    const c = this._config,
      b = c.bezel,
      root = this.shadowRoot.querySelector("svg");
    if (!b.enabled) return;
    const group = svg("g", { class: "bezel" }),
      radius = 300 + b.width / 2 + 4;
    group.appendChild(
      svg("circle", {
        cx: 300,
        cy: 300,
        r: radius,
        fill: "none",
        stroke: materialFill(b.material, b.color),
        "stroke-width": b.width,
      }),
    );
    group.appendChild(
      svg("circle", {
        cx: 300,
        cy: 300,
        r: radius + b.width / 2,
        fill: "none",
        stroke: "#f5d99c",
        "stroke-width": 1.5,
        opacity: c.effects.bezel.bevel,
      }),
    );
    if (b.material === "wood") {
      const outer = radius + b.width / 2,
        inner = radius - b.width / 2;
      const defs = svg("defs");
      const gradient = svg("radialGradient", {
        id: "wood-bezel-profile",
        gradientUnits: "userSpaceOnUse",
        cx: 300,
        cy: 300,
        r: outer,
      });
      for (const [offset, color, opacity] of [
        [inner / outer, "#170c05", 0.58],
        [(inner + 3) / outer, "#f5d7a7", 0.2],
        [(inner + b.width * 0.45) / outer, "#fff", 0],
        [(outer - 3) / outer, "#ffe4ba", 0.24],
        [1, "#1a0d04", 0.55],
      ])
        gradient.appendChild(
          svg("stop", { offset, "stop-color": color, "stop-opacity": opacity }),
        );
      defs.appendChild(gradient);
      group.appendChild(defs);
      group.appendChild(
        svg("circle", {
          cx: 300,
          cy: 300,
          r: radius,
          fill: "none",
          stroke: "url(#wood-bezel-profile)",
          "stroke-width": b.width,
        }),
      );
    }
    const bezelOuter = radius + b.width / 2;
    const craftedBezel = svg("image", {
      class: "crafted-bezel",
      x: 300 - bezelOuter,
      y: 300 - bezelOuter,
      width: bezelOuter * 2,
      height: bezelOuter * 2,
      "pointer-events": "none",
    });
    group.appendChild(craftedBezel);
    this._bezelArtReady = renderBezelArtwork(
      craftedBezel,
      b.material,
      b.width,
      radius,
    ).catch(() => {});
    b.items.forEach((item, i) => {
      const arc = bezelArc(item, b.items, radius, b.width);
      const id = "bezel-reading-" + i;
      const defs = svg("defs");
      defs.appendChild(svg("path", { id, d: arc.path }));
      group.appendChild(defs);
      const text = svg("text", {
        class: "bezel-value",
        "data-readout": item.id,
        "data-arc-length": arc.length,
        "data-max-size": arc.size,
        "text-anchor": "middle",
        fill: item.color,
        opacity: item.opacity,
      });
      text.style.fontFamily = item.font;
      text.style.fontSize = arc.size + "px";
      text.appendChild(svg("textPath", { href: "#" + id, startOffset: "50%" }));
      group.appendChild(text);
    });
    for (const [key, paint] of [
      ["wear", "url(#wear-marks)"],
      ["patina", "url(#patina-marks)"],
      ["reflection", "url(#glass-glare)"],
      ["glare", "url(#glass-glare)"],
    ])
      group.insertBefore(
        svg("circle", {
          cx: 300,
          cy: 300,
          r: radius,
          fill: "none",
          stroke: paint,
          "stroke-width": b.width,
          opacity: c.effects.bezel[key] * 0.7,
        }),
        group.firstChild.nextSibling,
      );
    root.insertBefore(group, root.querySelector(".face"));
    const margin = b.width + 8;
    const ratio = c.aspect_ratio;
    root.setAttribute(
      "viewBox",
      ratio >= 1
        ? `${300 - (300 + margin) * ratio} ${-margin} ${(600 + margin * 2) * ratio} ${600 + margin * 2}`
        : `${-margin} ${300 - (300 + margin) / ratio} ${600 + margin * 2} ${(600 + margin * 2) / ratio}`,
    );
  }
  _updateAstronomical() {
    const c = this._config;
    if (c?.theme !== "astronomical" || c.artwork === "castle" || c.face_image)
      return;
    updateAstronomical(
      this.shadowRoot,
      c,
      c.demo ? demoStates() : this._hass?.states || {},
      new Date(),
      this._hass?.config?.time_zone,
    );
  }
  _updateBezel() {
    const c = this._config;
    if (!c?.bezel.enabled) return;
    const states = c.demo ? demoStates() : this._hass?.states || {},
      now = new Date();
    const labels = this.shadowRoot.querySelectorAll(".bezel-value");
    c.bezel.items.forEach((item, i) => {
      if (labels[i]) {
        const path = labels[i].querySelector("textPath");
        path.textContent = bezelText(
          item,
          states,
          now,
          this._hass?.locale?.language,
          this._hass?.config?.time_zone,
        );
        labels[i].style.fontSize = labels[i].dataset.maxSize + "px";
        const measured = labels[i].getComputedTextLength();
        if (measured > Number(labels[i].dataset.arcLength))
          labels[i].style.fontSize =
            Math.max(
              1,
              (Number(labels[i].dataset.maxSize) *
                Number(labels[i].dataset.arcLength)) /
                measured,
            ) + "px";
      }
    });
  }
  _reduced() {
    return (
      this._config?.reduced_motion ||
      window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    );
  }
  _templateStorageKey() {
    return (
      "mfc-face-" +
      (this._baseConfig.instance_id ||
        this._baseConfig.title +
          "-" +
          this._baseConfig.members.map((m) => m.id).join("-"))
    );
  }
  _switchTemplate(step) {
    const base = this._baseConfig,
      list = base.carousel.templates;
    if (!base.carousel.enabled || list.length < 2) return;
    this._templateIndex =
      (this._templateIndex + step + list.length) % list.length;
    this._lastSwitch = Date.now();
    if (base.carousel.remember)
      try {
        localStorage.setItem(
          this._templateStorageKey(),
          String(this._templateIndex),
        );
      } catch {}
    this._config = normalize(presentationFor(base, this._templateIndex));
    this._render();
    this.dispatchEvent(
      new CustomEvent("clock-template-changed", {
        detail: {
          index: this._templateIndex,
          label: list[this._templateIndex].label,
        },
        bubbles: true,
        composed: true,
      }),
    );
  }
  _setupTemplates() {
    const nav = this.shadowRoot.querySelector(".template-navigation"),
      list = this._baseConfig.carousel.templates,
      enabled = this._baseConfig.carousel.enabled && list.length > 1;
    nav.hidden = !enabled;
    if (!enabled) return;
    this._lastSwitch = Date.now();
    nav.querySelector(".template-name").textContent =
      list[this._templateIndex].label;
    nav.querySelector(".template-previous").onclick = () =>
      this._switchTemplate(-1);
    nav.querySelector(".template-next").onclick = () => this._switchTemplate(1);
    const frame = this.shadowRoot.querySelector(".frame"),
      card = this.shadowRoot.querySelector("ha-card");
    card.tabIndex = 0;
    card.onmouseenter = () => (this._hover = true);
    card.onmouseleave = () => (this._hover = false);
    card.onfocusin = () => (this._hasFocus = true);
    card.onfocusout = () => (this._hasFocus = false);
    card.addEventListener("keydown", (e) => {
      if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
        e.preventDefault();
        this._switchTemplate(e.key === "ArrowRight" ? 1 : -1);
      }
    });
    frame.onpointerdown = (e) => {
      if (e.isPrimary && e.button === 0)
        this._swipe = { x: e.clientX, y: e.clientY };
    };
    frame.onpointercancel = () => (this._swipe = null);
    frame.onpointerup = (e) => {
      if (!this._swipe) return;
      const dx = e.clientX - this._swipe.x,
        dy = e.clientY - this._swipe.y;
      this._swipe = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.4)
        this._switchTemplate(dx < 0 ? 1 : -1);
    };
  }
  _fitHandName(hand) {
    if (!hand.name || !this.isConnected) return;
    const text = hand.name,
      requested = this._config.name_size;
    text.setAttribute("x", "0");
    text.setAttribute("y", "0");
    text.style.fontSize = requested + "px";
    const box = text.getBBox();
    if (!box.width || !box.height) return;
    const point = this.shadowRoot.querySelector("svg").createSVGPoint();
    const contains = (x, y) => {
      if (hand.bowlRadius)
        return Math.hypot(x - 300, y - (300 - hand.r)) <= hand.bowlRadius;
      point.x = 300 + (x - 300) / hand.member.width;
      point.y = y;
      return hand.path.isPointInFill(point);
    };
    const fit = fitEngraving({
      length: hand.r,
      width: hand.member.width,
      box,
      size: requested,
      contains,
      position: hand.member.name_position,
      rotation: letteringRotation(hand.member, -90),
      bowlRadius: hand.bowlRadius,
      measure: (fontSize) => {
        text.style.fontSize = fontSize + "px";
        return text.getBBox();
      },
    });
    hand.fitPending = false;
    hand.engraving = fit;
    hand.nameGroup.style.visibility = fit ? "visible" : "hidden";
    hand.nameGroup.dataset.fit = fit ? "inside" : "too-narrow";
    if (!fit) return;
    text.style.fontSize = fit.fontSize + "px";
    const fitted = text.getBBox();
    text.setAttribute("x", -(fitted.x + fitted.width / 2));
    text.setAttribute("y", -(fitted.y + fitted.height / 2));
    hand.nameGroup.setAttribute(
      "transform",
      `translate(${fit.x} ${fit.y}) rotate(${letteringRotation(hand.member, hand.artworkAngle ?? -90)})`,
    );
  }
  _trackLegacyLabels(duration) {
    this._labelUntil = performance.now() + duration;
    if (this._labelFrame) cancelAnimationFrame(this._labelFrame);
    const tick = () => {
      this._hands.forEach((hand) => {
        if (!hand.nameGroup) return;
        const matrix = getComputedStyle(hand.g).transform;
        const values = matrix.match(/^matrix\(([^)]+)\)$/);
        if (!values) return;
        const parts = values[1].split(",").map(Number);
        const rotation = (Math.atan2(parts[1], parts[0]) * 180) / Math.PI;
        hand.nameGroup.setAttribute(
          "transform",
          `translate(${hand.engraving?.x ?? 300} ${hand.engraving?.y ?? 300 - hand.r * 0.52}) rotate(${letteringRotation(hand.member, rotation - 90)})`,
        );
      });
      if (this.isConnected && performance.now() < this._labelUntil)
        this._labelFrame = requestAnimationFrame(tick);
      else this._labelFrame = null;
    };
    this._labelFrame = requestAnimationFrame(tick);
  }
}
if (!customElements.get("magical-family-clock-card"))
  customElements.define("magical-family-clock-card", MagicalFamilyClock);
window.customCards = window.customCards || [];
if (!window.customCards.some((c) => c.type === "magical-family-clock-card"))
  window.customCards.push({
    type: "magical-family-clock-card",
    name: "Magical Family Clock (HACS)",
    description: "An enchanted family whereabouts clock with a visual editor.",
    preview: true,
  });
