// lib/trophies.ts
// The Trophy type and localStorage helpers. Storage is a single array under
// the key "trophies". Every function here touches localStorage, so only call
// them from event handlers or inside useEffect — never during render.

export type Trophy = {
  id: string; // crypto.randomUUID()
  title: string;
  author: string;
  genre: string;
  pageCount: number;
  coverImage: string; // small JPEG data URL
  inscription?: string; // AI-generated plaque text (Phase 2)
  addedAt: string; // ISO date
};

const STORAGE_KEY = "trophies";

export function getTrophies(): Trophy[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Trophy[]) : [];
  } catch {
    // Corrupt or unreadable storage — start fresh rather than crashing.
    return [];
  }
}

export function saveTrophy(trophy: Trophy): void {
  const trophies = getTrophies();
  // Newest first so the shelf shows the latest addition up front.
  trophies.unshift(trophy);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trophies));
}

export function deleteTrophy(id: string): void {
  const trophies = getTrophies().filter((t) => t.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trophies));
}
