// app/api/analyze/route.ts
// POST { image: string } where image is a data URL or raw base64 JPEG.
// Returns { ok: true, book: { title, author, genre, pageCount } } or { ok: false, error }.

import { NextResponse } from "next/server";

type BookInfo = {
  title: string;
  author: string;
  genre: string;
  pageCount: number;
};

export async function POST(req: Request) {
  try {
    const { image } = (await req.json()) as { image?: string };

    if (!image || typeof image !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing image" },
        { status: 400 }
      );
    }

    // Accept either a full data URL or raw base64 — strip the prefix if present.
    const base64 = image.includes(",") ? image.split(",")[1] : image;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  inline_data: {
                    mime_type: "image/jpeg",
                    data: base64,
                  },
                },
                {
                  text: "Identify the book shown on this cover. Return its title, author, primary genre, and page count. If the page count is not visible, estimate it from your knowledge of this book or similar books. If you cannot read the author, make your best guess from the title.",
                },
              ],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                author: { type: "STRING" },
                genre: { type: "STRING" },
                pageCount: { type: "INTEGER" },
              },
              required: ["title", "author", "genre", "pageCount"],
            },
          },
        }),
      }
    );

    if (!res.ok) {
      const errText = await res.text();
      console.error("Gemini API error:", res.status, errText);
      return NextResponse.json(
        { ok: false, error: `Gemini API returned ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return NextResponse.json(
        { ok: false, error: "No content in Gemini response" },
        { status: 502 }
      );
    }

    // responseSchema guarantees this is pure JSON — no markdown fences to strip.
    const book = JSON.parse(text) as BookInfo;

    return NextResponse.json({ ok: true, book });
  } catch (err) {
    console.error("Analyze route error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to analyze image" },
      { status: 500 }
    );
  }
}
