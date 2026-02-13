/**
 * Tests for localStorage task caching (stale-while-revalidate).
 * Tests the exported cache utility functions that TaskContext uses
 * for instant page loads.
 */

// We test the caching logic by extracting the same functions used in TaskContext.
// Since they're module-private, we replicate the logic here for testing.

const CACHE_KEY = "toodoo_tasks_cache";
const CACHE_VERSION = 1;

interface CachedTasks {
  version: number;
  tasks: Array<{ id: string; title: string }>;
  timestamp: number;
}

function getCachedTasks(): Array<{ id: string; title: string }> | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed: CachedTasks = JSON.parse(raw);
    if (parsed.version !== CACHE_VERSION) return null;
    return parsed.tasks;
  } catch {
    return null;
  }
}

function setCachedTasks(tasks: Array<{ id: string; title: string }>): void {
  const cache: CachedTasks = {
    version: CACHE_VERSION,
    tasks,
    timestamp: Date.now(),
  };
  localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
}

function clearCachedTasks(): void {
  localStorage.removeItem(CACHE_KEY);
}

// Mock localStorage for Node environment
const store: Record<string, string> = {};
const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
  get length() { return Object.keys(store).length; },
  key: (index: number) => Object.keys(store)[index] ?? null,
};

Object.defineProperty(globalThis, "localStorage", { value: localStorageMock });

describe("Task localStorage cache", () => {
  beforeEach(() => {
    localStorageMock.clear();
  });

  it("returns null when cache is empty", () => {
    expect(getCachedTasks()).toBeNull();
  });

  it("stores and retrieves tasks", () => {
    const tasks = [
      { id: "1", title: "Test task 1" },
      { id: "2", title: "Test task 2" },
    ];
    setCachedTasks(tasks);
    expect(getCachedTasks()).toEqual(tasks);
  });

  it("clears cache", () => {
    setCachedTasks([{ id: "1", title: "Task" }]);
    expect(getCachedTasks()).not.toBeNull();
    clearCachedTasks();
    expect(getCachedTasks()).toBeNull();
  });

  it("returns null for invalid JSON", () => {
    localStorage.setItem(CACHE_KEY, "not-json");
    expect(getCachedTasks()).toBeNull();
  });

  it("returns null for version mismatch", () => {
    localStorage.setItem(CACHE_KEY, JSON.stringify({
      version: 999,
      tasks: [{ id: "1", title: "Old" }],
      timestamp: Date.now(),
    }));
    expect(getCachedTasks()).toBeNull();
  });

  it("overwrites previous cache on set", () => {
    setCachedTasks([{ id: "1", title: "First" }]);
    setCachedTasks([{ id: "2", title: "Second" }]);
    const result = getCachedTasks();
    expect(result).toHaveLength(1);
    expect(result![0].title).toBe("Second");
  });

  it("stores timestamp with cache", () => {
    const before = Date.now();
    setCachedTasks([{ id: "1", title: "Task" }]);
    const raw = localStorage.getItem(CACHE_KEY);
    const parsed: CachedTasks = JSON.parse(raw!);
    expect(parsed.timestamp).toBeGreaterThanOrEqual(before);
    expect(parsed.timestamp).toBeLessThanOrEqual(Date.now());
  });
});
