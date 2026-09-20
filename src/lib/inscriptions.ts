// Offline fallback for the plaque inscription. The real one is written by
// Gemini via lib/inscribe.ts; this only runs when that call fails.
const OPENERS = [
  'A quiet, exacting book',
  'A strange, kind book',
  'A book that took its time and earned it',
  'A book that outran its own premise',
  'An unhurried, watchful book',
];

const CLOSERS = [
  'the shelf keeps your name now.',
  'this one earns its plate.',
  "worth the eleven o'clock candle.",
  'a volume the shelf was missing.',
  'the house keeps your name now.',
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function fallbackInscription(days: number | null): string {
  const middle = days === null ? 'finished and shelved' : `finished in ${days === 1 ? '1 day' : `${days} days`}`;
  return `${pick(OPENERS)}, ${middle} — ${pick(CLOSERS)}`;
}

export function daysBetween(startIso: string | null, endIso: string | null): number | null {
  if (!startIso || !endIso) return null;
  const ms = new Date(endIso).getTime() - new Date(startIso).getTime();
  return Math.max(1, Math.round(ms / (1000 * 60 * 60 * 24)));
}

const ORDINALS = [
  'zeroth', 'first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth',
  'tenth', 'eleventh', 'twelfth', 'thirteenth', 'fourteenth', 'fifteenth', 'sixteenth', 'seventeenth',
  'eighteenth', 'nineteenth', 'twentieth',
];
const TENS = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

export function ordinalWords(n: number): string {
  if (n <= 20) return ORDINALS[n] ?? String(n);
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  if (ones === 0) return `${TENS[tens]}ieth`;
  return `${TENS[tens]}-${ORDINALS[ones]}`;
}
