// app/(legal)/layout.tsx
// Shared shell for /privacy and /terms. These pages open from the mobile
// app's Settings screen, so they use the app's "private library" look
// (paper background, gold accent, serif headings) instead of the walnut
// theme of the original web app.

import Link from "next/link";
import { Cormorant_Garamond, Lora } from "next/font/google";
import { APP_NAME, LAST_UPDATED } from "@/lib/legal";

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  weight: "600",
  subsets: ["latin"],
});

const lora = Lora({
  variable: "--font-lora",
  subsets: ["latin"],
});

export default function LegalLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div
      className={`${cormorant.variable} ${lora.variable} flex-1 bg-[#f3f2f2] text-[#201f1d] [font-family:var(--font-lora)]`}
    >
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-5 pb-16 pt-10 sm:px-8">
        <header className="flex flex-col gap-1 border-b border-[#d6d3d2] pb-4">
          <Link
            href="/"
            className="text-xs uppercase tracking-[0.2em] text-[#b68235]"
          >
            {APP_NAME}
          </Link>
          <p className="text-xs text-[#7d7c78]">Last updated {LAST_UPDATED}</p>
        </header>

        <main className="flex flex-col gap-8 text-[15px] leading-relaxed">
          {children}
        </main>

        <footer className="flex gap-6 border-t border-[#d6d3d2] pt-4 text-sm">
          <Link href="/privacy" className="text-[#a06f24] hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms" className="text-[#a06f24] hover:underline">
            Terms of Use
          </Link>
        </footer>
      </div>
    </div>
  );
}
