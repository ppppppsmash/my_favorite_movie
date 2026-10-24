import type { Metadata } from "next";
import { Suspense } from "react";
import { getNowPlayingJP, getTopRated, getTrending, getUpcomingJP } from "@/lib/tmdb";
import { PosterGrid } from "@/components/PosterGrid";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdSlot } from "@/components/AdSlot";
import { SectionHeading } from "@/components/SectionHeading";

export const metadata: Metadata = {
  title: "ランキング・新作",
  description: "今週のトレンド、歴代高評価、日本で上映中・公開予定の映画。TMDB のデータを毎日更新。",
  alternates: { canonical: "/ranking" },
};

export default function RankingPage() {
  return (
    <div>
      <Breadcrumbs items={[{ label: "ランキング" }]} />
      <h1 className="display text-[clamp(1.8rem,4vw,2.6rem)]">ランキング・新作</h1>
      <p className="mt-2 text-sm text-muted">TMDB のデータをもとに毎日更新。気になる作品はクリックすると配信状況を確認できます。</p>

      <div className="mt-10 space-y-14">
        <section>
          <SectionHeading title="今週のトレンド" description="世界で今、最も話題になっている作品" />
          <Suspense fallback={<Skeleton />}>
            <Section loader={getTrending} ranked />
          </Suspense>
        </section>

        <AdSlot kind="display" />

        <section>
          <SectionHeading title="日本で上映中" description="現在劇場公開中の作品" />
          <Suspense fallback={<Skeleton />}>
            <Section loader={getNowPlayingJP} />
          </Suspense>
        </section>

        <section>
          <SectionHeading title="公開予定" description="これから日本で公開される作品" />
          <Suspense fallback={<Skeleton />}>
            <Section loader={getUpcomingJP} />
          </Suspense>
        </section>

        <AdSlot kind="display" />

        <section>
          <SectionHeading title="歴代ユーザー評価 TOP20" description="TMDB ユーザー評価の上位作品" />
          <Suspense fallback={<Skeleton />}>
            <Section loader={getTopRated} ranked />
          </Suspense>
        </section>
      </div>
    </div>
  );
}

async function Section({ loader, ranked = false }: { loader: () => Promise<Awaited<ReturnType<typeof getTrending>>>; ranked?: boolean }) {
  const movies = (await loader()).slice(0, 20);
  if (movies.length === 0) return <p className="text-sm text-muted">データを取得できませんでした。</p>;
  return <PosterGrid movies={movies} ranked={ranked} columns="grid-cols-3 sm:grid-cols-5 lg:grid-cols-10" />;
}

function Skeleton() {
  return (
    <div className="grid grid-cols-3 gap-3 sm:grid-cols-5 lg:grid-cols-10">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="aspect-[2/3] animate-pulse rounded-lg bg-elev-2" />
      ))}
    </div>
  );
}
