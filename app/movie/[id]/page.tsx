import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllMovieIds, getListsContainingMovie, getPostsContainingMovie } from "@/lib/content";
import { getMovie, runtimeLabel, votesLabel } from "@/lib/tmdb";
import { absoluteUrl } from "@/lib/site";
import { Stars } from "@/components/Stars";
import { PosterGrid } from "@/components/PosterGrid";
import { WatchProviders } from "@/components/WatchProviders";
import { ListCard } from "@/components/ListCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSkeleton } from "@/components/PageSkeleton";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";

export function generateStaticParams() {
  return getAllMovieIds().map((id) => ({ id: String(id) }));
}

export async function generateMetadata({ params }: PageProps<"/movie/[id]">): Promise<Metadata> {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) return {};
  const m = await getMovie(n);
  if (!m) return {};
  const title = `${m.title}${m.year ? ` (${m.year})` : ""}`;
  const description = `${m.title}の作品情報、評価、配信状況。${m.overview.slice(0, 90)}`;
  return {
    title: `${title} - 作品情報・配信状況`,
    description,
    alternates: { canonical: `/movie/${m.id}` },
    openGraph: { type: "video.movie", title, description, url: `/movie/${m.id}`, ...(m.backdrop ? { images: [{ url: m.backdrop }] } : m.poster ? { images: [{ url: m.poster }] } : {}) },
  };
}

