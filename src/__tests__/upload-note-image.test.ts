import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock supabase client
const mockGetUser = vi.fn();
const mockUpload = vi.fn();
const mockGetPublicUrl = vi.fn();

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: { getUser: mockGetUser },
    storage: {
      from: () => ({
        upload: mockUpload,
        getPublicUrl: mockGetPublicUrl,
      }),
    },
  }),
}));

// Mock compressImage to return the file as-is
vi.mock("@/lib/compress-image", () => ({
  compressImage: vi.fn((file: File) => Promise.resolve(file)),
}));

// Import after mocks are set up
const { uploadNoteImage } = await import("@/lib/upload-note-image");

function createFile(name: string, size: number, type: string): File {
  const buffer = new ArrayBuffer(size);
  return new File([buffer], name, { type });
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("uploadNoteImage", () => {
  it("returns null if file exceeds 10MB", async () => {
    const bigFile = createFile("big.jpg", 11 * 1024 * 1024, "image/jpeg");
    const result = await uploadNoteImage(bigFile, "note-1");
    expect(result).toBeNull();
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("returns null for invalid MIME type", async () => {
    const svgFile = createFile("icon.svg", 1024, "image/svg+xml");
    const result = await uploadNoteImage(svgFile, "note-1");
    expect(result).toBeNull();
    expect(mockGetUser).not.toHaveBeenCalled();
  });

  it("returns null if user is not authenticated", async () => {
    mockGetUser.mockResolvedValue({ data: { user: null } });
    const file = createFile("photo.jpg", 1024, "image/jpeg");
    const result = await uploadNoteImage(file, "note-1");
    expect(result).toBeNull();
  });

  it("returns null on upload error", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockUpload.mockResolvedValue({ error: { message: "Storage full" } });

    const file = createFile("photo.jpg", 1024, "image/jpeg");
    const result = await uploadNoteImage(file, "note-1");
    expect(result).toBeNull();
  });

  it("returns public URL on successful upload", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/image.jpg" },
    });

    const file = createFile("photo.jpg", 1024, "image/jpeg");
    const result = await uploadNoteImage(file, "note-1");
    expect(result).toMatch(/^https:\/\/example\.com\/image\.jpg\?t=\d+$/);
  });

  it("accepts valid MIME types: png, webp, gif", async () => {
    mockGetUser.mockResolvedValue({
      data: { user: { id: "user-1" } },
    });
    mockUpload.mockResolvedValue({ error: null });
    mockGetPublicUrl.mockReturnValue({
      data: { publicUrl: "https://example.com/image.png" },
    });

    for (const type of ["image/png", "image/webp", "image/gif"]) {
      const file = createFile("img.png", 1024, type);
      const result = await uploadNoteImage(file, "note-1");
      expect(result).not.toBeNull();
    }
  });
});
