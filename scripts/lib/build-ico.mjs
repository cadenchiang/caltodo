/**
 * Minimal ICO container builder.
 *
 * Packs one or more PNG images into a single .ico file. PNG-compressed ICO
 * entries are part of the format (Vista onward) and are what every current
 * browser, crawler and link scraper reads, so no BMP/DIB encoding is needed.
 *
 * Kept side-effect free and separate from gen-brand-icons.mjs so it can be
 * unit tested without running the generator.
 *
 * @module scripts/lib/build-ico
 */

/** Bytes in the ICONDIR header. */
const HEADER_SIZE = 6;

/** Bytes in each ICONDIRENTRY. */
const ENTRY_SIZE = 16;

/** Largest dimension an ICO entry can describe (256 is encoded as 0). */
const MAX_DIMENSION = 256;

/**
 * Builds an .ico file from PNG buffers.
 *
 * @param images - One entry per size, each `{ size, png }` where `size` is the
 *                 square edge length in pixels (1-256) and `png` is the encoded
 *                 PNG for that size
 * @returns Buffer containing the complete .ico file
 * @throws TypeError if `images` is empty, or if any entry has a non-Buffer png
 *         or a size outside 1-256
 * @remarks Entries are written in the order given; conventional favicons list
 *          smallest first. A size of exactly 256 is stored as 0, per the spec.
 */
export function buildIco(images) {
  if (!Array.isArray(images) || images.length === 0) {
    throw new TypeError("buildIco requires at least one image");
  }

  for (const image of images) {
    if (!image || !Buffer.isBuffer(image.png)) {
      throw new TypeError("buildIco: each image needs a Buffer 'png'");
    }
    if (!Number.isInteger(image.size) || image.size < 1 || image.size > MAX_DIMENSION) {
      throw new TypeError(
        `buildIco: size must be an integer 1-${MAX_DIMENSION}, got ${image.size}`
      );
    }
  }

  const header = Buffer.alloc(HEADER_SIZE);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type 1 = icon
  header.writeUInt16LE(images.length, 4);

  // Image data starts after the header and the full directory.
  let offset = HEADER_SIZE + images.length * ENTRY_SIZE;

  const entries = images.map(({ size, png }) => {
    const entry = Buffer.alloc(ENTRY_SIZE);
    // 256 does not fit in a byte and is encoded as 0.
    entry.writeUInt8(size === MAX_DIMENSION ? 0 : size, 0);
    entry.writeUInt8(size === MAX_DIMENSION ? 0 : size, 1);
    entry.writeUInt8(0, 2); // palette size (0 = no palette)
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(png.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += png.length;
    return entry;
  });

  return Buffer.concat([header, ...entries, ...images.map((i) => i.png)]);
}
