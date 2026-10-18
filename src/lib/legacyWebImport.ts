import { Book } from '../types';
import { saveWebCover } from './webCovers';

// The old Next.js site at trophyshelf.vercel.app kept books in
// localStorage["trophies"]. The PWA now lives on that same origin, so on a
// visitor's first launch their old shelf is carried over. The old key is
// left in place as a backup.

const LEGACY_KEY = 'trophies';

type LegacyTrophy = {
  id: string;
  title: string;
  author: string;
  genre: string;
  pageCount: number;
  coverImage: string; // small JPEG data URL
  inscription?: string;
  addedAt: string; // ISO date
};

export async function importLegacyWebTrophies(): Promise<Book[] | null> {
  let trophies: LegacyTrophy[];
  try {
    const raw = globalThis.localStorage?.getItem(LEGACY_KEY);
    if (!raw) return null;
    trophies = JSON.parse(raw);
    if (!Array.isArray(trophies) || trophies.length === 0) return null;
  } catch {
    return null;
  }

  // Oldest first, so volume numbers follow the order they were enshrined.
  const ordered = [...trophies].sort((a, b) => String(a.addedAt).localeCompare(String(b.addedAt)));
  const books: Book[] = [];
  for (const [i, t] of ordered.entries()) {
    const finishedAt = t.addedAt || new Date().toISOString();
    let coverUri: string | null = null;
    if (typeof t.coverImage === 'string' && t.coverImage.startsWith('data:')) {
      coverUri = await saveWebCover(t.coverImage).catch(() => null);
    }
    books.push({
      id: String(t.id),
      title: String(t.title ?? ''),
      author: String(t.author ?? ''),
      genre: String(t.genre ?? ''),
      pages: Number(t.pageCount) || 0,
      pagesRead: Number(t.pageCount) || 0,
      note: '',
      inscription: String(t.inscription ?? ''),
      coverUri,
      status: 'finished',
      startedAt: null,
      finishedAt,
      volume: i + 1,
      createdAt: finishedAt,
      updatedAt: finishedAt,
    });
  }
  // Newest first, matching how the shelf stores books.
  return books.reverse();
}
