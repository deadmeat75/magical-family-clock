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
    current,
    queued = false;
  let settle;
  const ready = new Promise((resolve) => {
    settle = resolve;
  });
  const publish = () => {
    if (ended) return;
    if (pending) {
      queued = true;
      return;
    }
    pending = true;
    canvas.toBlob(async (blob) => {
      if (!blob || ended) {
        pending = false;
        if (ended) canvas.width = canvas.height = 0;
        settle();
        return;
      }
      const url = URL.createObjectURL(blob),
        image = new Image();
      try {
        image.src = url;
        await image.decode();
        if (ended) {
          URL.revokeObjectURL(url);
          return;
        }
        const previous = current;
        node.setAttribute("href", url);
        current = url;
        if (previous) URL.revokeObjectURL(previous);
      } catch {
        URL.revokeObjectURL(url);
      } finally {
        pending = false;
        if (ended) canvas.width = canvas.height = 0;
        settle();
        if (queued && !ended) {
          queued = false;
          publish();
        }
      }
    }, "image/png");
  };
  return {
    ready,
    publish,
    stop() {
      ended = true;
      if (current) URL.revokeObjectURL(current);
      settle();
      // An in-flight encoder still owns its canvas until its callback returns.
      if (!pending) canvas.width = canvas.height = 0;
    },
  };
}
