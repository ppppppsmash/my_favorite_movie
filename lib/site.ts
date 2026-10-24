/** Site-wide constants. Change the name/tagline here and everything follows. */
export const site = {
  name: "シネリスト",
  nameEn: "Cinelist",
  tagline: "観たい映画が、必ず見つかる",
  description:
    "ジャンル・テーマ・監督・受賞歴から選べる厳選映画リスト集。「次に何を観るか」で迷ったときの道しるべ。作品情報は TMDB を利用しています。",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "ja_JP",
  since: 2026,
  author: "シネリスト編集部",
  contactEmail: process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "",
  twitter: process.env.NEXT_PUBLIC_TWITTER ?? "",
} as const;

export function absoluteUrl(path: string): string {
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}
