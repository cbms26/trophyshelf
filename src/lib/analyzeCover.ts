import { API_BASE_URL } from '../config';
import { DetectedCover } from '../types';

type AnalyzeApiResponse =
  | { ok: true; book: { title: string; author: string; genre: string; pageCount: number } }
  | { ok: false; error: string };

// Calls the web app's existing Gemini vision route instead of duplicating
// that backend here — same endpoint app/add/page.tsx uses.
export async function analyzeCover(base64Jpeg: string): Promise<DetectedCover> {
  const res = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-trophyshelf-client': 'mobile/1.0',
    },
    body: JSON.stringify({ image: `data:image/jpeg;base64,${base64Jpeg}` }),
  });

  let data: AnalyzeApiResponse;
  try {
    data = await res.json();
  } catch {
    throw new Error(`Server returned an unexpected response (${res.status})`);
  }

  if (!data.ok) {
    throw new Error(data.error || `Analysis failed (${res.status})`);
  }

  return {
    title: data.book.title ?? '',
    author: data.book.author ?? '',
    genre: data.book.genre ?? '',
    pages: Number.isFinite(data.book.pageCount) ? data.book.pageCount : 0,
  };
}
