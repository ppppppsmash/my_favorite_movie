import { cacheLife } from "next/cache";
import { categories } from "@/lib/categories";
import { getAllLists, getAllMovieIds, getAllPosts, type SearchItem } from "@/lib/content";
import { getMovieLite } from "@/lib/tmdb";

async function buildIndex(): Promise<SearchItem[]> {
  "use cache";
  cacheLife("days");
  const items: SearchItem[] = [];
  for (const c of categories) items.push({ type: "category", title: c.title, href: `/lists/${c.slug}`, hint: c.description });
  for (const l of getAllLists()) items.push({ type: "list", title: l.title, href: `/list/${l.slug}`, hint: l.tags.join(" ") || l.description });
  for (const p of getAllPosts()) items.push({ type: "post", title: p.title, href: `/post/${p.slug}`, hint: p.description });
  const movies = await Promise.all(getAllMovieIds().map(getMovieLite));
  for (const m of movies) {
    if (!m) continue;
    items.push({ type: "movie", title: m.title, href: `/movie/${m.id}`, hint: [m.originalTitle !== m.title ? m.originalTitle : "", m.year].filter(Boolean).join(" ") });
  }
  return items;
}

export async function GET() {
  const items = await buildIndex();
  return Response.json(items, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
