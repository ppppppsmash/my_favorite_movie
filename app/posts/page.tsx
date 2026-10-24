import type { Metadata } from "next";
import { getAllPosts } from "@/lib/content";
import { PostCard } from "@/components/PostCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { AdSlot } from "@/components/AdSlot";

export const metadata: Metadata = {
  title: "記事",
  description: "映画の観る順番、テーマ別の深掘り、季節のおすすめ。読み物としての映画案内。",
  alternates: { canonical: "/posts" },
};

export default function PostsPage() {
  const posts = getAllPosts();
  const [first, ...rest] = posts;
  return (
    <div>
      <Breadcrumbs items={[{ label: "記事" }]} />
      <h1 className="display text-[clamp(1.8rem,4vw,2.6rem)]">記事</h1>
      <p className="mt-2 text-sm text-muted">リストより少し長い、読み物としての映画案内。</p>
      <div className="mt-8 space-y-6">
        {first && <PostCard post={first} large />}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {rest.map((p) => (
            <PostCard key={p.slug} post={p} />
          ))}
        </div>
      </div>
      <AdSlot kind="display" />
    </div>
  );
}
