/**
 * Monetization helpers. Everything is driven by env vars so the site works
 * (without ads / affiliate links) until the accounts are approved.
 *
 * NEXT_PUBLIC_ADSENSE_CLIENT        ca-pub-XXXXXXXXXXXXXXXX
 * NEXT_PUBLIC_ADSENSE_SLOT_INFEED   slot id for in-feed units (between list items)
 * NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE  slot id for in-article units
 * NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY  slot id for responsive display units (page bottom / sidebar)
 * NEXT_PUBLIC_AMAZON_TAG            Amazon アソシエイト tag (e.g. yourid-22)
 * NEXT_PUBLIC_AFF_UNEXT             affiliate landing URL for U-NEXT (A8 etc.)
 * NEXT_PUBLIC_AFF_HULU              affiliate landing URL for Hulu
 * NEXT_PUBLIC_AFF_DISNEY            affiliate landing URL for Disney+
 * NEXT_PUBLIC_AFF_DMM               affiliate landing URL for DMM TV
 * NEXT_PUBLIC_AFF_ABEMA             affiliate landing URL for ABEMA
 * NEXT_PUBLIC_AFF_LEMINO            affiliate landing URL for Lemino
 */

export const adsense = {
  client: process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "",
  slots: {
    infeed: process.env.NEXT_PUBLIC_ADSENSE_SLOT_INFEED ?? "",
    article: process.env.NEXT_PUBLIC_ADSENSE_SLOT_ARTICLE ?? "",
    display: process.env.NEXT_PUBLIC_ADSENSE_SLOT_DISPLAY ?? "",
  },
};

export const adsEnabled = Boolean(adsense.client);

const amazonTag = process.env.NEXT_PUBLIC_AMAZON_TAG ?? "";

/** Prime Video search deep link with the associate tag. Returns null when no tag is configured. */
export function amazonPrimeVideoSearch(title: string): string | null {
  if (!amazonTag) return null;
  const u = new URL("https://www.amazon.co.jp/s");
  u.searchParams.set("k", title);
  u.searchParams.set("i", "instant-video");
  u.searchParams.set("tag", amazonTag);
  return u.toString();
}

/** Amazon product search (Blu-ray / DVD / books) with the associate tag. */
export function amazonProductSearch(title: string): string | null {
  if (!amazonTag) return null;
  const u = new URL("https://www.amazon.co.jp/s");
  u.searchParams.set("k", `${title} Blu-ray`);
  u.searchParams.set("i", "dvd");
  u.searchParams.set("tag", amazonTag);
  return u.toString();
}

export type AffiliateService = { id: string; name: string; url: string; /** TMDB provider_name substrings that map to this service. */ match: string[] };

/** Subscription services with an affiliate landing page configured. */
export function affiliateServices(): AffiliateService[] {
  const defs: Array<[string, string, string | undefined, string[]]> = [
    ["unext", "U-NEXT", process.env.NEXT_PUBLIC_AFF_UNEXT, ["U-NEXT", "U-Next"]],
    ["hulu", "Hulu", process.env.NEXT_PUBLIC_AFF_HULU, ["Hulu"]],
    ["disney", "Disney+", process.env.NEXT_PUBLIC_AFF_DISNEY, ["Disney Plus", "Disney+"]],
    ["dmm", "DMM TV", process.env.NEXT_PUBLIC_AFF_DMM, ["DMM"]],
    ["abema", "ABEMA", process.env.NEXT_PUBLIC_AFF_ABEMA, ["ABEMA", "Abema"]],
    ["lemino", "Lemino", process.env.NEXT_PUBLIC_AFF_LEMINO, ["Lemino", "dTV"]],
  ];
  return defs.filter(([, , url]) => url).map(([id, name, url, match]) => ({ id, name, url: url!, match }));
}

/** Find the affiliate URL for a TMDB provider name, if that service is configured. */
export function affiliateFor(providerName: string): AffiliateService | undefined {
  return affiliateServices().find((s) => s.match.some((m) => providerName.toLowerCase().includes(m.toLowerCase())));
}

export function isAmazonProvider(providerName: string): boolean {
  return /amazon/i.test(providerName);
}
