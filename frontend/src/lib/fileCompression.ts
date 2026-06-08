"use client";

const DEFAULT_MAX_DIMENSION = 1600;
const DEFAULT_QUALITY = 0.72;

function isCompressibleImage(file: File) {
  return file.type.startsWith("image/") && file.type !== "image/gif";
}

function loadImage(file: File) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read selected image."));
    };
    image.src = url;
  });
}

function getTargetSize(width: number, height: number, maxDimension: number) {
  const largestSide = Math.max(width, height);
  if (largestSide <= maxDimension) return { width, height };

  const scale = maxDimension / largestSide;
  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Image compression failed."));
      },
      "image/jpeg",
      quality,
    );
  });
}

function compressedName(fileName: string) {
  const baseName = fileName.replace(/\.[^.]+$/, "");
  return `${baseName || "compressed-photo"}.jpg`;
}

export async function compressImageFile(file?: File, options?: { maxDimension?: number; quality?: number }) {
  if (!file || !isCompressibleImage(file)) return file;

  try {
    const image = await loadImage(file);
    const { width, height } = getTargetSize(image.naturalWidth, image.naturalHeight, options?.maxDimension ?? DEFAULT_MAX_DIMENSION);
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d");
    if (!context) return file;

    context.drawImage(image, 0, 0, width, height);
    const blob = await canvasToBlob(canvas, options?.quality ?? DEFAULT_QUALITY);

    if (blob.size >= file.size) return file;

    return new File([blob], compressedName(file.name), {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export async function compressImageFiles(files: File[]) {
  return Promise.all(files.map((file) => compressImageFile(file) as Promise<File>));
}
