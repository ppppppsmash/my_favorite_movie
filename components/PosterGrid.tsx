import Link from "next/link";
import type { MovieLite } from "@/lib/tmdb";

/** Compact poster grid for ranking pages and "similar movies". */
export function PosterGrid({ movies, ranked = false, columns = "grid-cols-3 sm:grid-cols-4 md:grid-cols-6" }: { movies: MovieLite[]; ranked?: boolean; columns?: string }) {
  return (
    <ul className={`grid gap-x-3 gap-y-5 ${columns}`}>
      {movies.map((m, i) => (
        <li key={m.id}>
          <Link href={`/movie/${m.id}`} className="pressable group block">
            <div className="relative overflow-hidden rounded-lg">
              {m.poster ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={m.poster} alt={m.title} width={342} height={513} loading="lazy" decoding="async" className="poster aspect-[2/3] w-full object-cover transition-opacity duration-200 group-hover:opacity-90" />
              ) : (
                <div className="poster flex aspect-[2/3] items-center justify-center text-xs text-muted">No image</div>
              )}
              {ranked && <span className="absolute left-1.5 top-1.5 grid h-6 min-w-6 place-items-center rounded-md bg-black/70 px-1.5 font-display text-[11px] font-bold text-white backdrop-blur-sm">{i + 1}</span>}
            </div>
            <p className="mt-2 line-clamp-2 text-xs font-medium leading-snug group-hover:underline underline-offset-4">{m.title}</p>
            <p className="text-[11px] text-subtle">
              {m.rating > 0 && (
                <>
                  <span className="text-star">★</span> {m.rating.toFixed(1)}
                  {m.year && " · "}
                </>
              )}
              {m.year}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

/** Horizontal rail with large outlined rank digits (home trending). */
export function RankedRail({ movies }: { movies: MovieLite[] }) {
  return (
    <div className="no-scrollbar hscroll -mx-5 flex gap-4 px-5 pb-2 sm:mx-0 sm:px-0">
      {movies.map((m, i) => (
        <Link key={m.id} href={`/movie/${m.id}`} className="group relative flex w-[150px] shrink-0 items-end sm:w-[180px]" aria-label={`${i + 1}位 ${m.title}`}>
          <span aria-hidden className="rank-outline pointer-events-none absolute -left-3 bottom-0 z-0 select-none text-[120px] sm:text-[150px]">
            {i + 1}
          </span>
          <div className="pressable relative z-10 ml-8 w-full overflow-hidden rounded-lg transition-transform duration-200 [transition-timing-function:var(--ease-out)] group-hover:-translate-y-1">
            {m.poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={m.poster} alt="" width={342} height={513} loading="lazy" decoding="async" className="aspect-[2/3] w-full object-cover" />
            ) : (
              <div className="aspect-[2/3] w-full bg-elev-2" />
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
