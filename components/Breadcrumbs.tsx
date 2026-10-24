import Link from "next/link";
import { absoluteUrl } from "@/lib/site";
import { JsonLd } from "./JsonLd";

export type Crumb = { href?: string; label: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ href: "/", label: "ホーム" }, ...items];
  return (
    <nav aria-label="パンくず" className="no-scrollbar mb-5 overflow-x-auto text-xs text-subtle">
      <ol className="flex items-center gap-1.5 whitespace-nowrap">
        {all.map((c, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {i > 0 && <span aria-hidden>/</span>}
            {c.href && i < all.length - 1 ? (
              <Link href={c.href} className="hover:text-fg">
                {c.label}
              </Link>
            ) : (
              <span className="text-muted">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: all.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, ...(c.href ? { item: absoluteUrl(c.href) } : {}) })),
        }}
      />
    </nav>
  );
}
