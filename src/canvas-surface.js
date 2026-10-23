// WebKit can composite a canvas in SVG foreignObject outside its SVG clips and
// transforms. Use native SVG images there; keep canvas direct on other engines.
export function needsSVGSurface() {
  return (
    typeof navigator !== "undefined" &&
    /AppleWebKit/.test(navigator.userAgent) &&
    !/(Chrome|Chromium|Edg|OPR)\//.test(navigator.userAgent)
  );
}
export function canvasSurface(kind, cls, grade = "") {
  const style = grade ? ` style="filter:${grade}"` : "";
  return needsSVGSurface()
    ? `<image x="108" y="90" width="384" height="384" class="${cls}" data-world-surface="${kind}" preserveAspectRatio="none"${style}/>`
    : `<foreignObject x="108" y="90" width="384" height="384" class="${cls}"${style}><canvas xmlns="http://www.w3.org/1999/xhtml" class="world-paint" data-world-paint="${kind}" aria-hidden="true"></canvas></foreignObject>`;
}
export function svgSurface(node, canvas) {
  let ended = false,
    pending = false,
    encoding = false,
    current,
    next,
    queued = false,
    displayed = 0;
  let settle;
  const ready = new Promise((resolve) => {
    settle = resolve;
  });
  const release = (url) => {
    if (url) URL.revokeObjectURL(url);
  };
  const finish = (success) => {
    if (!next || ended) return;
    node.removeEventListener("load", loaded);
    node.removeEventListener("error", failed);
    if (success) {
      release(current);
      current = next;
      node.dataset.displayTick = String(++displayed);
    } else {
      release(next);
      if (current) node.setAttribute("href", current);
      else node.removeAttribute("href");
    }
    next = undefined;
    pending = false;
    settle();
    if (queued) {
      queued = false;
      publish();
    }
  };
  const loaded = () => finish(true),
    failed = () => finish(false);
  const publish = () => {
    if (ended) return;
    if (pending) {
      queued = true;
      return;
    }
    pending = encoding = true;
    canvas.toBlob((blob) => {
      encoding = false;
      if (!blob || ended) {
        pending = false;
        if (ended) canvas.width = canvas.height = 0;
        settle();
        return;
      }
      // Let the SVG image decode its own frame once. Pre-decoding the same PNG
      // in a second HTML Image added work and did not prove SVG had displayed it.
      next = URL.createObjectURL(blob);
      node.addEventListener("load", loaded);
      node.addEventListener("error", failed);
      node.setAttribute("href", next);
    }, "image/png");
  };
  return {
    ready,
    publish,
    get busy() {
      return pending;
    },
    stop() {
      ended = true;
      node.removeEventListener("load", loaded);
      node.removeEventListener("error", failed);
      release(current);
      release(next);
      current = next = undefined;
      settle();
      if (!encoding) canvas.width = canvas.height = 0;
    },
  };
}
