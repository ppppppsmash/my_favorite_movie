import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/lib/site";
import { categories } from "@/lib/categories";
import { getAllLists, getAllMovieIds, getAllPages, getAllPosts } from "@/lib/content";

export default function sitemap(): MetadataRoute.Sitemap {
  const lists = getAllLists();
  const posts = getAllPosts();
  const latest = [...lists, ...posts].map((x) => x.updated ?? x.date).sort().at(-1) ?? "2026-01-01";

  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/lists"), lastModified: latest, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/posts"), lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    { url: absoluteUrl("/ranking"), changeFrequency: "daily", priority: 0.8 },
    ...categories.map((c) => ({ url: absoluteUrl(`/lists/${c.slug}`), lastModified: latest, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...lists.map((l) => ({ url: absoluteUrl(`/list/${l.slug}`), lastModified: l.updated ?? l.date, changeFrequency: "monthly" as const, priority: 0.8 })),
    ...posts.map((p) => ({ url: absoluteUrl(`/post/${p.slug}`), lastModified: p.updated ?? p.date, changeFrequency: "monthly" as const, priority: 0.7 })),
    ...getAllMovieIds().map((id) => ({ url: absoluteUrl(`/movie/${id}`), changeFrequency: "weekly" as const, priority: 0.5 })),
    ...getAllPages().map((p) => ({ url: absoluteUrl(`/page/${p.slug}`), changeFrequency: "yearly" as const, priority: 0.3 })),
  ];
}
