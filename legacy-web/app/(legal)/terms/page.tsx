// app/(legal)/terms/page.tsx
// Terms of Use. Linked from the mobile app's Settings screen. Written in
// plain, simple English.

import type { Metadata } from "next";
import Link from "next/link";
import {
  APP_NAME,
  DEVELOPER_NAME,
  GOVERNING_COURTS,
  GOVERNING_LAW,
  SUPPORT_EMAIL,
} from "@/lib/legal";
import { Bullets, ExternalLink, PageTitle, Section } from "../parts";

export const metadata: Metadata = {
  title: `Terms of Use · ${APP_NAME}`,
  description: `The rules for using ${APP_NAME}.`,
};

export default function TermsPage() {
  return (
    <>
      <PageTitle>Terms of Use</PageTitle>

      <Section title="Agreement">
        <p>
          These terms are an agreement between you and {DEVELOPER_NAME}{" "}
          (&quot;we&quot;, &quot;us&quot;), the developer of {APP_NAME}. By
          using the app or this website, you agree to these terms. If you do
          not agree, please do not use {APP_NAME}.
        </p>
      </Section>

      <Section title="The service">
        <p>
          {APP_NAME} helps you keep a shelf of the books you read. It can read
          a book cover with AI and write a short plaque for each book you
          finish. The app is free. We may change, pause or stop any part of it
          at any time.
        </p>
      </Section>

      <Section title="AI content can be wrong">
        <p>
          Book details read from a cover, and plaque texts, are made by AI
          (Google Gemini). They can be wrong, incomplete or strange. Please
          check the details before you save a book. You can edit them at any
          time.
        </p>
      </Section>

      <Section title="Your content">
        <p>
          Your photos, notes and book lists belong to you. You allow us to send
          a cover photo or book details to Google Gemini only to give you the
          AI features. See the{" "}
          <Link href="/privacy" className="text-[#a06f24] underline">
            Privacy Policy
          </Link>{" "}
          for details.
        </p>
        <p>
          Your books are saved only on your device. You are responsible for
          keeping your device and its data safe. We cannot restore lost data.
        </p>
      </Section>

      <Section title="Fair use">
        <p>When you use {APP_NAME}, please do not:</p>
        <Bullets>
          <li>
            Send too many requests, or try to get around our rate limits or
            other protections.
          </li>
          <li>
            Use our server or its AI features for anything other than the app.
          </li>
          <li>
            Upload photos of people, private documents, or anything illegal or
            harmful.
          </li>
          <li>Try to break, copy or reverse engineer our service.</li>
        </Bullets>
        <p>
          If you break these rules, we may block your access to the AI
          features.
        </p>
      </Section>

      <Section title="Our app">
        <p>
          The {APP_NAME} name, design and written content belong to{" "}
          {DEVELOPER_NAME}. Some parts of the app use open-source software,
          which is covered by its own licences.
        </p>
      </Section>

      <Section title="Other services">
        <p>
          {APP_NAME} uses services from other companies, such as Google
          Gemini, Vercel, Upstash, Apple and Google Play. Their own terms also
          apply, for example the{" "}
          <ExternalLink href="https://ai.google.dev/gemini-api/terms">
            Gemini API Additional Terms of Service
          </ExternalLink>
          . We are not responsible for these services.
        </p>
      </Section>

      <Section title="No warranty">
        <p>
          We provide {APP_NAME} &quot;as is&quot; and &quot;as available&quot;.
          We do not promise that it will always work, be error-free, or be
          available. Nothing in these terms removes rights you have under the
          Australian Consumer Law that cannot be removed.
        </p>
      </Section>

      <Section title="Limit of liability">
        <p>
          To the extent allowed by law, including the Australian Consumer Law,
          we are not responsible for any loss or damage that comes from using
          {" "}{APP_NAME}, including lost data. Where the law does not allow us
          to exclude liability, our liability is limited to supplying the
          service again.
        </p>
      </Section>

      <Section title="Stopping use">
        <p>
          You can stop using {APP_NAME} at any time by deleting the app. We may
          stop offering the app or the AI features at any time.
        </p>
      </Section>

      <Section title="Governing law">
        <p>
          These terms are governed by {GOVERNING_LAW}. Any dispute will be
          handled by {GOVERNING_COURTS}.
        </p>
      </Section>

      <Section title="Changes to these terms">
        <p>
          We may change these terms when the app changes. We will update the
          &quot;Last updated&quot; date at the top of this page. If you keep
          using {APP_NAME} after a change, you accept the new terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          {DEVELOPER_NAME} ·{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#a06f24] underline">
            {SUPPORT_EMAIL}
          </a>
        </p>
      </Section>
    </>
  );
}
