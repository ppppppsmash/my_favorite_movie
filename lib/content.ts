import fs from "node:fs";
import path from "node:path";
import { cache } from "react";
import matter from "gray-matter";
import { categories } from "./categories";

const CONTENT_DIR = path.join(process.cwd(), "content");

export type ListMeta = {
  slug: string;
  title: string;
  category: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  ordered: boolean;
  /** TMDB ids in order of appearance. */
  movieIds: number[];
  /** Optional TMDB id used for the hero image. Defaults to the first movie. */
  cover?: number;
};

export type ListDoc = ListMeta & { body: string };

export type PostMeta = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  tags: string[];
  /** TMDB id for the hero backdrop. */
  cover?: number;
  movieIds: number[];
};

export type PostDoc = PostMeta & { body: string };

export type PageDoc = { slug: string; title: string; description: string; body: string; updated?: string };

const MOVIE_RE = /<Movie\s+id=(?:"(\d+)"|\{(\d+)\})/g;

function extractMovieIds(body: string): number[] {
  const ids: number[] = [];
  const seen = new Set<number>();
  for (const m of body.matchAll(MOVIE_RE)) {
    const id = Number(m[1] ?? m[2]);
    if (!seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

function readDir(sub: string): { slug: string; raw: string }[] {
  const dir = path.join(CONTENT_DIR, sub);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx") || f.endsWith(".md"))
    .map((f) => ({ slug: f.replace(/\.mdx?$/, ""), raw: fs.readFileSync(path.join(dir, f), "utf8") }));
}

function str(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : v == null ? fallback : String(v);
}

function dateStr(v: unknown): string {
  if (v instanceof Date) return v.toISOString().slice(0, 10);
  return str(v);
}

function parseList(slug: string, raw: string): ListDoc {
  const { data, content } = matter(raw);
  return {
    slug,
    title: str(data.title, slug),
    category: str(data.category, "featured"),
    description: str(data.description),
    date: dateStr(data.date) || "2026-01-01",
    updated: data.updated ? dateStr(data.updated) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    ordered: Boolean(data.ordered),
    cover: typeof data.cover === "number" ? data.cover : undefined,
    movieIds: extractMovieIds(content),
    body: content,
  };
}

function parsePost(slug: string, raw: string): PostDoc {
  const { data, content } = matter(raw);
  return {
    slug,
    title: str(data.title, slug),
    description: str(data.description),
    date: dateStr(data.date) || "2026-01-01",
    updated: data.updated ? dateStr(data.updated) : undefined,
    tags: Array.isArray(data.tags) ? data.tags.map(String) : [],
    cover: typeof data.cover === "number" ? data.cover : undefined,
    movieIds: extractMovieIds(content),
    body: content,
  };
}

const CATEGORY_ORDER = new Map(categories.map((c, i) => [c.slug, i]));

export const getAllLists = cache((): ListDoc[] =>
  readDir("lists")
    .map(({ slug, raw }) => parseList(slug, raw))
    .sort((a, b) => {
      const c = (CATEGORY_ORDER.get(a.category) ?? 99) - (CATEGORY_ORDER.get(b.category) ?? 99);
      return c !== 0 ? c : b.date.localeCompare(a.date) || a.title.localeCompare(b.title, "ja");
    }),
);

export const getList = cache((slug: string): ListDoc | undefined => {
  const file = ["mdx", "md"].map((ext) => path.join(CONTENT_DIR, "lists", `${slug}.${ext}`)).find((p) => fs.existsSync(p));
  if (!file) return undefined;
  return parseList(slug, fs.readFileSync(file, "utf8"));
});

export const getListsByCategory = cache((category: string): ListDoc[] => getAllLists().filter((l) => l.category === category));

export const getAllPosts = cache((): PostDoc[] =>
  readDir("posts")
    .map(({ slug, raw }) => parsePost(slug, raw))
    .sort((a, b) => b.date.localeCompare(a.date)),
);

export const getPost = cache((slug: string): PostDoc | undefined => {
  const file = ["mdx", "md"].map((ext) => path.join(CONTENT_DIR, "posts", `${slug}.${ext}`)).find((p) => fs.existsSync(p));
  if (!file) return undefined;
  return parsePost(slug, fs.readFileSync(file, "utf8"));
});

export const getPage = cache((slug: string): PageDoc | undefined => {
  const file = ["mdx", "md"].map((ext) => path.join(CONTENT_DIR, "pages", `${slug}.${ext}`)).find((p) => fs.existsSync(p));
  if (!file) return undefined;
  const { data, content } = matter(fs.readFileSync(file, "utf8"));
  return { slug, title: str(data.title, slug), description: str(data.description), updated: data.updated ? dateStr(data.updated) : undefined, body: content };
});

export const getAllPages = cache((): PageDoc[] => readDir("pages").map(({ slug }) => getPage(slug)!).filter(Boolean));

/** Every TMDB id referenced anywhere in lists or posts (for static generation + sitemap). */
export const getAllMovieIds = cache((): number[] => {
  const ids = new Set<number>();
  for (const l of getAllLists()) l.movieIds.forEach((id) => ids.add(id));
  for (const p of getAllPosts()) p.movieIds.forEach((id) => ids.add(id));
  return [...ids];
});

/** Reverse index: lists (and posts) that mention a movie. */
export const getListsContainingMovie = cache((id: number): ListDoc[] => getAllLists().filter((l) => l.movieIds.includes(id)));
export const getPostsContainingMovie = cache((id: number): PostDoc[] => getAllPosts().filter((p) => p.movieIds.includes(id)));

/** Lightweight index for the search palette. */
export type SearchItem = { type: "list" | "post" | "category" | "movie"; title: string; href: string; hint?: string };
