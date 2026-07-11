// lib/downscaleImage.ts
// Takes a File from an <input type="file">, returns a small JPEG data URL.
// Caps the longest side at `maxSize` px and re-encodes at quality 0.7,
// which keeps covers around 30-50KB — safe for localStorage and fast for the API.

export function downscaleImage(file: File, maxSize = 400): Promise<string> {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = () => {
      try {
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Could not get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Always output JPEG regardless of input (HEIC/PNG/etc.)
        // so downstream code can hardcode mime_type: "image/jpeg".
        resolve(canvas.toDataURL("image/jpeg", 0.7));
      } catch (err) {
        reject(err);
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Failed to load image"));
    };

    img.src = objectUrl;
  });
}
