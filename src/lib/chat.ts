import { fetch } from 'expo/fetch';
import { CLIENT_HEADER, LIBRARIAN_API_URL } from '../config';
import { Book } from '../types';

// Mirrors the /api/chat contract in the trophyshelf-librarian repo
// (lib/types.ts there) — keep the two in sync.
export type ShelfBook = {
  title: string;
  author: string;
  genre: string;
  status: 'reading' | 'finished';
  finishedAt: string | null;
  note: string;
};

export type Recommendation = {
  title: string;
  authors: string[];
  thumbnail: string | null;
  infoLink: string | null;
  isbn: string | null;
};

export type ChatTurn = { role: 'user' | 'model'; text: string };

type ChatEvent =
  | { type: 'text'; text: string }
  | { type: 'recommendations'; items: Recommendation[] }
  | { type: 'done' }
  | { type: 'error'; error: string };

const TIMEOUT_MS = 60000;

export function toShelf(books: Book[]): ShelfBook[] {
  return books.map((b) => ({
    title: b.title,
    author: b.author,
    genre: b.genre,
    status: b.status,
    finishedAt: b.finishedAt,
    note: b.note,
  }));
}

function friendlyError(status: number, serverError?: string): string {
  if (status === 429) return 'The Librarian needs a moment — too many questions at once. Try again shortly.';
  if (status >= 500) return "The Librarian couldn't answer just now. Please try again.";
  return serverError || `Something went wrong (${status}).`;
}

// Streams the Librarian's reply as newline-delimited JSON events, calling
// onText for each chunk as it arrives. Throws a reader-friendly Error on
// network, HTTP, or server-side failure.
export async function streamChat(
  input: { messages: ChatTurn[]; shelf: ShelfBook[] },
  handlers: { onText: (chunk: string) => void; onRecommendations: (items: Recommendation[]) => void },
  signal?: AbortSignal
): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  const abort = () => controller.abort();
  signal?.addEventListener('abort', abort);

  try {
    let res: Awaited<ReturnType<typeof fetch>>;
    try {
      res = await fetch(`${LIBRARIAN_API_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/x-ndjson',
          'x-trophyshelf-client': CLIENT_HEADER,
        },
        body: JSON.stringify(input),
        signal: controller.signal,
      });
    } catch {
      if (signal?.aborted) return;
      throw new Error("Couldn't reach the Librarian. Check your connection and try again.");
    }

    if (!res.ok || !res.body) {
      let serverError: string | undefined;
      try {
        serverError = ((await res.json()) as { error?: string }).error;
      } catch {
        // non-JSON error body
      }
      throw new Error(friendlyError(res.status, serverError));
    }

    const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
    let buffer = '';
    const handle = (line: string) => {
      if (!line.trim()) return;
      const event = JSON.parse(line) as ChatEvent;
      if (event.type === 'text') handlers.onText(event.text);
      else if (event.type === 'recommendations') handlers.onRecommendations(event.items);
      else if (event.type === 'error') throw new Error(event.error);
    };
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += value;
      let newline: number;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        handle(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
      }
    }
    handle(buffer);
  } catch (err) {
    if (signal?.aborted) return;
    if (controller.signal.aborted) throw new Error('The Librarian took too long to answer. Please try again.');
    throw err;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener('abort', abort);
  }
}
