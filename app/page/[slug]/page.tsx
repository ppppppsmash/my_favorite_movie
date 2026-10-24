import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { getAllPages, getPage } from "@/lib/content";
import { formatDate } from "@/lib/format";
import { site } from "@/lib/site";
import { Mdx } from "@/components/Mdx";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { PageSkeleton } from "@/components/PageSkeleton";

export function generateStaticParams() {
  return getAllPages().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/page/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) return {};
  return { title: page.title, description: page.description, alternates: { canonical: `/page/${page.slug}` } };
}

async function StaticBody({ params }: { params: PageProps<"/page/[slug]">["params"] }) {
  const { slug } = await params;
  const page = getPage(slug);
  if (!page) notFound();
  return (
    <article className="mx-auto max-w-3xl">
      <Breadcrumbs items={[{ label: page.title }]} />
      <h1 className="display text-[clamp(1.8rem,4vw,2.6rem)]">{page.title}</h1>
      {page.updated && <p className="mt-2 text-xs text-muted">最終更新: {formatDate(page.updated)}</p>}
      <div className="prose mt-8 max-w-none prose-invert">
        <Mdx source={page.body} adEvery={0} />
        {page.slug === "contact" && (
          <p className="not-prose mt-6 rounded-xl border border-line bg-elev p-4 text-sm">
            {site.contactEmail ? (
              <>
                メール: <a href={`mailto:${site.contactEmail}`} className="font-medium underline underline-offset-4">{site.contactEmail}</a>
              </>
            ) : (
              <span className="text-muted">連絡先は現在準備中です。</span>
            )}
          </p>
        )}
      </div>
    </article>
  );
}

/** The URL-specific body streams into a Suspense boundary so the app shell renders instantly. */
export default function StaticPage({ params }: PageProps<"/page/[slug]">) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StaticBody params={params} />
    </Suspense>
  );
}
