import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/content";
import { getMovieLite } from "@/lib/tmdb";
import { absoluteUrl, site } from "@/lib/site";
import { formatDate } from "@/lib/format";
import { Mdx } from "@/components/Mdx";
import { PostCard } from "@/components/PostCard";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSkeleton } from "@/components/PageSkeleton";
import { AdSlot } from "@/components/AdSlot";
import { JsonLd } from "@/components/JsonLd";
import { SectionHeading } from "@/components/SectionHeading";

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/post/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(decodeURIComponent(slug));
  if (!post) return {};
  const cover = await getMovieLite(post.cover ?? post.movieIds[0]);
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/post/${post.slug}` },
    openGraph: { type: "article", title: post.title, description: post.description, url: `/post/${post.slug}`, publishedTime: post.date, ...(cover?.backdrop ? { images: [{ url: cover.backdrop }] } : {}) },
  };
}

async function PostBody({ params }: { params: PageProps<"/post/[slug]">["params"] }) {
  const { slug } = await params;
  const post = getPost(decodeURIComponent(slug));
  if (!post) notFound();
  const cover = await getMovieLite(post.cover ?? post.movieIds[0]);
  const others = getAllPosts()
    .filter((p) => p.slug !== post.slug)
    .slice(0, 3);

  return (
    <article>
      <Breadcrumbs items={[{ href: "/posts", label: "記事" }, { label: post.title }]} />
      <header className="mx-auto max-w-3xl">
        <p className="text-xs text-muted">
          {formatDate(post.date)}
          {post.updated && post.updated !== post.date && <span> (更新: {formatDate(post.updated)})</span>}
        </p>
        <h1 className="display mt-3 text-[clamp(1.7rem,4.5vw,2.8rem)]">{post.title}</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted sm:text-base">{post.description}</p>
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5 text-xs text-muted">
            {post.tags.map((t) => (
              <span key={t} className="rounded-full border border-line px-2 py-0.5">
                #{t}
              </span>
            ))}
          </div>
        )}
      </header>
      {cover?.backdrop && (
        <div className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cover.backdrop} alt={cover.title} width={1280} height={720} className="aspect-[16/9] w-full object-cover" />
        </div>
      )}
      <div className="prose mx-auto mt-8 max-w-3xl break-words prose-invert">
        <Mdx source={post.body} adEvery={4} />
      </div>
      <div className="mx-auto max-w-3xl">
        <AdSlot kind="display" />
      </div>
      {others.length > 0 && (
        <section className="mt-16">
          <SectionHeading title="ほかの記事" href="/posts" more="記事一覧" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {others.map((p) => (
              <PostCard key={p.slug} post={p} />
            ))}
          </div>
        </section>
      )}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: post.description,
          url: absoluteUrl(`/post/${post.slug}`),
          datePublished: post.date,
          dateModified: post.updated ?? post.date,
          author: { "@type": "Organization", name: site.author },
          publisher: { "@type": "Organization", name: site.name },
          ...(cover?.backdrop ? { image: [cover.backdrop] } : {}),
          inLanguage: "ja",
        }}
      />
    </article>
  );
}

/** The URL-specific body streams into a Suspense boundary so the app shell renders instantly. */
export default function PostPage({ params }: PageProps<"/post/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton hero />}>
      <PostBody params={params} />
    </Suspense>
  );
}
