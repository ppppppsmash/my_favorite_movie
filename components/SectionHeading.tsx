import Link from "next/link";

export function SectionHeading({ eyebrow, title, description, href, more, as: Tag = "h2" }: { eyebrow?: string; title: string; description?: string; href?: string; more?: string; as?: "h1" | "h2" }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <Tag className="font-display text-[20px] font-bold tracking-[-0.02em] sm:text-[22px]">{title}</Tag>
        {description && <p className="mt-1 text-[13px] text-muted">{description}</p>}
      </div>
      {href && more && (
        <Link href={href} className="pressable control shrink-0 text-[13px] text-muted hover:text-fg">
          {more} →
        </Link>
      )}
    </div>
  );
}

/** Horizontal, snap-scrolling row of cards. */
export function Rail({ children }: { children: React.ReactNode }) {
  return <div className="no-scrollbar hscroll -mx-5 flex gap-4 px-5 pb-2 sm:mx-0 sm:px-0">{children}</div>;
}
