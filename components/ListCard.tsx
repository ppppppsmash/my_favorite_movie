import Link from "next/link";
import type { ListMeta } from "@/lib/content";
import { getCategory } from "@/lib/categories";
import { getMovieLite } from "@/lib/tmdb";

/**
 * Noir list card: a wide backdrop still with the title set over a bottom fade.
 * `rail` makes it a fixed-width snap item for horizontal rails.
 */
export async function ListCard({ list, showCategory = true, rail = false }: { list: ListMeta; showCategory?: boolean; rail?: boolean; priority?: boolean }) {
  const ids = list.cover ? [list.cover, ...list.movieIds.filter((i) => i !== list.cover)] : list.movieIds;
  const movies = (await Promise.all(ids.slice(0, 4).map(getMovieLite))).filter(Boolean);
  const backdrop = movies.find((m) => m!.backdrop)?.backdrop ?? null;
  const cat = getCategory(list.category);

  return (
    <Link href={`/list/${list.slug}`} className={`card group relative block overflow-hidden rounded-xl bg-elev ${rail ? "w-[300px] shrink-0 sm:w-[360px]" : ""}`}>
      <div className="relative aspect-[16/9]">
        {backdrop ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={backdrop} alt="" width={1280} height={720} loading="lazy" decoding="async" className="h-full w-full object-cover opacity-80 transition-opacity duration-200 group-hover:opacity-100" />
        ) : (
          <div className="flex h-full w-full gap-0.5">
            {movies.slice(0, 4).map((m) =>
              m!.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={m!.id} src={m!.poster} alt="" loading="lazy" className="h-full w-1/4 object-cover" />
              ) : (
                <div key={m!.id} className="h-full w-1/4 bg-elev-2" />
              ),
            )}
          </div>
        )}
        <div className="fade-bottom absolute inset-0" />
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4">
          <div className="min-w-0">
            {showCategory && cat && <p className="eyebrow mb-1">{cat.short}</p>}
            <h3 className="title line-clamp-2 text-[17px]">{list.title}</h3>
          </div>
          <span className="shrink-0 text-[12px] text-muted">{list.movieIds.length}作品</span>
        </div>
      </div>
    </Link>
  );
}
