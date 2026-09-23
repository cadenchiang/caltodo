/**
 * Audit section 4, blocker: the image cropper used to render inside the Edit
 * Profile backdrop's onClick, so any click in the crop dialog closed both.
 * Both dialogs now sit on the Modal primitive and the cropper is a sibling.
 */
import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import path from "node:path";

const read = (rel: string) => readFileSync(path.resolve(__dirname, "..", rel), "utf8");

describe("EditProfileModal", () => {
  const src = read("components/ui/EditProfileModal.tsx");

  it("is built on Modal and no longer hand-rolls a backdrop", () => {
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).not.toContain("createPortal");
    expect(src).not.toContain("onClick={handleClose}");
    expect(src).not.toContain("closing");
  });

  it("renders ImageCropModal as a sibling of the Modal, not inside it", () => {
    const modalClose = src.indexOf("</Modal>");
    const cropper = src.indexOf("<ImageCropModal");
    expect(modalClose).toBeGreaterThan(-1);
    expect(cropper).toBeGreaterThan(modalClose);
  });

  it("uses sentence case and error toasts", () => {
    expect(src).toContain('title="Edit profile"');
    expect(src).toContain("Display name");
    expect(src).toContain('label: "Do not disturb"');
    expect(src).not.toContain("Edit Profile");
    expect(src).toContain('{ variant: "error" }');
  });
});

describe("ImageCropModal", () => {
  const src = read("components/ui/ImageCropModal.tsx");

  it("is built on Modal with a labelled zoom slider", () => {
    expect(src).toContain('import Modal from "@/components/ui/Modal";');
    expect(src).not.toContain("createPortal");
    expect(src).not.toContain("z-[60]");
    expect(src).toContain('htmlFor="image-crop-zoom"');
    expect(src).toContain('title="Crop image"');
  });
});
