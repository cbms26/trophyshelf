import { DetectedCover } from '../types';

// Stand-in for the on-device/edge-function vision call the design's stack
// note (1i) describes. There's no vision backend wired up here, so this
// simulates "reading the cover" by drawing from a small pool of plausible
// results — enough to exercise the confirm-and-edit step honestly, since
// the design explicitly expects the reader to correct misreads anyway.
const POOL: DetectedCover[] = [
  { title: 'The Vegetarian', author: 'Han Kang', genre: 'Literary', pages: 188 },
  { title: 'Klara and the Sun', author: 'Kazuo Ishiguro', genre: 'Science Fiction', pages: 303 },
  { title: 'Orbital', author: 'Samantha Harvey', genre: 'Literary', pages: 136 },
  { title: 'Trust', author: 'Hernan Diaz', genre: 'Literary', pages: 402 },
  { title: 'Small Things Like These', author: 'Claire Keegan', genre: 'Literary', pages: 116 },
  { title: 'Piranesi', author: 'Susanna Clarke', genre: 'Fantasy', pages: 272 },
  { title: 'Checkout 19', author: 'Claire-Louise Bennett', genre: 'Literary', pages: 172 },
  { title: 'The Bee Sting', author: 'Paul Murray', genre: 'Literary', pages: 656 },
];

export function detectCover(excludeTitles: string[]): DetectedCover {
  const available = POOL.filter((b) => !excludeTitles.includes(b.title));
  const pool = available.length > 0 ? available : POOL;
  return pool[Math.floor(Math.random() * pool.length)];
}
