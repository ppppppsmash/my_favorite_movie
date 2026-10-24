import type { MovieDetail } from "@/lib/tmdb";
import { affiliateFor, affiliateServices, amazonPrimeVideoSearch, amazonProductSearch, isAmazonProvider } from "@/lib/monetize";

/**
 * "Where to watch" block. TMDB (JustWatch) tells us which Japanese services carry
 * the title; each provider becomes an affiliate link when one is configured,
 * otherwise a plain JustWatch link. Always ends with Amazon search buttons.
 */
export function WatchProviders({ movie }: { movie: MovieDetail }) {
  const { flatrate, rent, buy, link } = movie.providers;
  const seen = new Set<number>();
  const groups = [
    { label: "見放題", items: flatrate },
    { label: "レンタル", items: rent },
    { label: "購入", items: buy },
  ]
    .map((g) => ({ ...g, items: g.items.filter((p) => !seen.has(p.id) && seen.add(p.id)) }))
    .filter((g) => g.items.length > 0);

  const amazonVideo = amazonPrimeVideoSearch(movie.title);
  const amazonDisc = amazonProductSearch(movie.title);
  const services = affiliateServices();

  return (
    <section className="rounded-xl bg-elev p-4 sm:p-5" aria-labelledby="watch-heading">
      <h2 id="watch-heading" className="title text-[15px]">
        配信・視聴方法
      </h2>
      {groups.length === 0 ? (
        <p className="mt-2 text-sm text-muted">現在、日本国内の主要サービスでの配信情報は見つかりませんでした。</p>
      ) : (
        <div className="mt-3 space-y-3">
          {groups.map((g) => (
            <div key={g.label}>
              <p className="eyebrow mb-1.5">{g.label}</p>
              <ul className="flex flex-wrap gap-2">
                {g.items.map((p) => {
                  const aff = affiliateFor(p.name);
                  const href = aff ? aff.url : isAmazonProvider(p.name) && amazonVideo ? amazonVideo : (link ?? "#");
                  return (
                    <li key={p.id}>
                      <a
                        href={href}
                        target="_blank"
                        rel={aff || isAmazonProvider(p.name) ? "sponsored noopener noreferrer" : "noopener noreferrer"}
                        className="pressable inline-flex items-center gap-2 rounded-full border border-line bg-elev-2 py-1 pl-1 pr-3 text-xs font-medium hover:border-line-strong"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={p.logo} alt="" width={20} height={20} className="h-5 w-5 rounded-md" loading="lazy" />
                        {p.name}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>
      )}

      {(amazonVideo || amazonDisc || services.length > 0) && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
          {amazonVideo && (
            <a href={amazonVideo} target="_blank" rel="sponsored noopener noreferrer" className="pressable inline-flex items-center gap-1.5 rounded-full bg-fg px-4 py-2 text-xs font-bold text-bg hover:bg-white/90">
              Prime Video で探す
            </a>
          )}
          {amazonDisc && (
            <a href={amazonDisc} target="_blank" rel="sponsored noopener noreferrer" className="pressable inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium hover:border-line-strong">
              Blu-ray / DVD を探す
            </a>
          )}
          {services
            .filter((s) => !flatrate.some((p) => affiliateFor(p.name)?.id === s.id))
            .map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="sponsored noopener noreferrer" className="pressable inline-flex items-center gap-1.5 rounded-full border border-line px-4 py-2 text-xs font-medium hover:border-line-strong">
                {s.name} 無料トライアル
              </a>
            ))}
        </div>
      )}
      <p className="mt-3 text-[11px] text-muted">
        配信状況は変わることがあります。最新情報は各サービスでご確認ください。
        {link && (
          <>
            {" "}
            <a href={link} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">
              JustWatch で詳細を見る
            </a>
          </>
        )}
      </p>
    </section>
  );
}
