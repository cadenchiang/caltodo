/**
 * Tests for chat-attachments.ts (audit H3): only URLs in the app's own
 * storage bucket are attachments; anything else is text (rendered as a
 * link, never an embed).
 */

import { describe, it, expect } from "vitest";
import { attachmentUrlPrefix, classifyLine, parseBody, attachmentPaths, summarizeAttachments } from "@/lib/chat-attachments";

const PREFIX = attachmentUrlPrefix("https://proj.supabase.co/");
const OWN_IMG = `${PREFIX}u1/c1/photo.png`;
const OWN_PDF = `${PREFIX}u1/c1/notes.pdf`;

describe("attachmentUrlPrefix", () => {
  it("points at the public bucket path without a double slash", () => {
    expect(PREFIX).toBe("https://proj.supabase.co/storage/v1/object/public/chat-attachments/");
  });
});

describe("classifyLine", () => {
  it("recognises own-bucket images and PDFs", () => {
    expect(classifyLine(OWN_IMG, PREFIX)).toEqual({ kind: "image", url: OWN_IMG, path: "u1/c1/photo.png", sensitive: false });
    expect(classifyLine(OWN_PDF, PREFIX)).toEqual({ kind: "file", url: OWN_PDF, path: "u1/c1/notes.pdf", name: "notes.pdf" });
  });

  it("keeps the sensitive flag", () => {
    expect(classifyLine(`[sensitive]${OWN_IMG}`, PREFIX)).toMatchObject({ kind: "image", sensitive: true });
  });

  it("treats a foreign image URL as text, so it is never auto-rendered", () => {
    expect(classifyLine("https://evil.example/pixel.png", PREFIX)).toEqual({ kind: "text", text: "https://evil.example/pixel.png" });
  });

  it("treats an own-bucket URL with an unknown extension as text", () => {
    expect(classifyLine(`${PREFIX}u1/c1/run.exe`, PREFIX).kind).toBe("text");
  });
});

describe("parseBody / attachmentPaths / summarizeAttachments", () => {
  const body = `see this\n${OWN_IMG}\n${OWN_PDF}\nhttps://example.com`;

  it("splits lines into parts in order", () => {
    expect(parseBody(body, PREFIX).map((p) => p.kind)).toEqual(["text", "image", "file", "text"]);
  });

  it("lists bucket paths for deletion on unsend", () => {
    expect(attachmentPaths(body, PREFIX)).toEqual(["u1/c1/photo.png", "u1/c1/notes.pdf"]);
  });

  it("summarizes text plus a count", () => {
    expect(summarizeAttachments(body, PREFIX)).toBe("see this https://example.com + 2 attachments");
    expect(summarizeAttachments(OWN_IMG, PREFIX)).toBe("1 attachment");
  });
});