async function MovieBody({ params }: { params: PageProps<"/movie/[id]">["params"] }) {
  const { id } = await params;
  const n = Number(id);
  if (!Number.isInteger(n) || n <= 0) notFound();
  const m = await getMovie(n);
  if (!m) notFound();
  const lists = getListsContainingMovie(n);
  const posts = getPostsContainingMovie(n);

  return (
    <article>
      <Breadcrumbs items={[{ href: "/lists", label: "リスト" }, { label: m.title }]} />

      <header className="relative -mx-5 overflow-hidden sm:mx-0 sm:rounded-2xl">
        {m.backdrop && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={m.backdrop} alt="" width={1280} height={720} className="h-full w-full object-cover" />
            <div className="fade-bottom absolute inset-0" />
            <div className="fade-left absolute inset-0" />
          </div>
        )}
        <div className="relative flex flex-col gap-6 px-5 pb-6 pt-16 sm:flex-row sm:px-8 sm:pt-28">
          <div className="w-36 shrink-0 sm:w-56">
            {m.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.poster.replace("/w342/", "/w500/")} alt={`${m.title} ポスター`} width={500} height={750} className="poster aspect-[2/3] w-full !rounded-xl object-cover" />
            ) : (
              <div className="poster flex aspect-[2/3] w-full items-center justify-center !rounded-xl text-xs text-muted">No image</div>
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <h1 className="display text-[clamp(1.6rem,4vw,2.75rem)]">
              {m.title}
              {m.year && <span className="ml-2 text-lg font-normal tracking-normal text-muted sm:text-2xl">{m.year}</span>}
            </h1>
            {m.originalTitle && m.originalTitle !== m.title && <p className="mt-1 text-sm text-muted">{m.originalTitle}</p>}
            {m.tagline && <p className="mt-3 text-sm italic text-muted">“{m.tagline}”</p>}
            <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
              {m.rating > 0 && (
                <span className="inline-flex items-center gap-2">
                  <Stars value={m.rating} />
                  <b className="font-display text-lg">{m.rating.toFixed(1)}</b>
                  <span className="text-xs text-muted">{votesLabel(m.votes)}件の評価 (TMDB)</span>
                </span>
              )}
            </div>
            <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-5 gap-y-1.5 text-sm">
              {m.genres.length > 0 && (
                <>
                  <dt className="text-muted">ジャンル</dt>
                  <dd>{m.genres.join(" / ")}</dd>
                </>
              )}
              {m.runtime && (
                <>
                  <dt className="text-muted">上映時間</dt>
                  <dd>{runtimeLabel(m.runtime)}</dd>
                </>
              )}
              {m.releaseDate && (
                <>
                  <dt className="text-muted">公開</dt>
                  <dd>
                    {m.releaseDate}
                    {m.countries.length > 0 && <span className="text-muted"> ({m.countries.join(", ")})</span>}
                  </dd>
                </>
              )}
              {m.directors.length > 0 && (
                <>
                  <dt className="text-muted">監督</dt>
                  <dd>{m.directors.map((d) => d.name).join("、")}</dd>
                </>
              )}
              {m.writers.length > 0 && (
                <>
                  <dt className="text-muted">脚本</dt>
                  <dd>{m.writers.map((d) => d.name).join("、")}</dd>
                </>
              )}
            </dl>
            <div className="mt-5 flex flex-wrap gap-2 text-xs">
              {m.trailerKey && (
                <a href={`https://www.youtube.com/watch?v=${m.trailerKey}`} target="_blank" rel="noopener noreferrer" className="pressable inline-flex items-center gap-1.5 rounded-full bg-fg px-4 py-2 font-semibold text-bg hover:bg-white/90">
                  ▶ 予告編を見る
                </a>
              )}
              <a href={`https://www.themoviedb.org/movie/${m.id}?language=ja-JP`} target="_blank" rel="noopener noreferrer" className="pressable inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3.5 py-2 font-medium text-muted backdrop-blur hover:bg-white/10 hover:text-fg">
                TMDB
              </a>
              {m.imdbId && (
                <a href={`https://www.imdb.com/title/${m.imdbId}/`} target="_blank" rel="noopener noreferrer" className="pressable inline-flex items-center rounded-full border border-white/20 bg-white/5 px-3.5 py-2 font-medium text-muted backdrop-blur hover:bg-white/10 hover:text-fg">
                  IMDb
                </a>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px] [&>*]:min-w-0">
        <div className="space-y-10">
          {m.overview && (
            <section>
              <h2 className="eyebrow mb-2">あらすじ</h2>
              <p className="text-sm leading-relaxed sm:text-base">{m.overview}</p>
            </section>
          )}

          {m.cast.length > 0 && (
            <section>
              <h2 className="eyebrow mb-3">キャスト</h2>
              <ul className="no-scrollbar hscroll flex gap-3 pb-2">
                {m.cast.map((c) => (
                  <li key={c.id} className="w-20 shrink-0 text-center">
                    {c.profile ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.profile} alt={c.name} width={185} height={278} loading="lazy" className="poster mx-auto aspect-[2/3] w-full object-cover" />
                    ) : (
                      <div className="poster mx-auto aspect-[2/3] w-full" />
                    )}
                    <p className="mt-1.5 line-clamp-2 text-xs font-medium leading-tight">{c.name}</p>
                    {c.character && <p className="line-clamp-1 text-[10px] text-subtle">{c.character}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <AdSlot kind="article" />

          {lists.length > 0 && (
            <section>
              <SectionHeading title="この作品が入っているリスト" />
              <div className="grid gap-4 sm:grid-cols-2">
                {lists.map((l) => (
                  <ListCard key={l.slug} list={l} />
                ))}
              </div>
            </section>
          )}

          {posts.length > 0 && (
            <section>
              <h2 className="eyebrow mb-3">関連記事</h2>
              <ul className="space-y-2">
                {posts.map((p) => (
                  <li key={p.slug}>
                    <Link href={`/post/${p.slug}`} className="text-sm underline-offset-4 hover:underline">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {m.similar.length > 0 && (
            <section>
              <SectionHeading title="似ている作品" />
              <PosterGrid movies={m.similar} columns="grid-cols-4 sm:grid-cols-4 md:grid-cols-8" />
            </section>
          )}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <WatchProviders movie={m} />
          <AdSlot kind="display" className="my-0" />
        </aside>
      </div>

      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Movie",
          name: m.title,
          ...(m.originalTitle ? { alternateName: m.originalTitle } : {}),
          url: absoluteUrl(`/movie/${m.id}`),
          ...(m.poster ? { image: m.poster } : {}),
          ...(m.overview ? { description: m.overview } : {}),
          ...(m.releaseDate ? { datePublished: m.releaseDate } : {}),
          ...(m.runtime ? { duration: `PT${m.runtime}M` } : {}),
          genre: m.genres,
          director: m.directors.map((d) => ({ "@type": "Person", name: d.name })),
          actor: m.cast.slice(0, 5).map((c) => ({ "@type": "Person", name: c.name })),
          ...(m.votes > 0 ? { aggregateRating: { "@type": "AggregateRating", ratingValue: m.rating, bestRating: 10, ratingCount: m.votes } } : {}),
        }}
      />
    </article>
  );
}

/** The URL-specific body streams into a Suspense boundary so the app shell renders instantly. */
export default function MoviePage({ params }: PageProps<"/movie/[id]">) {
  return (
    <Suspense fallback={<PageSkeleton hero />}>
      <MovieBody params={params} />
    </Suspense>
  );
}
