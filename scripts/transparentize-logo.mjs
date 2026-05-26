#!/usr/bin/env node

/**
 * Strip the white background out of public/logo.png so the calendar
 * outline sits on a transparent canvas. Uses a flood-fill from the
 * corners so the WHITE INSIDE the calendar (between the outline and
 * the checkmark) is preserved — only pixels reachable from the image
 * edges via a white-ish region become transparent.
 *
 * Run with: node scripts/transparentize-logo.mjs
 *
 * Overwrites public/logo.png in place after backing up to
 * public/logo.original.png so it's recoverable.
 *
 * @module scripts/transparentize-logo
 */

import sharp from "sharp";
import { existsSync, copyFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const SRC = join(ROOT, "public", "logo.png");
const BACKUP = join(ROOT, "public", "logo.original.png");

if (!existsSync(SRC)) {
  console.error(`✗ Source missing: ${SRC}`);
  process.exit(1);
}

if (!existsSync(BACKUP)) {
  copyFileSync(SRC, BACKUP);
  console.log(`→ backup written: public/logo.original.png`);
}

const img = sharp(BACKUP).ensureAlpha();
const { data, info } = await img
  .raw()
  .toBuffer({ resolveWithObject: true });

const { width, height, channels } = info;
const out = Buffer.from(data);
const visited = new Uint8Array(width * height);

/** Distance from white below which a pixel is "background candidate". */
const WHITE_THRESHOLD = 25;

function isWhiteish(idx) {
  const r = out[idx];
  const g = out[idx + 1];
  const b = out[idx + 2];
  return (
    Math.abs(r - 255) <= WHITE_THRESHOLD &&
    Math.abs(g - 255) <= WHITE_THRESHOLD &&
    Math.abs(b - 255) <= WHITE_THRESHOLD
  );
}

// Make every white-ish pixel transparent — both outside the calendar
// and inside it. This turns the logo into a pure outline + checkmark
// so it reads cleanly on any page background (light or dark). The
// `visited` array is unused in this pass but kept for clarity.
let cleared = 0;
const totalPixels = width * height;
for (let i = 0; i < totalPixels; i++) {
  const pixelIdx = i * channels;
  if (isWhiteish(pixelIdx)) {
    out[pixelIdx + 3] = 0;
    cleared += 1;
  }
}
void visited;

await sharp(out, { raw: { width, height, channels } })
  .png()
  .toFile(SRC);

console.log(`✓ cleared ${cleared} pixels (${((cleared / (width * height)) * 100).toFixed(1)}%) to transparent`);
console.log(`✓ wrote ${SRC}`);
console.log(`\nRun \`npm run sync-logo\` to push the new transparent logo to all favicon / OG / PWA slots.`);
