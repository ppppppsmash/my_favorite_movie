import Link from "next/link";
import { site } from "@/lib/site";
import { categories } from "@/lib/categories";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[1.2fr_1fr_1fr_1fr]">
        <div>
          <p className="display text-lg">{site.name}</p>
          <p className="mt-2 max-w-xs text-sm text-muted">{site.description}</p>
          <p className="mt-6 text-xs leading-relaxed text-muted">
            作品情報・画像は{" "}
            <a href="https://www.themoviedb.org/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              TMDB
            </a>{" "}
            の API を利用しています。This product uses the TMDB API but is not endorsed or certified by TMDB.
            <br />
            配信情報は{" "}
            <a href="https://www.justwatch.com/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              JustWatch
            </a>{" "}
            提供。
          </p>
        </div>
        <div>
          <p className="eyebrow">カテゴリ</p>
          <ul className="mt-3 space-y-2 text-sm">
            {categories.map((c) => (
              <li key={c.slug}>
                <Link href={`/lists/${c.slug}`} className="text-muted hover:text-fg">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="eyebrow">コンテンツ</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/lists" className="text-muted hover:text-fg">
                すべてのリスト
              </Link>
            </li>
            <li>
              <Link href="/posts" className="text-muted hover:text-fg">
                記事
              </Link>
            </li>
            <li>
              <Link href="/ranking" className="text-muted hover:text-fg">
                ランキング・新作
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="eyebrow">サイトについて</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/page/about" className="text-muted hover:text-fg">
                {site.name}について
              </Link>
            </li>
            <li>
              <Link href="/page/privacy" className="text-muted hover:text-fg">
                プライバシーポリシー
              </Link>
            </li>
            <li>
              <Link href="/page/disclaimer" className="text-muted hover:text-fg">
                免責事項・著作権
              </Link>
            </li>
            <li>
              <Link href="/page/contact" className="text-muted hover:text-fg">
                お問い合わせ
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-2 px-4 py-4 text-xs text-muted">
          <span>
            © {site.since} {site.name}
          </span>
          <span>当サイトはアフィリエイトプログラムに参加しています。</span>
        </div>
      </div>
    </footer>
  );
}
