// Keep one small URL per bundled bitmap instead of copying its base64 bytes
// into every hand, mask, moving part and scene in the DOM. Assets are immutable
// and shared for the document lifetime, including across dashboard cards.
const urls = new Map();
export function sharedImageURL(source) {
  if (
    !source?.startsWith("data:image/") ||
    typeof URL?.createObjectURL !== "function"
  )
    return source;
  if (!urls.has(source)) {
    const comma = source.indexOf(","),
      binary = atob(source.slice(comma + 1)),
      bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    urls.set(
      source,
      URL.createObjectURL(
        new Blob([bytes], { type: source.slice(5, source.indexOf(";")) }),
      ),
    );
  }
  return urls.get(source);
}
export function canvasImageURL(canvas) {
  return new Promise((resolve, reject) =>
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(URL.createObjectURL(blob));
        else reject(Error("Image encoding failed"));
      },
      "image/webp",
      0.96,
    ),
  );
}
