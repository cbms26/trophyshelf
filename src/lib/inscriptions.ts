// Stand-in for the AI-written plaque inscription (design's stack note (1i)
// puts this behind a server-side model call). Templated locally so the
// celebration and detail screens have real, book-specific text to show
// without a backend.
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

export function generateInscription(title: string, days: number): string {
  const dayWord = days === 1 ? '1 day' : `${days} days`;
  return `${pick(OPENERS)}, finished in ${dayWord} — ${pick(CLOSERS)}`;
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
