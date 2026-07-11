// app/page.tsx — the Shelf (main screen)
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import confetti from "canvas-confetti";
import {
  getTrophies,
  deleteTrophy,
  type Trophy,
} from "@/lib/trophies";

const CELEBRATE_KEY = "trophyshelf:celebrate";

function fireConfetti() {
  const common = { spread: 70, ticks: 220, gravity: 0.9, scalar: 1 };
  confetti({
    ...common,
    particleCount: 90,
    origin: { y: 0.7, x: 0.3 },
    colors: ["#e8b923", "#f5d76e", "#b8860b", "#fff4c2"],
  });
  confetti({
    ...common,
    particleCount: 90,
    origin: { y: 0.7, x: 0.7 },
    colors: ["#e8b923", "#f5d76e", "#b8860b", "#fff4c2"],
  });
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "";
  }
}

export default function ShelfPage() {
  const [trophies, setTrophies] = useState<Trophy[]>([]);
  const [selected, setSelected] = useState<Trophy | null>(null);
  const [ready, setReady] = useState(false);

  // localStorage is only read inside useEffect — never during render.
  useEffect(() => {
    // Reading persisted state on mount genuinely requires setState here —
    // doing it during render would cause a hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTrophies(getTrophies());
    setReady(true);

    // Fire confetti once if we just arrived from saving a trophy.
    if (sessionStorage.getItem(CELEBRATE_KEY)) {
      sessionStorage.removeItem(CELEBRATE_KEY);
      // Defer a tick so the shelf paints before the burst.
      const t = setTimeout(fireConfetti, 250);
      return () => clearTimeout(t);
    }
  }, []);

  function handleDelete(id: string) {
    deleteTrophy(id);
    setTrophies(getTrophies());
    setSelected(null);
  }

  const totalPages = trophies.reduce((sum, t) => sum + (t.pageCount || 0), 0);

  return (
    <main
      className="min-h-screen w-full"
      style={{
        background:
          "linear-gradient(180deg, #3a2716 0%, #2b1d12 55%, #1f150c 100%)",
      }}
    >
      <div className="mx-auto flex max-w-3xl flex-col gap-6 px-4 pb-24 pt-8">
        {/* Header */}
        <header className="flex flex-col items-center gap-1 text-center">
          <h1 className="text-3xl font-black tracking-tight text-amber-100 drop-shadow-sm">
            🏆 TrophyShelf
          </h1>
          <p className="text-sm text-amber-200/70">
            A cabinet for the books you&apos;ve conquered.
          </p>
        </header>

        {/* Stats strip */}
        {ready && trophies.length > 0 && (
          <div className="flex items-stretch justify-center gap-3">
            <StatCard label="Trophies" value={trophies.length} />
            <StatCard label="Pages Conquered" value={totalPages.toLocaleString()} />
          </div>
        )}

        {/* Empty state */}
        {ready && trophies.length === 0 && (
          <div className="mt-10 flex flex-col items-center gap-5 rounded-2xl border border-amber-700/30 bg-amber-950/30 px-6 py-14 text-center">
            <span className="text-6xl">🏆</span>
            <div className="flex flex-col gap-1">
              <p className="text-xl font-bold text-amber-100">
                Your shelf awaits its first trophy
              </p>
              <p className="text-sm text-amber-200/70">
                Finish a book, snap its cover, and enshrine it here.
              </p>
            </div>
            <Link
              href="/add"
              className="rounded-full bg-amber-500 px-6 py-3 font-semibold text-amber-950 shadow-lg transition hover:bg-amber-400 active:scale-95"
            >
              Add your first trophy
            </Link>
          </div>
        )}

        {/* Shelf grid */}
        {ready && trophies.length > 0 && (
          <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3">
            {trophies.map((t) => (
              <TrophyCard
                key={t.id}
                trophy={t}
                onClick={() => setSelected(t)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Floating Add button (hidden on empty state to avoid duplication) */}
      {ready && trophies.length > 0 && (
        <Link
          href="/add"
          aria-label="Add a trophy"
          className="fixed bottom-6 left-1/2 z-20 -translate-x-1/2 rounded-full bg-amber-500 px-7 py-3 font-semibold text-amber-950 shadow-xl transition hover:bg-amber-400 active:scale-95"
        >
          + Add a Trophy
        </Link>
      )}

      {/* Plaque modal */}
      {selected && (
        <PlaqueModal
          trophy={selected}
          onClose={() => setSelected(null)}
          onDelete={handleDelete}
        />
      )}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex min-w-28 flex-col items-center rounded-xl border border-amber-600/30 bg-amber-950/40 px-5 py-3">
      <span className="text-2xl font-black text-amber-300">{value}</span>
      <span className="text-xs uppercase tracking-wide text-amber-200/60">
        {label}
      </span>
    </div>
  );
}

function TrophyCard({
  trophy,
  onClick,
}: {
  trophy: Trophy;
  onClick: () => void;
}) {
  return (
    <div className="flex flex-col items-center">
      <button
        onClick={onClick}
        className="group w-full focus:outline-none"
        aria-label={`View ${trophy.title}`}
      >
        {/* Golden frame around the cover */}
        <div
          className="rounded-md p-1 shadow-lg transition duration-200 group-hover:-translate-y-1 group-hover:shadow-2xl group-active:scale-95"
          style={{
            background:
              "linear-gradient(135deg, #f5d76e 0%, #b8860b 50%, #8a6508 100%)",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trophy.coverImage}
            alt={`Cover of ${trophy.title}`}
            className="aspect-[2/3] w-full rounded-sm object-cover"
          />
        </div>
        {/* Brass nameplate */}
        <div className="mx-auto -mt-1 w-11/12 rounded-b-md bg-gradient-to-b from-amber-700 to-amber-900 px-2 py-1 shadow-md">
          <p className="truncate text-center text-xs font-semibold text-amber-50">
            {trophy.title}
          </p>
        </div>
      </button>
      {/* Wooden shelf edge */}
      <div
        className="mt-1 h-2 w-full rounded-sm"
        style={{
          background: "linear-gradient(180deg, #6b4423 0%, #3a2716 100%)",
          boxShadow: "0 4px 6px -2px rgba(0,0,0,0.5)",
        }}
      />
    </div>
  );
}

function PlaqueModal({
  trophy,
  onClose,
  onDelete,
}: {
  trophy: Trophy;
  onClose: () => void;
  onDelete: (id: string) => void;
}) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  return (
    <div
      className="fixed inset-0 z-30 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border-4 border-amber-700/60 p-6 shadow-2xl"
        style={{
          background:
            "linear-gradient(160deg, #4a3418 0%, #2e2010 100%)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-amber-950/60 text-lg text-amber-200 hover:bg-amber-900"
        >
          ✕
        </button>

        <div className="flex flex-col items-center gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={trophy.coverImage}
            alt={`Cover of ${trophy.title}`}
            className="max-h-56 rounded-md shadow-lg ring-2 ring-amber-500/50"
          />

          <div className="text-center">
            <h2 className="text-xl font-bold text-amber-100">{trophy.title}</h2>
            <p className="text-sm text-amber-200/80">
              {trophy.author || "Unknown author"}
            </p>
            <p className="mt-1 text-xs uppercase tracking-wide text-amber-300/70">
              {trophy.genre}
              {trophy.pageCount ? ` · ${trophy.pageCount} pages` : ""}
            </p>
          </div>

          {/* Engraved plaque */}
          <div
            className="w-full rounded-lg border border-amber-500/40 px-5 py-4 text-center shadow-inner"
            style={{
              background:
                "linear-gradient(160deg, #d9b451 0%, #b8860b 100%)",
            }}
          >
            <p
              className="font-serif text-sm italic leading-relaxed text-amber-950"
              style={{ textShadow: "0 1px 0 rgba(255,255,255,0.25)" }}
            >
              {trophy.inscription || "A finished book, proudly enshrined."}
            </p>
          </div>

          <p className="text-xs text-amber-200/60">
            Enshrined {formatDate(trophy.addedAt)}
          </p>

          {/* Delete */}
          {!confirmDelete ? (
            <button
              onClick={() => setConfirmDelete(true)}
              className="mt-1 text-sm font-medium text-red-300/80 hover:text-red-200"
            >
              Remove from shelf
            </button>
          ) : (
            <div className="mt-1 flex flex-col items-center gap-2">
              <p className="text-sm text-amber-100">Remove this trophy?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="rounded-lg bg-amber-800/60 px-4 py-2 text-sm font-medium text-amber-100 hover:bg-amber-700"
                >
                  Keep it
                </button>
                <button
                  onClick={() => onDelete(trophy.id)}
                  className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
