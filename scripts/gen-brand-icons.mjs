// Generates the favicon / PWA / touch icons from the ACTUAL brand logo
// (public/logo.png — the black calendar-check mark), so the browser tab,
// installed-app icon, and Google's crawled favicon all show the real logo
// instead of a redrawn approximation.
//
// Variants produced:
//   - src/app/icon.png       favicon the crawler/Google sees (black glyph, transparent)
//   - src/app/apple-icon.png iOS touch icon (logo on white so it isn't a black square)
//   - public/icon-light.png  tab favicon in light mode (black glyph)
//   - public/icon-dark.png   tab favicon in dark mode (white glyph — the black one
//                            is invisible on dark browser chrome)
//   - public/pwa-icon-*.png  install + notification icons (logo on white)
//
// Run: node scripts/gen-brand-icons.mjs
import sharp from "sharp";
import { writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PUBLIC = join(ROOT, "public");
const APP = join(ROOT, "src", "app");
const SRC = join(PUBLIC, "logo.png");

// Trim the logo's transparent border and center it in a size×size transparent
// canvas with `pad` fraction of breathing room. Returns a PNG buffer.
async function glyph(size, pad = 0.12) {
  const inner = Math.round(size * (1 - pad));
  const logo = await sharp(SRC)
    .trim()
    .resize(inner, inner, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .toBuffer();
  return sharp({ create: { width: size, height: size, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
    .composite([{ input: logo, gravity: "center" }])
    .png()
    .toBuffer();
}

// White version of a black-on-transparent glyph (invert RGB, keep alpha).
const toWhite = (buf) => sharp(buf).negate({ alpha: false }).png().toBuffer();
// Flatten a transparent glyph onto a solid white background.
const onWhite = (buf) => sharp(buf).flatten({ background: "#ffffff" }).png().toBuffer();

async function write(path, buf, note) {
  await writeFile(path, buf);
  console.log(`wrote ${path.replace(ROOT + "/", "")}${note ? ` (${note})` : ""}`);
}

const favLight = await glyph(512, 0.14);
const pwa192 = await glyph(192, 0.16);
const pwa512 = await glyph(512, 0.16);
const pwaMask192 = await glyph(192, 0.28); // extra padding for the maskable safe zone
const pwaMask512 = await glyph(512, 0.28);

await Promise.all([
  // Crawler / Google favicon + iOS touch icon (Next app-router conventions).
  write(join(APP, "icon.png"), await glyph(192, 0.12), "black glyph, transparent"),
  write(join(APP, "apple-icon.png"), await onWhite(await glyph(180, 0.16)), "logo on white"),
  // Runtime tab-favicon swap targets.
  write(join(PUBLIC, "icon-light.png"), favLight, "black glyph"),
  write(join(PUBLIC, "icon-dark.png"), await toWhite(favLight), "white glyph"),
  // PWA install + push icons (on white so they aren't a black-on-dark square).
  write(join(PUBLIC, "pwa-icon-192.png"), await onWhite(pwa192)),
  write(join(PUBLIC, "pwa-icon-512.png"), await onWhite(pwa512)),
  write(join(PUBLIC, "pwa-icon-maskable-192.png"), await onWhite(pwaMask192), "maskable"),
  write(join(PUBLIC, "pwa-icon-maskable-512.png"), await onWhite(pwaMask512), "maskable"),
]);
console.log("done");
