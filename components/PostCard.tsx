import Link from "next/link";
import type { PostMeta } from "@/lib/content";
import { getMovieLite } from "@/lib/tmdb";
import { formatDate } from "@/lib/format";

export async function PostCard({ post, large = false }: { post: PostMeta; large?: boolean }) {
  const coverId = post.cover ?? post.movieIds[0];
  const cover = coverId ? await getMovieLite(coverId) : null;
  const img = cover?.backdrop ?? cover?.poster ?? null;

  return (
    <Link href={`/post/${post.slug}`} className={`card group block overflow-hidden rounded-xl bg-elev ${large ? "md:grid md:grid-cols-2" : ""}`}>
      <div className="relative aspect-[16/9] overflow-hidden bg-elev-2">
        {img && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt="" width={1280} height={720} loading="lazy" decoding="async" className="h-full w-full object-cover opacity-85 transition-opacity duration-200 group-hover:opacity-100" />
        )}
      </div>
      <div className={`p-4 ${large ? "md:flex md:flex-col md:justify-center md:p-8" : ""}`}>
        <p className="eyebrow mb-1.5">{formatDate(post.date)}</p>
        <h3 className={`title ${large ? "text-xl md:text-[26px]" : "line-clamp-2 text-[15px]"}`}>{post.title}</h3>
        <p className={`mt-2 leading-relaxed text-muted ${large ? "line-clamp-4 text-sm" : "line-clamp-2 text-xs"}`}>{post.description}</p>
      </div>
    </Link>
  );
}
