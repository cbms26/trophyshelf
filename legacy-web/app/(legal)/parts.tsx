// app/(legal)/parts.tsx
// Small building blocks shared by the Privacy Policy and Terms of Use pages.
// The font variables come from app/(legal)/layout.tsx.

export function PageTitle({ children }: { children: React.ReactNode }) {
  return (
    <h1 className="text-4xl leading-tight [font-family:var(--font-cormorant)]">
      {children}
    </h1>
  );
}

export function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-2xl leading-snug [font-family:var(--font-cormorant)]">
        {title}
      </h2>
      {children}
    </section>
  );
}

export function Bullets({ children }: { children: React.ReactNode }) {
  return <ul className="flex list-disc flex-col gap-2 pl-5">{children}</ul>;
}

export function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-[#a06f24] underline"
    >
      {children}
    </a>
  );
}
