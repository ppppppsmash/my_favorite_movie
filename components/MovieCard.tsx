import Link from "next/link";
import type { ReactNode } from "react";
import { getMovie, runtimeLabel, votesLabel } from "@/lib/tmdb";

type Props = {
  id: number;
  /** 1-based rank shown for ordered lists. */
  rank?: number;
  children?: ReactNode;
};

/**
 * Rich movie card used inside MDX lists (`<Movie id="123">comment</Movie>`).
 * Server component: fetches TMDB details (cached) at render time.
 */
export async function MovieCard({ id, rank, children }: Props) {
  const m = await getMovie(id);
  if (!m) {
    return (
      <div className="not-prose my-5 rounded-xl border border-dashed border-line p-4 text-sm text-muted">
        作品情報を取得できませんでした (TMDB #{id})
      </div>
    );
  }
  const director = m.directors.map((d) => d.name).join("、");
  const cast = m.cast.slice(0, 3).map((c) => c.name).join("、");

  return (
    <article className="not-prose group my-3 flex gap-4 rounded-xl bg-elev p-3 transition-colors duration-200 hover:bg-elev-2 sm:gap-5 sm:p-4" id={`movie-${id}`}>
      <Link href={`/movie/${id}`} className="pressable relative block w-20 shrink-0 sm:w-24" aria-label={m.title}>
        {m.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={m.poster} alt={`${m.title} ポスター`} width={342} height={513} loading="lazy" decoding="async" className="poster aspect-[2/3] w-full object-cover" />
        ) : (
          <div className="poster flex aspect-[2/3] w-full items-center justify-center text-xs text-muted">No image</div>
        )}
      </Link>
      <div className="min-w-0 flex-1 py-0.5">
        <div className="flex items-baseline gap-3">
          {rank != null && <span className="shrink-0 font-display text-[13px] tabular-nums text-subtle">{String(rank).padStart(2, "0")}</span>}
          <h3 className="title text-[16px] sm:text-[17px]">
            <Link href={`/movie/${id}`} className="underline-offset-4 hover:underline">
              {m.title}
            </Link>
            {m.year && <span className="ml-2 text-[13px] font-normal text-subtle">{m.year}</span>}
          </h3>
        </div>
        {(director || cast) && (
          <p className="mt-1 truncate text-[12px] text-subtle">
            {[director, cast].filter(Boolean).join(" · ")}
          </p>
        )}
        {children && <div className="mt-3 text-[14px] leading-relaxed text-[#d4d4d4] [&_p]:m-0">{children}</div>}
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-muted">
          {m.rating > 0 && (
            <span>
              <span className="text-star">★</span> {m.rating.toFixed(1)} <span className="text-subtle">({votesLabel(m.votes)})</span>
            </span>
          )}
          {m.runtime && <span>{runtimeLabel(m.runtime)}</span>}
          {m.genres.length > 0 && <span>{m.genres.slice(0, 2).join(" · ")}</span>}
        </div>
      </div>
    </article>
  );
}
