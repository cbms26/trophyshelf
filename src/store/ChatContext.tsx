import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { ChatTurn, Recommendation, streamChat, toShelf } from '../lib/chat';
import { useBooks } from './BooksContext';

const CHAT_KEY = 'trophyshelf/chat/v1';
const MAX_STORED = 50;
const MAX_SENT = 20;

export type ChatMessage = {
  id: string;
  role: 'user' | 'model';
  text: string;
  recommendations?: Recommendation[];
  status?: 'streaming' | 'error';
};

type ChatContextValue = {
  messages: ChatMessage[];
  busy: boolean;
  send: (text: string) => void;
  retry: () => void;
  clear: () => void;
};

const ChatContext = createContext<ChatContextValue | null>(null);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function ChatProvider({ children }: { children: ReactNode }) {
  const { books } = useBooks();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [busy, setBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const booksRef = useRef(books);
  booksRef.current = books;

  useEffect(() => {
    AsyncStorage.getItem(CHAT_KEY)
      .then((raw) => {
        if (raw) setMessages(JSON.parse(raw));
      })
      .catch(() => {});
    return () => abortRef.current?.abort();
  }, []);

  // Only settled conversations are saved — never a half-streamed reply.
  const save = useCallback((next: ChatMessage[]) => {
    const settled = next.filter((m) => !m.status).slice(-MAX_STORED);
    AsyncStorage.setItem(CHAT_KEY, JSON.stringify(settled)).catch(() => {});
  }, []);

  const patchReply = useCallback((id: string, patch: (m: ChatMessage) => Partial<ChatMessage>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch(m) } : m)));
  }, []);

  const run = useCallback(
    async (history: ChatMessage[]) => {
      const reply: ChatMessage = { id: newId(), role: 'model', text: '', status: 'streaming' };
      setMessages([...history, reply]);
      setBusy(true);
      const controller = new AbortController();
      abortRef.current = controller;

      const turns: ChatTurn[] = history
        .filter((m) => !m.status && m.text)
        .slice(-MAX_SENT)
        .map(({ role, text }) => ({ role, text }));

      try {
        await streamChat(
          { messages: turns, shelf: toShelf(booksRef.current) },
          {
            onText: (chunk) => patchReply(reply.id, (m) => ({ text: m.text + chunk })),
            onRecommendations: (items) => patchReply(reply.id, () => ({ recommendations: items })),
          },
          controller.signal
        );
        if (controller.signal.aborted) return;
        setMessages((prev) => {
          const next = prev.map((m) =>
            m.id === reply.id
              ? { ...m, status: undefined, text: m.text.trim() || 'Hmm, I have nothing to add to that.' }
              : m
          );
          save(next);
          return next;
        });
      } catch (err) {
        patchReply(reply.id, () => ({
          status: 'error',
          text: err instanceof Error ? err.message : 'Something went wrong. Please try again.',
        }));
      } finally {
        if (abortRef.current === controller) {
          abortRef.current = null;
          setBusy(false);
        }
      }
    },
    [patchReply, save]
  );

  const value = useMemo<ChatContextValue>(
    () => ({
      messages,
      busy,
      send: (text) => {
        const trimmed = text.trim();
        if (!trimmed || busy) return;
        const history = messages.filter((m) => m.status !== 'error');
        run([...history, { id: newId(), role: 'user', text: trimmed }]);
      },
      retry: () => {
        if (busy) return;
        const history = messages.filter((m) => m.status !== 'error');
        if (history[history.length - 1]?.role === 'user') run(history);
      },
      clear: () => {
        abortRef.current?.abort();
        abortRef.current = null;
        setBusy(false);
        setMessages([]);
        AsyncStorage.removeItem(CHAT_KEY).catch(() => {});
      },
    }),
    [messages, busy, run]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
