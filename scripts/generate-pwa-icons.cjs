// Regenerates public/icons/* from assets/icon.png. Run after changing the app icon:
//   npm i --no-save sharp@0.34 && node scripts/generate-pwa-icons.cjs assets/icon.png public/icons
const sharp = require('sharp');
const [src, out] = process.argv.slice(2);
const bg = { r: 0xfa, g: 0xf9, b: 0xf7, alpha: 1 };
(async () => {
  for (const size of [192, 512]) await sharp(src).resize(size, size).png().toFile(`${out}/icon-${size}.png`);
  await sharp(src).resize(180, 180).flatten({ background: bg }).png().toFile(`${out}/apple-touch-icon.png`);
  // Maskable: keep the artwork inside the 80% safe zone.
  const inner = await sharp(src).resize(410, 410).png().toBuffer();
  await sharp({ create: { width: 512, height: 512, channels: 4, background: bg } })
    .composite([{ input: inner, gravity: 'center' }]).png().toFile(`${out}/maskable-512.png`);
  console.log('icons done');
})();
