import type { Metadata } from "next";
import Link from "next/link";
import { categories } from "@/lib/categories";
import { getListsByCategory } from "@/lib/content";
import { ListCard } from "@/components/ListCard";
import { SectionHeading } from "@/components/SectionHeading";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "すべてのリスト",
  description: "ジャンル、テーマ、監督、受賞歴。カテゴリ別の映画リスト一覧。",
  alternates: { canonical: "/lists" },
};

export default function ListsIndexPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "リスト" }]} />
      <h1 className="display text-[clamp(1.8rem,4vw,2.6rem)]">すべてのリスト</h1>
      <p className="mt-2 text-sm text-muted">カテゴリから探す。各カテゴリのページでは、そのカテゴリの全リストを表示します。</p>
      <nav className="mt-6 flex flex-wrap gap-2" aria-label="カテゴリ">
        {categories.map((c) => (
          <a key={c.slug} href={`#${c.slug}`} className="pressable control rounded-full border border-line px-3 py-1.5 text-sm text-muted hover:border-line-strong hover:text-fg">
            {c.short}
          </a>
        ))}
      </nav>
      <div className="mt-12 space-y-16">
        {categories.map((c, i) => {
          const lists = getListsByCategory(c.slug);
          if (lists.length === 0) return null;
          return (
            <section key={c.slug} id={c.slug} className="scroll-mt-24">
              <SectionHeading title={c.title} description={c.description} href={`/lists/${c.slug}`} more={`${lists.length}本すべて`} />
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {lists.slice(0, 8).map((l) => (
                  <ListCard key={l.slug} list={l} showCategory={false} />
                ))}
              </div>
              {lists.length > 8 && (
                <Link href={`/lists/${c.slug}`} className="mt-4 inline-block text-sm text-muted underline-offset-4 hover:text-fg hover:underline">
                  残り{lists.length - 8}本を見る →
                </Link>
              )}
              {i === 2 && <AdSlot kind="display" />}
            </section>
          );
        })}
      </div>
    </div>
  );
}
