import { metricText, runtimeConfig } from "./data.js";
import { weatherFor, weatherMarkup, weatherCSS } from "./weather.js";
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
  frameURL,
  atlasMarkup,
  preloadImage,
  preloadArtwork,
} from "./artwork.js";
import {
  handStyle,
  handRadius,
  handPath,
  legacyTextRotation,
} from "./hands.js";
const NS = "http://www.w3.org/2000/svg";
function svg(tag, attrs = {}, text) {
  const e = document.createElementNS(NS, tag);
  Object.keys(attrs).forEach((k) => e.setAttribute(k, String(attrs[k])));
  if (text !== undefined) e.textContent = text;
  return e;
}
const style = `.scene-layer{transition:opacity var(--fade,1500ms)}@media(prefers-reduced-motion:reduce){.scene-layer{transition:none}}.still .scene-layer{transition:none}.legacy-name{font-weight:bold;font-family:var(--font,Georgia,serif);dominant-baseline:middle;text-anchor:middle}.legacy-hand{filter:drop-shadow(3.43px 3.43px 8.57px #0008)}:host{display:block;color:var(--primary-text-color,#eee)}*{box-sizing:border-box}[hidden]{display:none!important}ha-card{display:block;position:relative;overflow:hidden;background:var(--card-background-color,#172325);border-radius:20px}.frame{margin:auto;width:100%;position:relative}svg{display:block;width:100%;height:auto;overflow:visible}.outer{fill:var(--rim);stroke:var(--metal);stroke-width:3}.dial{fill:var(--paper);stroke:var(--metal);stroke-width:2}.ring{fill:none;stroke:var(--metal);stroke-width:1;opacity:.55}.inner{stroke-dasharray:2 7}.ticks,.filigree{fill:none;stroke:var(--metal);stroke-width:1.5}.gears{fill:var(--metal);stroke:var(--metal);opacity:.25}.gear{animation:turn var(--gear-speed,60s) linear infinite;transform-box:fill-box;transform-origin:center}.gears-off .gear,.paused .gear,.still .gear{animation-play-state:paused}.hand{transition:transform var(--duration,1000ms) cubic-bezier(.4,0,.2,1);transform-origin:300px 300px}.counter{transition:transform var(--duration,1000ms) cubic-bezier(.4,0,.2,1)}.label{font:600 17px Georgia,serif;fill:var(--ink);letter-spacing:1px;paint-order:stroke;stroke:var(--paper);stroke-width:3px;stroke-linejoin:round}.name{font:600 13px Georgia,serif;paint-order:stroke;stroke:#152326;stroke-width:3px;stroke-linejoin:round}.minimal .filigree,.minimal .inner{display:none}.label,.name,.caption,.title{font-family:var(--font,Georgia,serif)}#sky stop{transition:stop-color var(--fade,1500ms)}.background-image{transition:opacity var(--fade,1500ms)}.caption{font:12px var(--font,Georgia,serif);letter-spacing:4px;fill:var(--ink);opacity:.7}.title{font:italic 23px var(--font,Georgia,serif);fill:var(--ink)}button{border:1px solid #b69657;background:#182a2ee0;color:#f2dfb6;border-radius:24px;padding:8px 12px;cursor:pointer}.fullscreen{position:absolute;right:12px;bottom:12px}.empty{position:absolute;inset:30% 20%;display:flex;align-items:center;text-align:center;color:var(--ink);font:18px Georgia}.expanded{position:fixed!important;inset:0!important;z-index:10000;border-radius:0;background:#101d23!important;display:grid;place-items:center}.expanded .frame{width:95vw;max-width:95vh;width:min(95vw,95vh)}.still .hand,.still .counter,.still .background-image{transition:none}@keyframes turn{to{transform:rotate(360deg)}}@media(prefers-reduced-motion:reduce){.hand,.counter,.background-image,#sky stop{transition:none}.gear{animation:none}}`;
export class MagicalFamilyClock extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._hands = new Map();
    this._angles = new Map();
    this._solarHistory = [];
    this._sceneToken = 0;
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
    this._config = normalize(config);
    this._render();
  }
  set hass(hass) {
    this._hass = hass;
    this._update();
  }
  connectedCallback() {
    if (!this._config) this.setConfig(defaults());
    if (window.IntersectionObserver) {
      this._observer = new IntersectionObserver((entries) => {
        this.shadowRoot
          .querySelector("ha-card")
          .classList.toggle("paused", !entries[0].isIntersecting);
      });
      this._observer.observe(this);
    }
    this._timer = window.setInterval(() => this._update(), 60000);
    this._update();
  }
  disconnectedCallback() {
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
    this._weatherKey = null;
    this._locationKey = null;
    this.shadowRoot.innerHTML = `<style>${style}${weatherCSS}.engraved{paint-order:stroke;stroke:#170f0970;stroke-width:.6px;filter:drop-shadow(0px 1px .25px #fff5);font-family:var(--name-font);font-size:var(--name-size)}.metric{font:10px system-ui;fill:var(--ink);paint-order:stroke;stroke:var(--paper);stroke-width:2px}.label{font-family:var(--location-font);font-size:var(--location-size)}.caption{font-family:var(--caption-font);font-size:var(--caption-size)}.caption,.title{paint-order:stroke;stroke:var(--paper);stroke-width:2px;stroke-linejoin:round}</style><ha-card><div class="frame"><svg viewBox="0 0 600 600" role="img" aria-label="Family whereabouts clock"><defs>${metalDefs()}<clipPath id="dial-clip"><circle cx="300" cy="300" r="266"/></clipPath><clipPath id="castle-opening"><circle cx="300" cy="282" r="190"/></clipPath><linearGradient id="sky" x2="0" y2="1"><stop/><stop offset="1"/></linearGradient></defs><g class="face">${face(c.theme)}</g><g class="scenery" clip-path="url(#dial-clip)"><circle cx="300" cy="300" r="235" fill="url(#sky)" opacity=".5"/>${landscape()}</g><image class="background-image" x="65" y="65" width="470" height="470" preserveAspectRatio="xMidYMid slice" clip-path="url(#dial-clip)" opacity=".4"/><image class="background-image background-old" x="65" y="65" width="470" height="470" preserveAspectRatio="xMidYMid slice" clip-path="url(#dial-clip)" opacity="0"/><g class="castle-artwork" style="display:none"><g class="castle-scenes" clip-path="url(#castle-opening)"><g class="scene-layer" style="opacity:0"></g><g class="scene-layer" style="opacity:0"></g></g><image class="castle-frame" x="0" y="0" width="600" height="600"/></g><image class="face-image" x="0" y="0" width="600" height="600" preserveAspectRatio="none" style="display:none"/><g class="weather" clip-path="url(#dial-clip)"></g><g class="locations"></g><text class="caption" x="300" y="380" text-anchor="middle">MAGICAL FAMILY CLOCK</text><text class="title" x="300" y="410" text-anchor="middle"></text><image class="center-image" x="255" y="255" width="90" height="90"/><g class="hands"></g><circle class="hub-outer" cx="300" cy="300" r="13" fill="var(--metal)" stroke="var(--rim)" stroke-width="4"/><circle class="hub-inner" cx="300" cy="300" r="4" fill="var(--paper)"/></svg><div class="empty" hidden></div></div><button class="fullscreen" aria-label="Expand clock">⛶ Fullscreen</button></ha-card>`;
    const card = this.shadowRoot.querySelector("ha-card");
    Object.keys(p).forEach((k) => card.style.setProperty("--" + k, p[k]));
    card.style.setProperty("--duration", c.duration + "ms");
    card.style.setProperty("--gear-speed", c.gear_speed + "s");
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
      const loader = new Image();
      this._faceLoad = loader;
      loader.onload = () => {
        if (this._faceLoad !== loader) return;
        const face = this.shadowRoot.querySelector(".face-image");
        face.setAttribute("href", c.face_image);
        face.style.display = "";
        this.shadowRoot.querySelector(".locations").style.display =
          c.show_location_labels ? "" : "none";
        this.shadowRoot
          .querySelectorAll(".caption,.title")
          .forEach((e) => (e.style.display = c.show_branding ? "" : "none"));
      };
      loader.onerror = () => {
        if (this._faceLoad !== loader) return;
        this.shadowRoot.querySelector(".face-image").style.display = "none";
      };
      loader.src = c.face_image;
    }
    const locations = this.shadowRoot.querySelector(".locations");
    c.locations.forEach((l) => {
      const a = (l.angle * Math.PI) / 180;
      const x = 300 + Math.cos(a) * 213,
        y = 300 + Math.sin(a) * 213;
      const label = svg(
        "text",
        {
          x,
          y,
          "text-anchor": "middle",
          "dominant-baseline": "middle",
          class: "label",
        },
        l.name,
      );
      if (l.color) label.style.fill = l.color;
      locations.appendChild(label);
    });
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
    };
    card.addEventListener("keydown", (e) => {
      if (e.key === "Escape") card.classList.remove("expanded");
    });
    this._update();
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
      fill:
        c.theme === "brass-clockwork" || m.material === "brass"
          ? "url(#aged-brass)"
          : m.color,
      stroke: legacy ? "none" : "#382c22",
      "stroke-width": 2,
      class: legacy ? "legacy-hand" : "",
    });
    path.setAttribute(
      "transform",
      `translate(300 0) scale(${m.width} 1) translate(-300 0)`,
    );
    if (c.theme === "brass-clockwork") path.style.filter = "url(#metal-grain)";
    g.appendChild(path);
    const head = svg("g", { transform: `translate(300 ${300 - r})` });
    const counter = svg("g", { class: "counter" });
    head.appendChild(counter);
    g.appendChild(head);
    const size = 23 * m.head_size;
    const ry = m.portrait_shape === "circle" ? size : size * 1.3;
    counter.appendChild(
      svg("ellipse", {
        rx: size,
        ry,
        fill:
          { brass: "#c49a52", copper: "#b87853", silver: "#b5c2c5" }[
            m.material
          ] || m.color,
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
            fill: "#172b2c",
            "font-size": 17,
            "font-family": "Georgia",
          },
          m.name
            .split(/\s+/)
            .map((s) => s[0])
            .slice(0, 2)
            .join(""),
        ),
      );
    if (legacy && (!m.show_portrait || !m.portrait))
      head.style.display = "none";
    let nameGroup = null;
    if (m.show_name) {
      nameGroup = svg("g", { class: "along-label" });
      const name = svg(
        "text",
        {
          class: "legacy-name engraved",
          fill:
            c.theme === "brass-clockwork" && m.text_color === "#fff5dc"
              ? "#3d2915"
              : m.text_color,
        },
        m.nickname || m.name,
      );
      const size = Math.max(
        (12 * 6) / 7,
        Math.min(
          (24 * 6) / 7,
          (r * 0.57) / Math.max(1, (m.nickname || m.name).length * 0.62),
        ),
      );
      name.style.fontSize = Math.min((size * c.name_size) / 13, 26) + "px";
      nameGroup.appendChild(name);
      g.appendChild(nameGroup);
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
      head,
      r,
      design,
      nameGroup,
      metricNodes,
    });
    return this._hands.get(m.id);
  }
  _update() {
    if (!this._config || !this.shadowRoot.querySelector("svg")) return;
    const c = this._config;
    const states = c.demo ? demoStates() : (this._hass || {}).states || {};
    const runtime = runtimeConfig(c, states);
    const locationKey = JSON.stringify(
      runtime.locations.map((l) => [l.id, l.name, l.angle]),
    );
    if (locationKey !== this._locationKey) {
      this._locationKey = locationKey;
      const group = this.shadowRoot.querySelector(".locations");
      group.textContent = "";
      runtime.locations.forEach((l) => {
        const a = (l.angle * Math.PI) / 180;
        const label = svg(
          "text",
          {
            x: 300 + Math.cos(a) * 213,
            y: 300 + Math.sin(a) * 213,
            class: "label",
            "text-anchor": "middle",
          },
          l.name,
        );
        if (l.color) label.style.fill = l.color;
        group.appendChild(label);
      });
    }
    const kind = weatherFor(c, states),
      night =
        c.period_override === "night" ||
        (c.period_override === "auto" &&
          states[c.sun_entity]?.state === "below_horizon"),
      weatherKey = kind + "|" + c.weather_intensity + "|" + night;
    const weather = this.shadowRoot.querySelector(".weather");
    weather.classList.toggle("still", !c.weather_motion);
    weather.setAttribute(
      "clip-path",
      c.artwork === "castle" ? "url(#castle-opening)" : "url(#dial-clip)",
    );
    if (weatherKey !== this._weatherKey) {
      weather.innerHTML = weatherMarkup(kind, c.weather_intensity, night);
      weather.setAttribute("data-weather", kind);
      this._weatherKey = weatherKey;
    }
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
    if (imageURL !== this._imageURL) {
      const layers = this.shadowRoot.querySelectorAll(".background-image");
      layers[1].setAttribute("href", this._imageURL || "");
      layers[1].style.opacity = this._imageURL ? c.background_opacity : 0;
      layers[0].style.opacity = 0;
      layers[0].setAttribute("href", imageURL);
      this._imageURL = imageURL;
      const token = imageURL;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (this._imageURL !== token) return;
          layers[0].style.opacity = imageURL ? c.background_opacity : 0;
          layers[1].style.opacity = 0;
        });
      });
    }
    let changedLegacy = false,
      maxDuration = 0;
    positions(c, states).forEach((p) => {
      const hand = this._hands.get(p.member.id) || this._makeHand(p);
      const r = handRadius(p.member, c, p.radius);
      if (r !== hand.r) {
        hand.head.setAttribute("transform", `translate(300 ${300 - r})`);
        hand.path.setAttribute("d", handPath(hand.design, r));
        hand.r = r;
      }
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
          `translate(300 ${300 - r * (hand.design === "standalone-pointed" ? 139 / 258 : 0.52)}) rotate(${legacyTextRotation(p.angle)})`,
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
        p.member.name + ": " + (p.location ? p.location.name : "Unknown");
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
    if (this._sceneRequest === request) return;
    this._sceneRequest = request;
    const token = ++this._sceneToken;
    Promise.all([
      preloadArtwork(),
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
        parent.querySelector(".castle-frame").setAttribute("href", frameURL);
        parent.style.display = "";
        parent.setAttribute("data-scene", scene.key);
        this.shadowRoot.querySelector(".face").style.visibility = "hidden";
        this.shadowRoot.querySelector(".locations").style.display = "none";
        this.shadowRoot.querySelector(".caption").setAttribute("y", "440");
        this.shadowRoot.querySelector(".title").setAttribute("y", "418");
        this.shadowRoot.querySelectorAll(".caption,.title").forEach((e) => {
          e.style.display = c.show_branding ? "" : "none";
          e.style.fill = "#f3d698";
        });
        const filters = {
          spring: "saturate(1.25) brightness(1.08)",
          summer: "saturate(1.4) brightness(1.14)",
          autumn: "sepia(.22) saturate(1.25)",
          winter: "saturate(.65) brightness(1.12)",
        };
        parent.querySelector(".castle-scenes").style.filter =
          filters[scene.season] || "";
        layer.getBoundingClientRect();
        layer.style.transition = "";
        layer.style.opacity = 1;
        layers[1 - next].style.opacity = 0;
        this._activeScene = next;
        this._sceneLoaded = true;
        this._sceneError = null;
      })
      .catch(() => {
        if (token === this._sceneToken)
          this._sceneError =
            "Background failed to load; keeping the previous scene.";
      });
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
        const fraction =
          hand.design === "standalone-pointed" ? 139 / 258 : 0.52;
        hand.nameGroup.setAttribute(
          "transform",
          `translate(300 ${300 - hand.r * fraction}) rotate(${legacyTextRotation(rotation - 90)})`,
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
