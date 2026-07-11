// app/api/inscribe/route.ts
// POST { title, author, genre } -> Gemini writes a short celebratory trophy
// inscription for a finished book.
// Returns { ok: true, inscription: string } or { ok: false, error }.

import { NextResponse } from "next/server";

type InscribeBody = {
  title?: string;
  author?: string;
  genre?: string;
};

export async function POST(req: Request) {
  try {
    const { title, author, genre } = (await req.json()) as InscribeBody;

    if (!title || typeof title !== "string") {
      return NextResponse.json(
        { ok: false, error: "Missing title" },
        { status: 400 }
      );
    }

    const prompt = `Write a warm, celebratory trophy-plaque inscription honoring a reader for finishing this book:

Title: ${title}
Author: ${author || "Unknown"}
Genre: ${genre || "Unknown"}

Write 2-3 sentences. Address the reader directly and second-person ("you"). Evoke the specific spirit, themes, or mood of THIS book — not generic praise. Sound like an engraving on a real trophy: dignified but heartfelt. Do not use the reader's name, hashtags, emoji, or quotation marks.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                inscription: { type: "STRING" },
              },
              required: ["inscription"],
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

    // responseSchema guarantees pure JSON — no markdown fences to strip.
    const { inscription } = JSON.parse(text) as { inscription: string };

    if (!inscription || typeof inscription !== "string") {
      return NextResponse.json(
        { ok: false, error: "Empty inscription in Gemini response" },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, inscription: inscription.trim() });
  } catch (err) {
    console.error("Inscribe route error:", err);
    return NextResponse.json(
      { ok: false, error: "Failed to generate inscription" },
      { status: 500 }
    );
  }
}
