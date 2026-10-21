export async function uploadImage(file, portrait = false) {
  if (!file || !["image/png", "image/jpeg", "image/webp"].includes(file.type))
    throw Error(
      "Choose a PNG, JPEG, or WebP image. SVG and animated formats are not supported.",
    );
  if (file.size > 10000000) throw Error("Choose an image smaller than 10 MB.");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(Error("This image could not be decoded."));
      img.src = url;
    });
    if (image.naturalWidth * image.naturalHeight > 40000000)
      throw Error("Choose an image with fewer than 40 million pixels.");
    const max = portrait ? 512 : 1600;
    const scale = Math.min(
      1,
      max / Math.max(image.naturalWidth, image.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    canvas.getContext("2d").drawImage(image, 0, 0, canvas.width, canvas.height);
    const data = canvas.toDataURL("image/webp", 0.88);
    if (data.length > 2000000)
      throw Error(
        "The optimized image is too large. Choose a simpler or smaller image.",
      );
    return data;
  } finally {
    URL.revokeObjectURL(url);
  }
}
