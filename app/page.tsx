import Link from "next/link";
import { Suspense } from "react";
import { site } from "@/lib/site";
import { categories } from "@/lib/categories";
import { getAllLists, getAllPosts, getListsByCategory, getListsContainingMovie } from "@/lib/content";
import { getHeroMovie, getTrending, runtimeLabel } from "@/lib/tmdb";
import { ListCard } from "@/components/ListCard";
import { PostCard } from "@/components/PostCard";
import { RankedRail } from "@/components/PosterGrid";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { Rail, SectionHeading } from "@/components/SectionHeading";

const FEATURED_SLUGS = ["start-here-20", "plot-twist", "rainy-day-comfort", "best-2023-2024", "star-wars-viewing-order", "korean-cinema", "christopher-nolan", "sf-essentials"];

export default function HomePage() {
  const all = getAllLists();
  const featured = FEATURED_SLUGS.map((s) => all.find((l) => l.slug === s)).filter(Boolean) as typeof all;
  const posts = getAllPosts().slice(0, 3);

  return (
    <div className="space-y-16">
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: site.name, url: site.url, description: site.description, inLanguage: "ja" }} />

      <Suspense fallback={<div className="bleed -mt-6 h-[72svh] min-h-[520px] animate-pulse bg-elev" />}>
        <Hero />
      </Suspense>

      <nav className="no-scrollbar hscroll hidden gap-2 md:flex" aria-label="カテゴリ">
        {categories.map((c) => (
          <Link key={c.slug} href={`/lists/${c.slug}`} className="pressable control shrink-0 rounded-full border border-line px-3.5 py-1.5 text-[13px] text-muted hover:border-line-strong hover:text-fg">
            {c.short}
          </Link>
        ))}
      </nav>

      <section>
        <SectionHeading title="まずはここから" href="/lists/featured" more="特集をすべて見る" />
        <Rail>
          {featured.map((l) => (
            <ListCard key={l.slug} list={l} rail />
          ))}
        </Rail>
      </section>

      <section>
        <SectionHeading title="今週のトレンド" href="/ranking" more="ランキング" />
        <Suspense fallback={<div className="h-64 animate-pulse rounded-xl bg-elev" />}>
          <TrendingRail />
        </Suspense>
      </section>

      <AdSlot kind="display" />

      {categories
        .filter((c) => c.slug !== "featured")
        .map((c) => {
          const lists = getListsByCategory(c.slug).slice(0, 8);
          if (lists.length === 0) return null;
          return (
            <section key={c.slug}>
              <SectionHeading title={c.title} description={c.description} href={`/lists/${c.slug}`} more="もっと見る" />
              <Rail>
                {lists.map((l) => (
                  <ListCard key={l.slug} list={l} showCategory={false} rail />
                ))}
              </Rail>
            </section>
          );
        })}

      {posts.length > 0 && (
        <section>
          <SectionHeading title="記事" href="/posts" more="記事一覧" />
          <div className="grid gap-4 md:grid-cols-3">
            {posts.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}

      <AdSlot kind="display" />
    </div>
  );
}

/** Full-bleed "今夜の一本" hero. The featured film rotates daily (see getHeroMovie). */
async function Hero() {
  const m = await getHeroMovie();
  if (!m) return null;
  const inLists = getListsContainingMovie(m.id).slice(0, 2);
  const meta = [m.year, runtimeLabel(m.runtime), m.genres.slice(0, 2).join(" · ")].filter(Boolean).join("  ·  ");

  return (
    <section className="bleed relative -mt-6 h-[78svh] min-h-[540px] overflow-hidden">
      {m.backdrop && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={m.backdrop.replace("/w1280/", "/original/")} alt="" fetchPriority="high" className="absolute inset-0 h-full w-full object-cover object-[center_20%]" />
      )}
      <div className="fade-bottom absolute inset-0" />
      <div className="fade-left absolute inset-0" />
      <div className="relative mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-12 sm:px-8 sm:pb-16">
        <p className="eyebrow mb-4 !text-muted">今夜の一本</p>
        <h1 className="display max-w-3xl text-[clamp(2.4rem,7vw,5rem)]">{m.title}</h1>
        <p className="mt-4 text-[13px] text-muted">{meta}</p>
        {m.overview && <p className="mt-4 line-clamp-2 max-w-xl text-[15px] leading-relaxed text-[#d4d4d4]">{m.overview}</p>}
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <Link href={`/movie/${m.id}`} className="pressable inline-flex h-11 items-center rounded-full bg-fg px-6 text-[14px] font-semibold text-bg hover:bg-white/90">
            作品ページへ
          </Link>
          {m.trailerKey && (
            <a href={`https://www.youtube.com/watch?v=${m.trailerKey}`} target="_blank" rel="noopener noreferrer" className="pressable inline-flex h-11 items-center gap-2 rounded-full border border-white/20 bg-white/5 px-5 text-[14px] backdrop-blur hover:bg-white/10">
              ▶ 予告編
            </a>
          )}
          {m.rating > 0 && (
            <span className="ml-1 text-[14px] text-muted">
              <span className="text-star">★</span> {m.rating.toFixed(1)}
            </span>
          )}
          {inLists.map((l) => (
            <Link key={l.slug} href={`/list/${l.slug}`} className="hidden text-[13px] text-muted underline-offset-4 hover:underline sm:inline">
              {l.title}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

async function TrendingRail() {
  const movies = (await getTrending()).slice(0, 10);
  if (movies.length === 0) return null;
  return <RankedRail movies={movies} />;
}
