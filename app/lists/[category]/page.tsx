import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { categories, getCategory } from "@/lib/categories";
import { getListsByCategory } from "@/lib/content";
import { ListCard } from "@/components/ListCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSkeleton } from "@/components/PageSkeleton";
import { AdSlot } from "@/components/AdSlot";

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/lists/[category]">): Promise<Metadata> {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) return {};
  return { title: c.title, description: c.description, alternates: { canonical: `/lists/${c.slug}` } };
}

async function CategoryBody({ params }: { params: PageProps<"/lists/[category]">["params"] }) {
  const { category } = await params;
  const c = getCategory(category);
  if (!c) notFound();
  const lists = getListsByCategory(c.slug);

  return (
    <div>
      <Breadcrumbs items={[{ href: "/lists", label: "リスト" }, { label: c.title }]} />
      <h1 className="display text-[clamp(1.8rem,4vw,2.6rem)]">{c.title}</h1>
      <p className="mt-2 max-w-2xl text-sm text-muted">{c.description}</p>
      <p className="mt-1 text-xs text-muted">{lists.length}本のリスト</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {lists.map((l, i) => (
          <ListCard key={l.slug} list={l} showCategory={false} priority={i < 3} />
        ))}
      </div>
      <AdSlot kind="display" />
    </div>
  );
}

/** The URL-specific body streams into a Suspense boundary so the app shell renders instantly. */
export default function CategoryPage({ params }: PageProps<"/lists/[category]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <CategoryBody params={params} />
    </Suspense>
  );
}
