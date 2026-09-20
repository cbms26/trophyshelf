# CLAUDE.md — TrophyShelf AI

## First step, every session

Before writing any code, read the existing codebase to understand current state:

- `app/add/page.tsx` — image capture + analyze flow
- `app/api/analyze/route.ts` — Gemini vision route
- `app/api/gemini-test/route.ts` — Phase 0 connectivity test (do not modify)
- `lib/downscaleImage.ts` — canvas-based image downscaling helper
- `app/page.tsx` — will become the Trophy Shelf (main screen)

Build on what exists. Do not rewrite working code, restructure the project, or
introduce new patterns unless explicitly asked. If something looks improvable,
mention it and wait for approval — do not refactor unprompted.

## What this project is

TrophyShelf AI: a digital trophy cabinet for finished books. Snap a photo of a
book cover → Gemini vision extracts title/author/genre/pageCount → user
confirms/edits → book is saved as a "trophy" on a visual shelf, with an
AI-generated plaque inscription celebrating the read.

**Context:** DEV Weekend Challenge entry, "Best Use of Google AI" prize
category. HARD DEADLINE: Monday 13 July, 4:59 PM AEST. Everything is in
service of a working demo, a live Vercel URL, and a good write-up by then.
Prefer the simple solution that ships over the elegant one that doesn't.

## Tech stack (fixed — do not swap or add alternatives)

- Next.js (App Router) + TypeScript + Tailwind CSS
- Gemini API, model `gemini-3.5-flash`, called via **plain `fetch`** —
  do NOT install or migrate to the Google SDK.
  (Was `gemini-2.5-flash`, but Google retired it for new-user API keys —
  it now 404s with "no longer available to new users." Switched 2026-07-11.)
- API key: `process.env.GEMINI_API_KEY` (in `.env.local` and Vercel env vars).
  Never expose it client-side; all Gemini calls go through API routes.
- Persistence: **localStorage only.** No database, no ORM, no API for storage.
- Deployment: Vercel, auto-deploys from `main` on GitHub
- No new dependencies without asking first. Approved if needed:
  `canvas-confetti`.

## Hard constraints — the cut list

These are intentionally OUT of scope. Do not add, suggest, or scaffold them:

- Auth / accounts / user management
- Any database or backend persistence
- Social features (sharing, friends, feeds)
- Reading-progress tracking (this app is for FINISHED books only)
- Dark mode
- Native/mobile builds (a React Native rebuild comes AFTER the challenge —
  not now)
- Audio features (ElevenLabs etc.)

If a task seems to require one of these, stop and ask instead of building it.

## Established conventions (match these)

- Gemini vision calls use `responseSchema` + `responseMimeType:
  "application/json"` in `generationConfig` — never parse markdown fences
  out of responses.
- Images are downscaled client-side via `lib/downscaleImage.ts` (max 400px
  longest side, JPEG quality 0.7) BEFORE being sent to the API or stored.
  All stored covers are JPEG data URLs (~30–50KB). Never store full-size
  photos — localStorage has a ~5MB quota.
- localStorage is only read/written inside `useEffect` or event handlers —
  never during render (hydration errors).
- Storage shape: one array under the key `"trophies"`:

  ```ts
  type Trophy = {
    id: string;            // crypto.randomUUID()
    title: string;
    author: string;
    genre: string;
    pageCount: number;
    coverImage: string;    // small JPEG data URL
    inscription?: string;  // AI-generated plaque text (Phase 2)
    addedAt: string;       // ISO date
  };
  ```

- API routes return `{ ok: true, ... }` or `{ ok: false, error: string }`
  with appropriate status codes. Client checks `data.ok`.
- Errors are handled at each layer with user-readable messages — no silent
  failures.

## Current status & roadmap

**Done:**
- Phase 0: scaffold, GitHub + Vercel CD, Gemini connectivity (local + prod)
- Phase 1 checkpoint 1: capture + downscale + preview (`app/add/page.tsx`)
- Phase 1 checkpoint 2: vision route (`app/api/analyze/route.ts`) + analyze
  wiring (verify it works before building on it)

**Remaining Phase 1 (core loop):**
- Checkpoint 3: confirm/edit form pre-filled from the analyze response
  (title, author, genre, pageCount — all editable; AI misreads covers)
- Checkpoint 4: save Trophy to localStorage; render the Shelf as a cover
  grid on `app/page.tsx`
- Exit criteria: 5 real books photographed and visible on the live Vercel URL

**Phase 2 (the magic + polish):**
- Plaque inscriptions: new API route where Gemini writes a 2–3 sentence
  celebratory inscription personal to the book; shown in a modal styled like
  an engraved trophy plaque when tapping a shelf book
- Confetti (`canvas-confetti`) when a trophy is added
- Shelf visual polish: this is the money shot — warm/wooden trophy-cabinet
  aesthetic, hover/tap effects, stats strip (total trophies, total pages)
- Empty state that sells the concept ("Your shelf awaits its first trophy")
- Mobile-first: the primary demo device is a phone

**Phase 3 (Monday): write-up + submission — no new features Monday.**

## Working style

- Small, verifiable steps. After each change, state how to test it
  (which URL, what to click, expected result).
- The developer tests on a real phone against the Vercel URL — keep
  mobile behavior in mind (file input `capture="environment"`, touch
  targets, viewport).
- Commit messages: short imperative ("Add edit form", "Fix hydration error").
- Never commit `.env.local` or any secrets.
- When something is ambiguous, ask a short question instead of guessing big.
