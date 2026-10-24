import Link from "next/link";
import { categories } from "@/lib/categories";
import { SearchButton } from "./SearchPalette";

const NAV = [
  { href: "/lists", label: "リスト" },
  { href: "/posts", label: "記事" },
  { href: "/ranking", label: "ランキング" },
];

export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-40" style={{ paddingTop: "env(safe-area-inset-top)" }}>
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-5 sm:px-8">
        <Link href="/" className="pressable control font-display text-[15px] font-semibold tracking-[0.18em]">
          CINELIST
        </Link>
        <nav className="hidden items-center gap-6 md:flex" aria-label="メイン">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="pressable control text-[13px] text-muted hover:text-fg">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <SearchButton />
        </div>
      </div>
      <div className="no-scrollbar hscroll mx-auto flex max-w-7xl gap-2 px-5 pb-3 md:hidden">
        {categories.map((c) => (
          <Link key={c.slug} href={`/lists/${c.slug}`} className="pressable control shrink-0 rounded-full border border-line px-3 py-1 text-xs text-muted hover:border-line-strong hover:text-fg">
            {c.short}
          </Link>
        ))}
      </div>
    </header>
  );
}
