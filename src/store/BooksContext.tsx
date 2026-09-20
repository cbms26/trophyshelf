import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { Book } from '../types';

const BOOKS_KEY_V1 = 'trophyshelf/books/v1';
const BOOKS_KEY = 'trophyshelf/books/v2';
const ONBOARDED_KEY = 'trophyshelf/onboarded/v1';

type BooksContextValue = {
  ready: boolean;
  onboarded: boolean;
  books: Book[];
  finished: Book[];
  reading: Book[];
  completeOnboarding: () => void;
  addBook: (book: Book) => void;
  updateBook: (id: string, patch: Partial<Book>) => void;
  deleteBook: (id: string) => void;
  nextVolume: () => number;
};

const BooksContext = createContext<BooksContextValue | null>(null);

// v1 rows predate status/pagesRead/createdAt and had a fabricated startedAt.
function migrateV1(rows: Record<string, unknown>[]): Book[] {
  return rows.map((r) => {
    const finishedAt = typeof r.finishedAt === 'string' ? r.finishedAt : new Date().toISOString();
    return {
      id: String(r.id),
      title: String(r.title ?? ''),
      author: String(r.author ?? ''),
      genre: String(r.genre ?? ''),
      pages: Number(r.pages) || 0,
      pagesRead: Number(r.pages) || 0,
      note: String(r.note ?? ''),
      inscription: String(r.inscription ?? ''),
      coverUri: typeof r.coverUri === 'string' ? r.coverUri : null,
      status: 'finished',
      startedAt: null,
      finishedAt,
      volume: typeof r.volume === 'number' ? r.volume : null,
      createdAt: finishedAt,
      updatedAt: finishedAt,
    };
  });
}

export function BooksProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [v2, v1, storedOnboarded] = await Promise.all([
          AsyncStorage.getItem(BOOKS_KEY),
          AsyncStorage.getItem(BOOKS_KEY_V1),
          AsyncStorage.getItem(ONBOARDED_KEY),
        ]);
        if (v2) {
          setBooks(JSON.parse(v2));
        } else if (v1) {
          const migrated = migrateV1(JSON.parse(v1));
          setBooks(migrated);
          await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(migrated));
          await AsyncStorage.removeItem(BOOKS_KEY_V1);
        }
        if (storedOnboarded === '1') setOnboarded(true);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const persist = useCallback((updater: (prev: Book[]) => Book[]) => {
    setBooks((prev) => {
      const next = updater(prev);
      AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(next)).catch(() => {});
      return next;
    });
  }, []);

  const value = useMemo<BooksContextValue>(() => {
    const finished = books.filter((b) => b.status === 'finished');
    const reading = books.filter((b) => b.status === 'reading');
    return {
      ready,
      onboarded,
      books,
      finished,
      reading,
      completeOnboarding: () => {
        setOnboarded(true);
        AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => {});
      },
      addBook: (book) => persist((prev) => [book, ...prev]),
      updateBook: (id, patch) =>
        persist((prev) =>
          prev.map((b) => (b.id === id ? { ...b, ...patch, updatedAt: new Date().toISOString() } : b))
        ),
      deleteBook: (id) => persist((prev) => prev.filter((b) => b.id !== id)),
      nextVolume: () => finished.reduce((max, b) => Math.max(max, b.volume ?? 0), 0) + 1,
    };
  }, [ready, onboarded, books, persist]);

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks must be used within BooksProvider');
  return ctx;
}
