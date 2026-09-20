export type Book = {
  id: string;
  title: string;
  author: string;
  genre: string;
  pages: number;
  note: string;
  inscription: string;
  coverUri: string | null;
  startedAt: string; // ISO date
  finishedAt: string; // ISO date
  volume: number;
};

export type ReadingBook = {
  id: string;
  title: string;
  author: string;
  pagesRead: number;
  pages: number;
};

export type DetectedCover = {
  title: string;
  author: string;
  genre: string;
  pages: number;
};
