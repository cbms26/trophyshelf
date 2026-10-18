// app/(legal)/privacy/page.tsx
// Privacy Policy. Linked from the mobile app's Settings screen and required
// for the App Store and Google Play listings. Written in plain, simple English.

import type { Metadata } from "next";
import {
  APP_NAME,
  DEVELOPER_NAME,
  SUPPORT_EMAIL,
} from "@/lib/legal";
import { Bullets, ExternalLink, PageTitle, Section } from "../parts";

export const metadata: Metadata = {
  title: `Privacy Policy · ${APP_NAME}`,
  description: `How ${APP_NAME} handles your data.`,
};

export default function PrivacyPage() {
  return (
    <>
      <PageTitle>Privacy Policy</PageTitle>

      <Section title="Who we are">
        <p>
          {APP_NAME} is an app for keeping a shelf of the books you read. It is
          made and run by {DEVELOPER_NAME}, an independent developer in
          Australia. In this policy, &quot;we&quot; and &quot;us&quot; mean{" "}
          {DEVELOPER_NAME}.
        </p>
        <p>
          If you have a question about your privacy, email{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-[#a06f24] underline">
            {SUPPORT_EMAIL}
          </a>
          .
        </p>
      </Section>

      <Section title="The short version">
        <Bullets>
          <li>Your books, notes and cover photos stay on your device.</li>
          <li>There are no accounts. We do not ask for your name or email.</li>
          <li>There are no ads, no analytics and no tracking.</li>
          <li>We do not sell or rent your data to anyone.</li>
          <li>
            When you use the AI features, a cover photo or book details are
            sent to Google Gemini to do the work.
          </li>
          <li>
            When you chat with the Librarian, your message and your book list
            are sent to Google Gemini and Google Books. Your chat history stays
            on your device.
          </li>
        </Bullets>
      </Section>

      <Section title="Data on your device">
        <p>
          Your book list, reading progress, notes, plaque texts, cover photos
          and Librarian chat history are saved only on your device. In the mobile app they are
          saved in the app&apos;s own storage. On the website they are saved in
          your browser&apos;s local storage.
        </p>
        <p>
          We cannot see this data. We do not have a copy of it, and we cannot
          get it back for you if it is lost.
        </p>
      </Section>

      <Section title="Data sent to our server">
        <p>The app sends data to our server only for its three AI features:</p>
        <Bullets>
          <li>
            <strong>Reading a cover.</strong> When you add a book from a photo,
            the app makes the photo smaller and sends it to our server. The
            server asks Google Gemini to read the title, author, genre and page
            count.
          </li>
          <li>
            <strong>Writing a plaque.</strong> When you finish a book, the app
            sends its title, author and genre. The server asks Google Gemini to
            write a short plaque text.
          </li>
          <li>
            <strong>Chatting with the Librarian.</strong> When you send a
            message, the app sends it with your recent chat messages and the
            title, author, genre, status, finish date and note of each book on
            your shelf. Covers are never sent. The server asks Google Gemini
            to answer, and searches Google Books for real books to recommend.
            Only search words chosen by Gemini (such as a genre or author) are
            sent to Google Books.
          </li>
        </Bullets>
        <p>
          Our server passes this data to Google and sends the answer back to
          your device. Our server does not save the photo, the book details or
          your chat messages.
        </p>
        <p>
          If you type a book&apos;s details yourself, no photo is sent. If the
          AI is not available, the app writes a plaque on your device instead.
        </p>
      </Section>

      <Section title="Google Gemini">
        <p>
          Google processes the photos and book details we send under the{" "}
          <ExternalLink href="https://ai.google.dev/gemini-api/terms">
            Gemini API Additional Terms of Service
          </ExternalLink>{" "}
          and the{" "}
          <ExternalLink href="https://policies.google.com/privacy">
            Google Privacy Policy
          </ExternalLink>
          . Depending on the service plan, Google may keep this data for a
          limited time, and may use it to improve its products. Google Books
          searches are covered by the{" "}
          <ExternalLink href="https://developers.google.com/books/terms">
            Google Books APIs Terms of Service
          </ExternalLink>
          .
        </p>
        <p>
          Please only photograph book covers. Do not photograph people,
          documents or anything private.
        </p>
      </Section>

      <Section title="IP addresses and logs">
        <p>
          Like most online services, our server sees your device&apos;s IP
          address when the app sends a request. We use it in two ways:
        </p>
        <Bullets>
          <li>
            <strong>Rate limits.</strong> To stop misuse, we count how many
            requests come from each IP address in one minute and in one day.
            These counts are kept by our provider Upstash and expire after the
            time window ends.
          </li>
          <li>
            <strong>Server logs.</strong> Our hosting provider Vercel keeps
            standard logs (for example, IP address, time and errors). We use
            them only to keep the service safe and to fix problems.
          </li>
        </Bullets>
      </Section>

      <Section title="Permissions">
        <Bullets>
          <li>
            <strong>Camera:</strong> to take a photo of a book cover.
          </li>
          <li>
            <strong>Photos:</strong> to pick a cover photo you already have.
          </li>
        </Bullets>
        <p>
          Both are optional. You can always type a book&apos;s details instead.
          You can change these permissions at any time in your device
          settings.
        </p>
      </Section>

      <Section title="Sharing">
        <p>
          When you tap a share button, the app opens your device&apos;s share
          menu. You choose where the image or text goes. We do not see what you
          share.
        </p>
      </Section>

      <Section title="Children">
        <p>
          {APP_NAME} is not made for children under 13. We do not knowingly
          collect personal information from children.
        </p>
      </Section>

      <Section title="Deleting your data">
        <p>
          To delete a book, open it, tap &quot;…&quot; and choose Remove. To
          delete your chat history, open the Librarian and tap Clear. To
          delete everything, uninstall the app (or clear your browser&apos;s
          site data for the website). Because we do not keep your books, there
          is nothing else to delete on our side.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          We follow the Australian Privacy Principles in the Privacy Act 1988.
          You can ask us what personal information we hold about you, and ask
          us to correct it. As explained above, we hold almost none. If you are
          not happy with our answer, you can contact the{" "}
          <ExternalLink href="https://www.oaic.gov.au">
            Office of the Australian Information Commissioner
          </ExternalLink>
          .
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may change this policy when the app changes. We will update the
          &quot;Last updated&quot; date at the top of this page.
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
