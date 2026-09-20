// app/add/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { downscaleImage } from "@/lib/downscaleImage";
import { saveTrophy, type Trophy } from "@/lib/trophies";

type BookInfo = {
  title: string;
  author: string;
  genre: string;
  pageCount: number;
};

// Sits in sessionStorage so the shelf knows to fire confetti after we navigate.
const CELEBRATE_KEY = "trophyshelf:celebrate";

function fallbackInscription(title: string, author: string): string {
  const by = author ? ` by ${author}` : "";
  return `Another journey completed, another story lived to the last page. Let this trophy honor your reading of ${title}${by}.`;
}

export default function AddTrophyPage() {
  const router = useRouter();
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [book, setBook] = useState<BookInfo | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
    setBook(null);
    try {
      const dataUrl = await downscaleImage(file);
      setImageDataUrl(dataUrl);
    } catch {
      setError("Couldn't process that image. Try another photo.");
    }
    e.target.value = "";
  }

  async function handleAnalyze() {
    if (!imageDataUrl) return;
    setAnalyzing(true);
    setError(null);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-trophyshelf-client": "web/1.0",
        },
        body: JSON.stringify({ image: imageDataUrl }),
      });
      const data = await res.json();

      if (!data.ok) {
        setError(data.error ?? "Analysis failed. Try again.");
        return;
      }
      setBook(data.book);
    } catch {
      setError("Network error. Check your connection and try again.");
    } finally {
      setAnalyzing(false);
    }
  }

  function handleRetake() {
    setImageDataUrl(null);
    setBook(null);
    setError(null);
  }

  function updateField<K extends keyof BookInfo>(key: K, value: BookInfo[K]) {
    setBook((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function handleSave() {
    if (!book || !imageDataUrl) return;
    if (!book.title.trim()) {
      setError("Give your trophy a title before saving.");
      return;
    }
    setSaving(true);
    setError(null);

    // Ask Gemini for a personalized inscription. If anything goes wrong,
    // fall back to a generic one — a failed inscription must never block a save.
    let inscription = fallbackInscription(book.title, book.author);
    try {
      const res = await fetch("/api/inscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-trophyshelf-client": "web/1.0",
        },
        body: JSON.stringify({
          title: book.title,
          author: book.author,
          genre: book.genre,
        }),
      });
      const data = await res.json();
      if (data.ok && typeof data.inscription === "string") {
        inscription = data.inscription;
      }
    } catch {
      // Keep the fallback inscription.
    }

    try {
      const trophy: Trophy = {
        id: crypto.randomUUID(),
        title: book.title.trim(),
        author: book.author.trim(),
        genre: book.genre.trim(),
        pageCount: Number.isFinite(book.pageCount) ? book.pageCount : 0,
        coverImage: imageDataUrl,
        inscription,
        addedAt: new Date().toISOString(),
      };
      saveTrophy(trophy);
      sessionStorage.setItem(CELEBRATE_KEY, "1");
      router.push("/");
    } catch {
      // localStorage quota or unavailable — surface it, don't lose the user's work silently.
      setError("Couldn't save to this device's storage. Try removing a trophy or freeing space.");
      setSaving(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col items-center gap-6 bg-[#f7f0e3] p-6 text-amber-950">
      <div className="flex w-full items-center justify-between">
        <Link
          href="/"
          className="text-sm font-medium text-amber-800 hover:text-amber-900"
        >
          ← Shelf
        </Link>
        <h1 className="text-2xl font-bold text-amber-950">Add a Trophy</h1>
        <span className="w-12" />
      </div>

      {!imageDataUrl && (
        <label className="flex w-full cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-10 text-center hover:border-amber-400">
          <span className="text-4xl">📚</span>
          <span className="font-medium text-amber-950">
            Snap or upload a book cover
          </span>
          <span className="text-sm text-amber-700">
            Rear camera opens automatically on mobile
          </span>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      )}

      {imageDataUrl && (
        <div className="flex w-full flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageDataUrl}
            alt="Book cover preview"
            className="max-h-72 rounded-lg shadow-md"
          />

          {!book && (
            <div className="flex gap-3">
              <button
                onClick={handleRetake}
                className="rounded-lg bg-gray-200 px-4 py-2 font-medium hover:bg-gray-300"
              >
                Retake
              </button>
              <button
                onClick={handleAnalyze}
                disabled={analyzing}
                className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
              >
                {analyzing ? "Reading cover…" : "Analyze"}
              </button>
            </div>
          )}

          {book && (
            <form
              className="flex w-full flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                handleSave();
              }}
            >
              <p className="text-center text-sm text-amber-700">
                Check the details — AI misreads covers. Edit anything before
                saving.
              </p>

              <label className="flex flex-col gap-1 text-sm font-medium text-amber-950">
                Title
                <input
                  type="text"
                  value={book.title}
                  onChange={(e) => updateField("title", e.target.value)}
                  className="rounded-lg border border-amber-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-amber-950">
                Author
                <input
                  type="text"
                  value={book.author}
                  onChange={(e) => updateField("author", e.target.value)}
                  className="rounded-lg border border-amber-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-amber-950">
                Genre
                <input
                  type="text"
                  value={book.genre}
                  onChange={(e) => updateField("genre", e.target.value)}
                  className="rounded-lg border border-amber-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none"
                />
              </label>

              <label className="flex flex-col gap-1 text-sm font-medium text-amber-950">
                Page count
                <input
                  type="number"
                  inputMode="numeric"
                  min={0}
                  value={Number.isFinite(book.pageCount) ? book.pageCount : 0}
                  onChange={(e) =>
                    updateField("pageCount", parseInt(e.target.value, 10) || 0)
                  }
                  className="rounded-lg border border-amber-300 px-3 py-2 text-base text-gray-900 focus:border-amber-500 focus:outline-none"
                />
              </label>

              <div className="mt-2 flex gap-3">
                <button
                  type="button"
                  onClick={handleRetake}
                  disabled={saving}
                  className="flex-1 rounded-lg bg-gray-200 px-4 py-3 font-medium hover:bg-gray-300 disabled:opacity-50"
                >
                  Retake
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-lg bg-amber-600 px-4 py-3 font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                >
                  {saving ? "Engraving plaque…" : "Save to Shelf"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}
    </main>
  );
}
