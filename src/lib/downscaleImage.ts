import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

// Mirrors lib/downscaleImage.ts on the web app: caps the longest side and
// re-encodes as JPEG before the photo ever leaves the device, so the
// request to /api/analyze stays well under Vercel's function body limit
// and the eventual stored cover stays small.
export async function downscaleImage(
  uri: string,
  maxSize = 800,
  quality = 0.6
): Promise<{ uri: string; base64: string }> {
  const context = ImageManipulator.manipulate(uri);
  const rendered = await context.resize({ width: maxSize }).renderAsync();
  const result = await rendered.saveAsync({
    base64: true,
    compress: quality,
    format: SaveFormat.JPEG,
  });

  if (!result.base64) {
    throw new Error('Image manipulation did not return base64 data');
  }

  return { uri: result.uri, base64: result.base64 };
}
