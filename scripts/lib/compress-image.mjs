/**
 * Shared PNG down-scaling helper used by the image-compression scripts.
 *
 * The workflow every caller shares: back the source file up into
 * `public/originals/<name>` exactly once, then always re-encode from that
 * backup. Re-encoding from the backup (never from the current file) makes
 * the scripts idempotent — running twice cannot compound generation loss.
 *
 * Flat brand art (logos, line illustrations) quantises extremely well, so
 * output is written as a palette PNG at maximum zlib compression. Next.js
 * `Image` transcodes to WebP/AVIF at request time where it is used, so the
 * on-disk source only needs to be reasonable, not minimal.
 *
 * @module scripts/lib/compress-image
 */
import sharp from "sharp";
import { readFile, writeFile, copyFile, stat, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

/**
 * Format a human-readable before/after report line for one compressed file.
 *
 * Pure: does no I/O, so the size arithmetic can be unit-tested directly.
 *
 * @param {string} filename - Name shown at the start of the line.
 * @param {number} before - Byte count before compression. Must be > 0.
 * @param {number} after - Byte count after compression. Must be >= 0.
 * @returns {string} e.g. `logo.png: 143KB → 62KB (-57.0%)`
 * @throws {TypeError} If either size is not a finite non-negative number,
 *   or `before` is 0 (a zero-byte source means the caller read the wrong
 *   file, and silently reporting `-NaN%` would hide that).
 */
export function formatSavings(filename, before, after) {
  const ok = (n) => Number.isFinite(n) && n >= 0;
  if (!ok(before) || !ok(after)) {
    throw new TypeError(
      `formatSavings(${filename}): sizes must be finite and >= 0, got before=${before} after=${after}`,
    );
  }
  if (before === 0) {
    throw new TypeError(`formatSavings(${filename}): before size is 0 — source file is empty`);
  }
  const pct = ((1 - after / before) * 100).toFixed(1);
  const kb = (n) => `${(n / 1024).toFixed(0)}KB`;
  return `${filename}: ${kb(before)} → ${kb(after)} (-${pct}%)`;
}

/**
 * Validate one `[filename, maxWidth]` compression target.
 *
 * Pure, so the target tables declared by each script can be checked in
 * tests without touching the filesystem.
 *
 * @param {unknown} target - Expected shape `[string, number]`.
 * @returns {{ filename: string, maxWidth: number }} The parsed target.
 * @throws {TypeError} If the shape is wrong, the filename is empty or not a
 *   `.png`, or the width is not a positive integer.
 */
export function parseTarget(target) {
  if (!Array.isArray(target) || target.length !== 2) {
    throw new TypeError(`Target must be a [filename, maxWidth] pair, got ${JSON.stringify(target)}`);
  }
  const [filename, maxWidth] = target;
  if (typeof filename !== "string" || filename.trim() === "") {
    throw new TypeError(`Target filename must be a non-empty string, got ${JSON.stringify(filename)}`);
  }
  if (!filename.endsWith(".png")) {
    throw new TypeError(`Target ${filename} must be a .png — this helper only re-encodes PNGs`);
  }
  if (!Number.isInteger(maxWidth) || maxWidth <= 0) {
    throw new TypeError(`Target ${filename} width must be a positive integer, got ${maxWidth}`);
  }
  return { filename, maxWidth };
}

/**
 * Report whether a path exists, without throwing on a missing file.
 *
 * @param {string} path - Absolute path to probe.
 * @returns {Promise<boolean>} True when `stat` succeeds.
 */
async function exists(path) {
  try {
    await stat(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Back up and down-scale a single PNG in place.
 *
 * @param {object} opts
 * @param {string} opts.publicDir - Absolute path to `public/`.
 * @param {string} opts.originalsDir - Absolute path to the backup directory.
 * @param {string} opts.filename - PNG filename relative to `publicDir`.
 * @param {number} opts.maxWidth - Max output width in px; never enlarges.
 * @param {(msg: string) => void} [opts.log] - Progress sink, defaults to console.log.
 * @returns {Promise<{ before: number, after: number }>} Byte counts.
 * @throws {Error} If the source is missing, or sharp fails to decode/encode.
 *   Errors carry the filename so a failure in a batch is attributable.
 *
 * Edge cases: a source already narrower than `maxWidth` is re-encoded but
 * not enlarged; an existing backup is never overwritten, so the first run's
 * original stays authoritative forever.
 */
export async function compressToWidth({ publicDir, originalsDir, filename, maxWidth, log = console.log }) {
  parseTarget([filename, maxWidth]);

  const src = resolve(publicDir, filename);
  const backup = resolve(originalsDir, filename);

  if (!(await exists(src))) {
    throw new Error(`Source not found: ${src}`);
  }

  const before = (await stat(src)).size;
  if (before === 0) {
    throw new Error(`Source is empty (0 bytes): ${src}`);
  }

  await mkdir(originalsDir, { recursive: true });
  if (!(await exists(backup))) {
    await copyFile(src, backup);
    log(`  backed up → originals/${filename}`);
  } else {
    log(`  backup already exists, re-encoding from it`);
  }

  let out;
  try {
    // Always re-encode from the backup so repeat runs stay idempotent.
    const buf = await readFile(backup);
    out = await sharp(buf)
      .resize({ width: maxWidth, withoutEnlargement: true })
      .png({ compressionLevel: 9, palette: true })
      .toBuffer();
  } catch (err) {
    throw new Error(`Failed to re-encode ${filename} at width ${maxWidth}: ${err.message}`, { cause: err });
  }

  await writeFile(src, out);
  const after = (await stat(src)).size;
  log(`  ${formatSavings(filename, before, after)}`);
  return { before, after };
}

/**
 * Run a batch of compression targets in sequence.
 *
 * Sequential rather than parallel on purpose: sharp is CPU-bound and the
 * interleaved progress output of a parallel run makes a failure much harder
 * to attribute to a specific file.
 *
 * @param {object} opts
 * @param {string} opts.publicDir - Absolute path to `public/`.
 * @param {string} opts.originalsDir - Absolute path to the backup directory.
 * @param {Array<[string, number]>} opts.targets - `[filename, maxWidth]` pairs.
 * @param {string} opts.label - Batch name used in the summary line.
 * @param {(msg: string) => void} [opts.log] - Progress sink.
 * @returns {Promise<{ before: number, after: number }>} Batch totals in bytes.
 * @throws {Error} Propagates the first failure; earlier files stay compressed.
 */
export async function runBatch({ publicDir, originalsDir, targets, label, log = console.log }) {
  const parsed = targets.map(parseTarget);
  log(`Compressing ${parsed.length} ${label}…`);

  let before = 0;
  let after = 0;
  for (const { filename, maxWidth } of parsed) {
    log(`\n→ ${filename} (max width ${maxWidth}px)`);
    const result = await compressToWidth({ publicDir, originalsDir, filename, maxWidth, log });
    before += result.before;
    after += result.after;
  }

  log(`\n${formatSavings(`${label} total`, before, after)}`);
  return { before, after };
}
