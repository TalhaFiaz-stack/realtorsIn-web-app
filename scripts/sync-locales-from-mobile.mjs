/**
 * Copies translation bundles from realtorsinMobileApp Strings.js into public/locales/*.json.
 * English uses i18next keys as literals (no en.json). Re-run when mobile strings change.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const webRoot = join(__dirname, "..");
const stringsPath = join(
  webRoot,
  "..",
  "realtorsinMobileApp",
  "src",
  "localization",
  "Strings.js"
);

const LOCALE_EXPORTS = [
  "ar",
  "tr",
  "de",
  "ru",
  "ur",
  "ja",
  "fr",
  "hi",
  "zh",
  "it",
  "fa",
  "es",
  "nl",
  "cs",
  "hu",
];

const outDir = join(webRoot, "public", "locales");
mkdirSync(outDir, { recursive: true });

const mod = await import(pathToFileURL(stringsPath).href);

for (const code of LOCALE_EXPORTS) {
  const bundle = mod[code];
  if (!bundle?.translation) {
    console.warn(`Skip ${code}: missing export`);
    continue;
  }
  const outPath = join(outDir, `${code}.json`);
  writeFileSync(outPath, JSON.stringify(bundle.translation));
  console.log(`Wrote ${code} (${Object.keys(bundle.translation).length} keys)`);
}

console.log("Done.");
