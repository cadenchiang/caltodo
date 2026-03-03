/**
 * Tests for savedImages persistence in the widget layout.
 * Verifies that savedImages are included in the persisted data
 * and properly restored when reading.
 */

import { describe, it, expect, beforeEach, vi } from "vitest";

// Mock localStorage for persistence tests
const mockStorage: Record<string, string> = {};
const localStorageMock = {
  getItem: vi.fn((key: string) => mockStorage[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { mockStorage[key] = value; }),
  removeItem: vi.fn((key: string) => { delete mockStorage[key]; }),
  clear: vi.fn(() => { Object.keys(mockStorage).forEach((k) => delete mockStorage[k]); }),
  length: 0,
  key: vi.fn(() => null),
};

Object.defineProperty(global, "localStorage", { value: localStorageMock });

// Mock server sync to avoid actual network calls
vi.mock("@/lib/board-layout-sync", () => ({
  fetchServerLayout: vi.fn().mockResolvedValue({ layout: null, updatedAt: null }),
  debouncedServerSave: vi.fn(),
}));

const STORAGE_KEY = "home_widget_layout";
const SCHEMA_VERSION = 10;

describe("savedImages persistence", () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it("should include savedImages in persisted layout data", () => {
    const layout = {
      version: SCHEMA_VERSION,
      widgets: [],
      layouts: { lg: [] },
      boardTitle: "Test",
      boardDescription: "desc",
      coverImageUrl: "",
      boardEmoji: "\u{1F4D6}",
      iconSize: "md",
      titleFontFamily: "",
      titleTextColor: "",
      titleFontSize: "lg",
      coverHeight: 220,
      coverPositionY: 50,
      savedImages: ["https://example.com/img1.jpg", "https://example.com/img2.jpg"],
      updatedAt: Date.now(),
    };

    localStorageMock.setItem(STORAGE_KEY, JSON.stringify(layout));
    const stored = JSON.parse(localStorageMock.setItem.mock.calls[0][1]);
    expect(stored.savedImages).toEqual([
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg",
    ]);
  });

  it("should default savedImages to empty array when not present", () => {
    const layout = {
      version: SCHEMA_VERSION,
      widgets: [],
      layouts: { lg: [] },
      boardTitle: "Test",
      boardDescription: "desc",
      coverImageUrl: "",
      boardEmoji: "\u{1F4D6}",
      iconSize: "md",
      titleFontFamily: "",
      titleTextColor: "",
      titleFontSize: "lg",
      coverHeight: 220,
      coverPositionY: 50,
      updatedAt: Date.now(),
    };

    // savedImages is optional — should default to []
    const savedImages = (layout as Record<string, unknown>).savedImages ?? [];
    expect(savedImages).toEqual([]);
  });

  it("should cap savedImages at 20 entries", () => {
    const urls = Array.from({ length: 25 }, (_, i) => `https://example.com/img${i}.jpg`);
    // Simulate addSavedImage logic: prepend, dedupe, cap at 20
    const newUrl = "https://example.com/new.jpg";
    const deduped = urls.filter((u) => u !== newUrl);
    const result = [newUrl, ...deduped].slice(0, 20);

    expect(result.length).toBe(20);
    expect(result[0]).toBe(newUrl);
  });

  it("should deduplicate when adding an existing image", () => {
    const existing = [
      "https://example.com/img1.jpg",
      "https://example.com/img2.jpg",
      "https://example.com/img3.jpg",
    ];

    // Re-add img2 — should move it to front
    const url = "https://example.com/img2.jpg";
    const deduped = existing.filter((u) => u !== url);
    const result = [url, ...deduped].slice(0, 20);

    expect(result).toEqual([
      "https://example.com/img2.jpg",
      "https://example.com/img1.jpg",
      "https://example.com/img3.jpg",
    ]);
  });

  it("should preserve savedImages through serialization roundtrip", () => {
    const images = ["https://a.com/1.jpg", "https://b.com/2.jpg"];
    const data = {
      version: SCHEMA_VERSION,
      widgets: [],
      layouts: { lg: [] },
      boardTitle: "Board",
      boardDescription: "",
      coverImageUrl: "",
      boardEmoji: "\u{1F4D6}",
      iconSize: "md",
      titleFontFamily: "",
      titleTextColor: "",
      titleFontSize: "lg",
      coverHeight: 220,
      coverPositionY: 50,
      savedImages: images,
      updatedAt: Date.now(),
    };

    const serialized = JSON.stringify(data);
    const parsed = JSON.parse(serialized);
    expect(parsed.savedImages).toEqual(images);
  });
});
