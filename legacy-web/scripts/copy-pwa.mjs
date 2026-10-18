// scripts/copy-pwa.mjs
// Copies the Expo web (PWA) build from ../dist-web into public/ so Next.js
// serves it at the site root. Run by `prebuild`; the copied files are
// gitignored (see .gitignore) — the source of truth is the Expo app.

import { cpSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const from = path.resolve(here, "../../dist-web");
const to = path.resolve(here, "../public");

if (!existsSync(path.join(from, "index.html"))) {
  console.error(`copy-pwa: ${from} has no index.html — run \`npm run build:web\` in the app first.`);
  process.exit(1);
}
cpSync(from, to, { recursive: true });
console.log(`copy-pwa: copied ${from} -> ${to}`);
