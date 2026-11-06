import type { Area } from "react-easy-crop";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", () => reject(new Error("Failed to load image")));
    image.crossOrigin = "anonymous";
    image.src = src;
  });
}

export async function cropImageToBlob(
  imageSrc: string,
  pixelCrop: Area,
  outputSize: { width: number; height: number },
  mimeType: "image/jpeg" | "image/png" = "image/jpeg",
  quality = 0.92
): Promise<Blob> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = outputSize.width;
  canvas.height = outputSize.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize.width,
    outputSize.height
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Failed to export cropped image"));
          return;
        }
        resolve(blob);
      },
      mimeType,
      quality
    );
  });
}

export async function cropImageToFile(
  imageSrc: string,
  pixelCrop: Area,
  outputSize: { width: number; height: number },
  fileName: string
): Promise<File> {
  const blob = await cropImageToBlob(imageSrc, pixelCrop, outputSize);
  return new File([blob], fileName.replace(/\.\w+$/, "") + ".jpg", {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}
