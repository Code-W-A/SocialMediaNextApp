/*
  utils/simpleImageRepair.js
  Funcții ultra-ușoare pentru a verifica dacă browserul poate decoda imaginea
  și, dacă e un JPEG problematic (corupt / CMYK), încercăm să-l reparăm rapid
  cu biblioteca jpeg-js și un canvas.
*/

import { decode } from "jpeg-js";

/**
 * Testează dacă browserul poate decoda imaginea doar încărcând-o într-un <img>.
 * @param {File} file - fişierul de testat
 * @param {number} timeoutMs - timp maxim de aşteptare
 * @returns {Promise<boolean>} - true dacă se decodifică, altfel eroare
 */
export const canDecodeImage = (file, timeoutMs = 4500) => {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();

    const cleanup = () => {
      URL.revokeObjectURL(url);
      img.onload = img.onerror = null;
    };

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error("Decode timeout"));
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      cleanup();
      // Dacă are dimensiuni >0, considerăm că s-a decodat
      if (img.naturalWidth && img.naturalHeight) {
        resolve(true);
      } else {
        reject(new Error("Zero dimensions"));
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      cleanup();
      reject(new Error("Browser decode failed"));
    };

    img.src = url;
  });
};

/**
 * Încearcă să repare un JPEG pe care browserul nu-l poate decoda
 * (CMYK, marker lipsă, EXIF corupt). Decodăm cu jpeg-js şi re-salvăm RGB.
 * @param {File} file - JPEG de reparat
 * @returns {Promise<File>} - fişier JPEG RGB reparat
 */
export const tryRepairJpeg = async (file) => {
  if (!file) throw new Error("No file provided");
  if (!/\.jpe?g$/i.test(file.name)) throw new Error("Only JPEG repair supported");

  // 1. Decodare cu jpeg-js (ignoră EXIF/CMYK)
  const raw = decode(new Uint8Array(await file.arrayBuffer()), {
    useTArray: true,
    formatAsRGBA: true,
  });

  // 2. Desenează pe canvas
  const canvas = document.createElement("canvas");
  canvas.width = raw.width;
  canvas.height = raw.height;
  const ctx = canvas.getContext("2d");
  const imgData = new ImageData(new Uint8ClampedArray(raw.data), raw.width, raw.height);
  ctx.putImageData(imgData, 0, 0);

  // 3. Re-exportă JPEG curat
  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  if (!blob) throw new Error("Canvas toBlob failed");

  return new File([blob], file.name.replace(/\.jpe?g$/i, "_repaired.jpg"), {
    type: "image/jpeg",
    lastModified: Date.now(),
  });
}; 