import { cacheLife } from "next/cache";

const API = "https://api.themoviedb.org/3";
export const IMG = "https://image.tmdb.org/t/p";

export type Person = { id: number; name: string; character?: string; job?: string; profile?: string | null };
export type Provider = { id: number; name: string; logo: string };
export type MovieLite = {
  id: number;
  title: string;
  originalTitle: string;
  year: string;
  poster: string | null;
  backdrop: string | null;
  rating: number;
  votes: number;
  overview: string;
};
export type MovieDetail = MovieLite & {
  tagline: string;
  runtime: number | null;
  genres: string[];
  countries: string[];
  releaseDate: string;
  imdbId: string | null;
  directors: Person[];
  writers: Person[];
  cast: Person[];
  trailerKey: string | null;
  providers: { flatrate: Provider[]; rent: Provider[]; buy: Provider[]; link: string | null };
  similar: MovieLite[];
};

type Raw = Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any

function key(): string | undefined {
  return process.env.TMDB_API_KEY;
}

class TmdbError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
  }
}

/** Small semaphore so build workers don't burst past TMDB's rate limit (~50 req/s). */
const MAX_CONCURRENT = 6;
let active = 0;
const waiters: Array<() => void> = [];
async function withSlot<T>(fn: () => Promise<T>): Promise<T> {
  if (active >= MAX_CONCURRENT) await new Promise<void>((r) => waiters.push(r));
  active++;
  try {
    return await fn();
  } finally {
    active--;
    waiters.shift()?.();
  }
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * GET from TMDB with retries. Resolves to null for a 404, throws TmdbError for
 * anything else that keeps failing, so callers inside `use cache` never cache a
 * transient failure.
 */
async function tmdb(p: string, params: Record<string, string | number | undefined> = {}): Promise<Raw | null> {
  const k = key();
  if (!k) throw new TmdbError("TMDB_API_KEY is not set");
  const u = new URL(`${API}${p}`);
  u.searchParams.set("api_key", k);
  for (const [name, v] of Object.entries(params)) if (v !== undefined) u.searchParams.set(name, String(v));

  return withSlot(async () => {
    let lastErr: unknown;
    for (let attempt = 0; attempt < 8; attempt++) {
      try {
        const res = await fetch(u, { cache: "no-store" });
        if (res.status === 404) return null;
        if (res.ok) return (await res.json()) as Raw;
        if (res.status === 429 || res.status >= 500) {
          const ra = Number(res.headers.get("retry-after"));
          await sleep(Math.min(15000, ra > 0 ? ra * 1000 : 800 * 2 ** attempt));
          lastErr = new TmdbError(`${res.status} ${p}`, res.status);
          continue;
        }
        throw new TmdbError(`${res.status} ${p}`, res.status);
      } catch (e) {
        if (e instanceof TmdbError && e.status && e.status !== 429 && e.status < 500) throw e;
        lastErr = e;
        await sleep(Math.min(15000, 800 * 2 ** attempt));
      }
    }
    throw lastErr instanceof Error ? lastErr : new TmdbError(`failed ${p}`);
  });
}

function lite(r: Raw): MovieLite {
  return {
    id: r.id,
    title: r.title || r.original_title || "",
    originalTitle: r.original_title || "",
    year: (r.release_date || "").slice(0, 4),
    poster: r.poster_path ? `${IMG}/w342${r.poster_path}` : null,
    backdrop: r.backdrop_path ? `${IMG}/w1280${r.backdrop_path}` : null,
    rating: Math.round((r.vote_average ?? 0) * 10) / 10,
    votes: r.vote_count ?? 0,
    overview: r.overview || "",
  };
}

type Img = { file_path: string; iso_639_1: string | null; vote_count: number; vote_average: number };

function bestByLang(list: Raw[] | undefined, lang: string | null): Img | null {
  const hits = ((list ?? []) as Img[])
    .filter((i) => (i.iso_639_1 ?? null) === lang)
    .sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0) || (b.vote_average ?? 0) - (a.vote_average ?? 0));
  return hits[0] ?? null;
}

/**
 * Pick a poster: Japanese when it is genuinely popular, otherwise English, otherwise textless.
 * Language tags on TMDB are user-supplied and Chinese posters are often mis-tagged "ja",
 * so a "ja" candidate must have at least half the votes of the best "en" one to win.
 */
function pickPoster(list: Raw[] | undefined): string | null {
  const ja = bestByLang(list, "ja");
  const en = bestByLang(list, "en");
  const none = bestByLang(list, null);
  if (ja && (!en || ja.vote_count >= en.vote_count * 0.5)) return ja.file_path;
  return en?.file_path ?? ja?.file_path ?? none?.file_path ?? null;
}

/** Backdrops: prefer textless, then Japanese, then English. */
function pickBackdrop(list: Raw[] | undefined): string | null {
  return (bestByLang(list, null) ?? bestByLang(list, "ja") ?? bestByLang(list, "en"))?.file_path ?? null;
}

function providers(list: Raw[] | undefined): Provider[] {
  return (list ?? []).map((p) => ({ id: p.provider_id, name: p.provider_name, logo: `${IMG}/w92${p.logo_path}` }));
}

