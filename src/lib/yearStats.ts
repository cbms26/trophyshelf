import { Book } from '../types';
import { daysBetween } from './inscriptions';

const MONTH_LETTERS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export type YearStats = {
  volumes: number;
  pages: number;
  months: { label: string; count: number; h: string; fill: string }[];
  genres: { name: string; n: number; pct: string }[];
  notables: { k: string; v: string }[];
};

export function computeYearStats(books: Book[], year: number): YearStats {
  const inYear = books.filter(
    (b): b is Book & { finishedAt: string } =>
      b.status === 'finished' && !!b.finishedAt && new Date(b.finishedAt).getFullYear() === year
  );

  const monthCounts = new Array(12).fill(0);
  inYear.forEach((b) => {
    monthCounts[new Date(b.finishedAt).getMonth()] += 1;
  });
  const maxMonth = Math.max(1, ...monthCounts);
  const months = MONTH_LETTERS.map((label, i) => ({
    label,
    count: monthCounts[i],
    h: `${Math.max(6, Math.round((monthCounts[i] / maxMonth) * 100))}%`,
    fill: monthCounts[i] > 0 ? 'rgba(182, 130, 53, 0.22)' : 'transparent',
  }));

  const genreCounts = new Map<string, number>();
  inYear.forEach((b) => genreCounts.set(b.genre, (genreCounts.get(b.genre) ?? 0) + 1));
  const maxGenre = Math.max(1, ...Array.from(genreCounts.values()));
  const genres = Array.from(genreCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([name, n]) => ({ name, n, pct: `${Math.round((n / maxGenre) * 100)}%` }));

  const notables: { k: string; v: string }[] = [];
  if (inYear.length > 0) {
    const longest = inYear.reduce((a, b) => (b.pages > a.pages ? b : a));
    notables.push({ k: 'Longest', v: `${longest.title}, ${longest.pages} pp` });

    // Only books that were tracked from "reading" have a real start date.
    const withDays: { b: Book; days: number }[] = [];
    inYear.forEach((b) => {
      const days = daysBetween(b.startedAt, b.finishedAt);
      if (days !== null) withDays.push({ b, days });
    });
    if (withDays.length > 0) {
      const fastest = withDays.reduce((a, c) => (c.days < a.days ? c : a));
      notables.push({ k: 'Finished fastest', v: `${fastest.b.title}, ${fastest.days} day${fastest.days === 1 ? '' : 's'}` });
    }

    const authorCounts = new Map<string, number>();
    inYear.forEach((b) => authorCounts.set(b.author, (authorCounts.get(b.author) ?? 0) + 1));
    const topAuthor = Array.from(authorCounts.entries()).sort((a, b) => b[1] - a[1])[0];
    if (topAuthor) notables.push({ k: 'Most-read author', v: topAuthor[0] });

    const bestMonthIndex = monthCounts.indexOf(maxMonth);
    const bestMonthName = new Date(year, bestMonthIndex, 1).toLocaleDateString('en-US', { month: 'long' });
    notables.push({ k: 'Best month', v: `${bestMonthName}, ${maxMonth} volume${maxMonth === 1 ? '' : 's'}` });
  }

  return {
    volumes: inYear.length,
    pages: inYear.reduce((sum, b) => sum + b.pages, 0),
    months,
    genres,
    notables,
  };
}
