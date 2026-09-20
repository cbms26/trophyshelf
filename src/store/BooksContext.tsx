import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Book, ReadingBook } from '../types';

const BOOKS_KEY = 'trophyshelf/books/v1';
const ONBOARDED_KEY = 'trophyshelf/onboarded/v1';

// Currently-reading is out of scope for this pass (no capture flow feeds it
// yet) — seeded once so the shelf's "reading now" row has something real to
// show, same two volumes the design mock used.
const SEED_READING: ReadingBook[] = [
  { id: 'r1', title: 'The Bee Sting', author: 'Paul Murray', pagesRead: 218, pages: 656 },
  { id: 'r2', title: 'Orbital', author: 'Samantha Harvey', pagesRead: 41, pages: 136 },
];

type BooksContextValue = {
  ready: boolean;
  onboarded: boolean;
  books: Book[];
  reading: ReadingBook[];
  completeOnboarding: () => void;
  addBook: (book: Book) => void;
};

const BooksContext = createContext<BooksContextValue | null>(null);

export function BooksProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [onboarded, setOnboarded] = useState(false);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const [storedBooks, storedOnboarded] = await Promise.all([
          AsyncStorage.getItem(BOOKS_KEY),
          AsyncStorage.getItem(ONBOARDED_KEY),
        ]);
        if (storedBooks) setBooks(JSON.parse(storedBooks));
        if (storedOnboarded === '1') setOnboarded(true);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const value = useMemo<BooksContextValue>(
    () => ({
      ready,
      onboarded,
      books,
      reading: SEED_READING,
      completeOnboarding: () => {
        setOnboarded(true);
        AsyncStorage.setItem(ONBOARDED_KEY, '1').catch(() => {});
      },
      addBook: (book: Book) => {
        setBooks((prev) => {
          const next = [book, ...prev];
          AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(next)).catch(() => {});
          return next;
        });
      },
    }),
    [ready, onboarded, books]
  );

  return <BooksContext.Provider value={value}>{children}</BooksContext.Provider>;
}

export function useBooks() {
  const ctx = useContext(BooksContext);
  if (!ctx) throw new Error('useBooks must be used within BooksProvider');
  return ctx;
}