async function fetchMovie(id: number): Promise<MovieDetail | null> {
  "use cache";
  cacheLife("weeks");
  const r = await tmdb(`/movie/${id}`, {
    language: "ja-JP",
    append_to_response: "credits,videos,watch/providers,similar,external_ids,images",
    include_image_language: "ja,en,null",
  });
  if (!r) return null;
  // TMDB's primary poster can be in any language (often zh). Prefer ja → en → textless.
  const poster = pickPoster(r.images?.posters) ?? r.poster_path;
  const backdrop = pickBackdrop(r.images?.backdrops) ?? r.backdrop_path;

  let overview: string = r.overview || "";
  let videos: Raw[] = r.videos?.results ?? [];
  if (!overview || videos.length === 0) {
    const en = await tmdb(`/movie/${id}`, { language: "en-US", append_to_response: "videos" }).catch(() => null);
    if (en) {
      if (!overview) overview = en.overview || "";
      if (videos.length === 0) videos = en.videos?.results ?? [];
    }
  }
  const trailer =
    videos.filter((v) => v.site === "YouTube" && v.type === "Trailer").sort((a, b) => (b.official ? 1 : 0) - (a.official ? 1 : 0))[0] ??
    videos.find((v) => v.site === "YouTube" && v.type === "Teaser");
  const crew: Raw[] = r.credits?.crew ?? [];
  const person = (p: Raw): Person => ({
    id: p.id,
    name: p.name,
    character: p.character,
    job: p.job,
    profile: p.profile_path ? `${IMG}/w185${p.profile_path}` : null,
  });
  const jp = r["watch/providers"]?.results?.JP ?? {};

  return {
    ...lite(r),
    poster: poster ? `${IMG}/w342${poster}` : null,
    backdrop: backdrop ? `${IMG}/w1280${backdrop}` : null,
    overview,
    tagline: r.tagline || "",
    runtime: r.runtime || null,
    genres: (r.genres ?? []).map((g: Raw) => g.name),
    countries: (r.production_countries ?? []).map((c: Raw) => c.iso_3166_1),
    releaseDate: r.release_date || "",
    imdbId: r.external_ids?.imdb_id || r.imdb_id || null,
    directors: crew.filter((c) => c.job === "Director").map(person),
    writers: crew.filter((c) => ["Screenplay", "Writer", "Novel", "Story"].includes(c.job)).slice(0, 4).map(person),
    cast: (r.credits?.cast ?? []).slice(0, 10).map(person),
    trailerKey: trailer?.key ?? null,
    providers: { flatrate: providers(jp.flatrate), rent: providers(jp.rent), buy: providers(jp.buy), link: jp.link ?? null },
    similar: (r.similar?.results ?? []).slice(0, 8).map(lite),
  };
}

/**
 * Full movie details in Japanese (English fallback for empty overviews), cached
 * for weeks. Returns null for unknown ids or when TMDB is unreachable; failures
 * are not cached.
 */
export async function getMovie(id: number): Promise<MovieDetail | null> {
  try {
    return await fetchMovie(id);
  } catch (e) {
    console.warn(`[tmdb] movie ${id}: ${e instanceof Error ? e.message : e}`);
    return null;
  }
}

/** Compact card data used in list grids. Same cache entry as getMovie, trimmed for the client. */
export async function getMovieLite(id: number): Promise<MovieLite | null> {
  const m = await getMovie(id);
  return m ? { id: m.id, title: m.title, originalTitle: m.originalTitle, year: m.year, poster: m.poster, backdrop: m.backdrop, rating: m.rating, votes: m.votes, overview: m.overview } : null;
}

async function listOf(p: string, params: Record<string, string | number>): Promise<MovieLite[]> {
  const r = await tmdb(p, { language: "ja-JP", region: "JP", ...params });
  return ((r?.results ?? []) as Raw[]).filter((m) => m.poster_path).map(lite);
}

async function safeList(p: string, params: Record<string, string | number>): Promise<MovieLite[]> {
  try {
    return await listOf(p, params);
  } catch (e) {
    console.warn(`[tmdb] ${p}: ${e instanceof Error ? e.message : e}`);
    return [];
  }
}

export async function getTrending(): Promise<MovieLite[]> {
  "use cache";
  cacheLife("days");
  return safeList("/trending/movie/week", {});
}

export async function getTopRated(): Promise<MovieLite[]> {
  "use cache";
  cacheLife("weeks");
  return safeList("/movie/top_rated", { page: 1 });
}

export async function getNowPlayingJP(): Promise<MovieLite[]> {
  "use cache";
  cacheLife("days");
  return safeList("/movie/now_playing", { page: 1 });
}

export async function getUpcomingJP(): Promise<MovieLite[]> {
  "use cache";
  cacheLife("days");
  const today = new Date().toISOString().slice(0, 10);
  const r = await safeList("/movie/upcoming", { page: 1 });
  return r.filter((m) => !m.year || m.year >= today.slice(0, 4));
}

/** Films with strong, text-free backdrops, rotated daily for the home hero. */
const HERO_IDS = [693134, 27205, 157336, 496243, 76341, 335984, 438631, 872585, 129, 346698, 324857, 603, 155, 329865, 244786, 313369, 120467, 372058, 940721, 508883];

/** The home hero movie. Cached per day so the whole site sees the same pick. */
export async function getHeroMovie(): Promise<MovieDetail | null> {
  "use cache";
  cacheLife("days");
  const day = Math.floor(Date.now() / 86_400_000);
  const offset = day % HERO_IDS.length;
  const order = [...HERO_IDS.slice(offset), ...HERO_IDS.slice(0, offset)];
  for (const id of order) {
    const m = await getMovie(id);
    if (m?.backdrop) return m;
  }
  return null;
}

export function runtimeLabel(min: number | null): string {
  if (!min) return "";
  const h = Math.floor(min / 60);
  const m = min % 60;
  return h ? `${h}時間${m ? `${m}分` : ""}` : `${m}分`;
}

export function votesLabel(n: number): string {
  if (n >= 10000) return `${Math.round(n / 1000) / 10}万`;
  if (n >= 1000) return `${Math.round(n / 100) / 10}千`;
  return String(n);
}
