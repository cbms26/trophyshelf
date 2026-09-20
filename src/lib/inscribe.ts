import { API_BASE_URL } from '../config';
import { fallbackInscription } from './inscriptions';

type InscribeApiResponse = { ok: true; inscription: string } | { ok: false; error: string };

const TIMEOUT_MS = 12000;

// Asks the web app's Gemini route to write the plaque. A failed or slow
// inscription must never block enshrining, so this always resolves —
// with the local template if the network path fails.
export async function writeInscription(input: {
  title: string;
  author: string;
  genre: string;
  days: number | null;
}): Promise<{ text: string; source: 'gemini' | 'fallback' }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_BASE_URL}/api/inscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-trophyshelf-client': 'mobile/1.0',
      },
      body: JSON.stringify({ title: input.title, author: input.author, genre: input.genre }),
      signal: controller.signal,
    });
    const data = (await res.json()) as InscribeApiResponse;
    if (data.ok && typeof data.inscription === 'string' && data.inscription.trim()) {
      return { text: data.inscription.trim(), source: 'gemini' };
    }
  } catch {
    // fall through to the template
  } finally {
    clearTimeout(timer);
  }
  return { text: fallbackInscription(input.days), source: 'fallback' };
}
