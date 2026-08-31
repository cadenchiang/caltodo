#!/usr/bin/env node
/**
 * Compress oversized landing-page PNGs in public/.
 *
 * Originals are copied to public/originals/<name>.png as a backup before
 * overwriting. Resizes each image to a max width while keeping aspect
 * ratio, and re-encodes as PNG (palette+zlib max compression). Next.js
 * Image will further transcode to WebP/AVIF at request time, so the
 * source only needs to be reasonable, not tiny.
 *
 * Targets (path relative to public/, max output width in pixels):
 *   - app-screenshot-board.png  → 1920 (hero MacBook mockup, ~1024px CSS)
 *   - step-personalize.png      → 1600 (half-column card)
 *   - step-calendar.png         → 1600 (half-column card)
 *   - step-sync.png             → 1600 (full-width card)
 *   - logo.png                  → 512  (rendered at h-12/h-24, ~96px @ 2x)
 *
 * Each step is logged with before/after byte counts so failures are
 * easy to attribute. Errors are thrown — no silent fallback.
 */
import sharp from "sharp";
import { readFile, writeFile, copyFile, stat, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC = resolve(__dirname, "..", "public");
const ORIGINALS = resolve(PUBLIC, "originals");

/** Targets: [filename, max output width in px] */
const TARGETS = [
  ["app-screenshot-board.png", 1920],
  ["step-personalize.png", 1600],
  ["step-calendar.png", 1600],
  ["step-sync.png", 1600],
  ["logo.png", 512],
];

async function exists(p) {
  try {
    await stat(p);
    return true;
  } catch {
    return false;
  }
}

async function compressOne(filename, maxWidth) {
  const src = resolve(PUBLIC, filename);
  const backup = resolve(ORIGINALS, filename);

  if (!(await exists(src))) {
    throw new Error(`Source not found: ${src}`);
  }

  const before = (await stat(src)).size;

  if (!(await exists(backup))) {
    await copyFile(src, backup);
    console.log(`  backed up → originals/${filename}`);
  } else {
    console.log(`  backup already exists, skipping copy`);
  }

  const buf = await readFile(backup); // always re-encode from the original
  const out = await sharp(buf)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();

  await writeFile(src, out);
  const after = (await stat(src)).size;
  const pct = ((1 - after / before) * 100).toFixed(1);
  console.log(
    `  ${filename}: ${(before / 1024).toFixed(0)}KB → ${(after / 1024).toFixed(0)}KB  (-${pct}%)`,
  );
}

async function main() {
  await mkdir(ORIGINALS, { recursive: true });
  console.log(`Compressing ${TARGETS.length} landing images…`);
  for (const [name, w] of TARGETS) {
    console.log(`\n→ ${name} (max width ${w}px)`);
    await compressOne(name, w);
  }
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Compression failed:", err);
  process.exit(1);
});
