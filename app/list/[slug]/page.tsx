import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/categories";
import { getAllLists, getList, getListsByCategory } from "@/lib/content";
import { getMovieLite } from "@/lib/tmdb";
import { absoluteUrl, site } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { Mdx } from "@/components/Mdx";
import { ListCard } from "@/components/ListCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSkeleton } from "@/components/PageSkeleton";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";

export function generateStaticParams() {
  return getAllLists().map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: PageProps<"/list/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const list = getList(decodeURIComponent(slug));
  if (!list) return {};
  const cover = await getMovieLite(list.cover ?? list.movieIds[0]);
  return {
    title: list.title,
    description: list.description,
    alternates: { canonical: `/list/${list.slug}` },
    openGraph: { type: "article", title: list.title, description: list.description, url: `/list/${list.slug}`, ...(cover?.backdrop ? { images: [{ url: cover.backdrop }] } : {}) },
  };
}

async function ListBody({ params }: { params: PageProps<"/list/[slug]">["params"] }) {
  const { slug } = await params;
  const list = getList(decodeURIComponent(slug));
  if (!list) notFound();
  const cat = getCategory(list.category);
  const cover = await getMovieLite(list.cover ?? list.movieIds[0]);
  const related = getListsByCategory(list.category)
    .filter((l) => l.slug !== list.slug)
    .slice(0, 3);
  const movies = (await Promise.all(list.movieIds.map(getMovieLite))).filter(Boolean);

  return (
    <article>
      <Breadcrumbs items={[{ href: "/lists", label: "リスト" }, ...(cat ? [{ href: `/lists/${cat.slug}`, label: cat.title }] : []), { label: list.title }]} />

      <header className="relative -mx-5 overflow-hidden sm:mx-0 sm:rounded-2xl">
        {cover?.backdrop && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={cover.backdrop} alt="" width={1280} height={720} className="h-full w-full object-cover opacity-70" />
            <div className="fade-bottom absolute inset-0" />
            <div className="fade-left absolute inset-0" />
          </div>
        )}
        <div className="relative px-5 pb-6 pt-24 sm:px-10 sm:pb-10 sm:pt-32">
          {cat && (
            <Link href={`/lists/${cat.slug}`} className="eyebrow">
              {cat.title}
            </Link>
          )}
          <h1 className="display mt-3 text-[clamp(1.8rem,5vw,3.4rem)]">{list.title}</h1>
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#d4d4d4]">{list.description}</p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted">
            <span>{list.movieIds.length}作品</span>
            <span>{formatDate(list.updated ?? list.date)} 更新</span>
            {list.tags.map((t) => (
              <span key={t} className="rounded-full border border-line px-2 py-0.5">
                #{t}
              </span>
            ))}
          </div>
          {movies.length > 0 && (
            <div className="no-scrollbar hscroll mt-6 flex gap-2">
              {movies.slice(0, 12).map((m) => (
                <a key={m!.id} href={`#movie-${m!.id}`} className="pressable poster w-12 shrink-0 overflow-hidden opacity-95 hover:opacity-100 sm:w-14" title={m!.title}>
                  {m!.poster ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={m!.poster} alt={m!.title} width={342} height={513} loading="lazy" className="aspect-[2/3] w-full object-cover" />
                  ) : (
                    <div className="aspect-[2/3] w-full bg-elev-2" />
                  )}
                </a>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_320px] [&>*]:min-w-0">
        <div className="prose prose-invert max-w-none break-words">
          <Mdx source={list.body} ordered={list.ordered} adEvery={6} />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <AdSlot kind="display" className="my-0" />
          {related.length > 0 && (
            <div>
              <p className="eyebrow mb-3">同じカテゴリのリスト</p>
              <div className="grid gap-3">
                {related.map((l) => (
                  <ListCard key={l.slug} list={l} showCategory={false} />
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-16 lg:hidden">
          <SectionHeading title="同じカテゴリのリスト" href={cat ? `/lists/${cat.slug}` : "/lists"} more="もっと見る" />
          <div className="grid gap-4 sm:grid-cols-2">
            {related.map((l) => (
              <ListCard key={l.slug} list={l} showCategory={false} />
            ))}
          </div>
        </section>
      )}

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          name: list.title,
          description: list.description,
          url: absoluteUrl(`/list/${list.slug}`),
          numberOfItems: movies.length,
          itemListOrder: list.ordered ? "https://schema.org/ItemListOrderAscending" : "https://schema.org/ItemListUnordered",
          itemListElement: movies.map((m, i) => ({
            "@type": "ListItem",
            position: i + 1,
            url: absoluteUrl(`/movie/${m!.id}`),
            item: { "@type": "Movie", name: m!.title, ...(m!.poster ? { image: m!.poster } : {}), ...(m!.year ? { dateCreated: m!.year } : {}) },
          })),
          author: { "@type": "Organization", name: site.author },
          datePublished: list.date,
          dateModified: list.updated ?? list.date,
        }}
      />
    </article>
  );
}

/** The URL-specific body streams into a Suspense boundary so the app shell renders instantly. */
export default function ListPage({ params }: PageProps<"/list/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton hero />}>
      <ListBody params={params} />
    </Suspense>
  );
}
