export type BookStatus = 'reading' | 'finished';

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: number;
  pagesRead: number;
  note: string;
  inscription: string;
  coverUri: string | null;
  status: BookStatus;
  startedAt: string | null; // ISO date; null when unknown
  finishedAt: string | null; // ISO date; null while still reading
  volume: number | null; // assigned when finished
  createdAt: string;
  updatedAt: string;
};

export type DetectedCover = {
  title: string;
  author: string;
  genre: string;
  pages: number;
};
