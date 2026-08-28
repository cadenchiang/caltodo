/**
 * Tests for the ICO container builder used by scripts/gen-brand-icons.mjs.
 * Verifies header fields, directory entries, offsets, and argument validation.
 */

import { describe, it, expect } from "vitest";
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- build tooling, plain .mjs with no type declarations
import { buildIco } from "../../scripts/lib/build-ico.mjs";

/** Builds a recognizable fake PNG payload of a given length. */
function fakePng(length: number, fill: number): Buffer {
  return Buffer.alloc(length, fill);
}

const HEADER_SIZE = 6;
const ENTRY_SIZE = 16;

describe("buildIco", () => {
  it("writes an ICONDIR header declaring type 1 and the image count", () => {
    const ico: Buffer = buildIco([
      { size: 16, png: fakePng(10, 0xaa) },
      { size: 32, png: fakePng(20, 0xbb) },
    ]);

    expect(ico.readUInt16LE(0)).toBe(0); // reserved
    expect(ico.readUInt16LE(2)).toBe(1); // type: icon
    expect(ico.readUInt16LE(4)).toBe(2); // count
  });

  it("records each entry's dimensions, length and offset", () => {
    const first = fakePng(10, 0xaa);
    const second = fakePng(20, 0xbb);
    const ico: Buffer = buildIco([
      { size: 16, png: first },
      { size: 48, png: second },
    ]);

    const dirStart = HEADER_SIZE;
    const dataStart = HEADER_SIZE + 2 * ENTRY_SIZE;

    expect(ico.readUInt8(dirStart)).toBe(16); // width
    expect(ico.readUInt8(dirStart + 1)).toBe(16); // height
    expect(ico.readUInt16LE(dirStart + 4)).toBe(1); // planes
    expect(ico.readUInt16LE(dirStart + 6)).toBe(32); // bit depth
    expect(ico.readUInt32LE(dirStart + 8)).toBe(first.length);
    expect(ico.readUInt32LE(dirStart + 12)).toBe(dataStart);

    const secondEntry = dirStart + ENTRY_SIZE;
    expect(ico.readUInt8(secondEntry)).toBe(48);
    expect(ico.readUInt32LE(secondEntry + 8)).toBe(second.length);
    expect(ico.readUInt32LE(secondEntry + 12)).toBe(dataStart + first.length);
  });

  it("places the image payloads at the offsets it declared", () => {
    const first = fakePng(10, 0xaa);
    const second = fakePng(20, 0xbb);
    const ico: Buffer = buildIco([
      { size: 16, png: first },
      { size: 32, png: second },
    ]);

    const firstOffset = ico.readUInt32LE(HEADER_SIZE + 12);
    const secondOffset = ico.readUInt32LE(HEADER_SIZE + ENTRY_SIZE + 12);

    expect(ico.subarray(firstOffset, firstOffset + first.length)).toEqual(first);
    expect(ico.subarray(secondOffset, secondOffset + second.length)).toEqual(second);
  });

  it("produces a file exactly as long as its header, directory and payloads", () => {
    const ico: Buffer = buildIco([
      { size: 16, png: fakePng(10, 0xaa) },
      { size: 32, png: fakePng(20, 0xbb) },
      { size: 48, png: fakePng(30, 0xcc) },
    ]);
    expect(ico.length).toBe(HEADER_SIZE + 3 * ENTRY_SIZE + 10 + 20 + 30);
  });

  it("encodes a 256px entry as 0, per the format", () => {
    const ico: Buffer = buildIco([{ size: 256, png: fakePng(10, 0xaa) }]);
    expect(ico.readUInt8(HEADER_SIZE)).toBe(0);
    expect(ico.readUInt8(HEADER_SIZE + 1)).toBe(0);
  });

  it("rejects an empty image list", () => {
    expect(() => buildIco([])).toThrow(TypeError);
  });

  it("rejects a non-array argument", () => {
    expect(() => buildIco(undefined)).toThrow(TypeError);
  });

  it("rejects an entry whose png is not a Buffer", () => {
    expect(() => buildIco([{ size: 16, png: "not a buffer" }])).toThrow(TypeError);
  });

  it("rejects a size outside 1-256", () => {
    expect(() => buildIco([{ size: 0, png: fakePng(4, 0) }])).toThrow(TypeError);
    expect(() => buildIco([{ size: 257, png: fakePng(4, 0) }])).toThrow(TypeError);
    expect(() => buildIco([{ size: 16.5, png: fakePng(4, 0) }])).toThrow(TypeError);
  });
});
