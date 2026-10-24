export type Category = {
  slug: string;
  title: string;
  short: string;
  description: string;
};

/** Order here is the display order on the home page and /lists. */
export const categories: Category[] = [
  { slug: "featured", title: "特集リスト", short: "特集", description: "編集部が気分・目的別に組んだ厳選リスト。何から観ればいいか迷ったらここから。" },
  { slug: "genre", title: "ジャンル別", short: "ジャンル", description: "SF、サスペンス、ホラー、恋愛、コメディ。ジャンルごとの必修科目。" },
  { slug: "theme", title: "テーマ別", short: "テーマ", description: "タイムループ、脱獄、法廷、料理。ジャンルを横断する「題材」で選ぶ。" },
  { slug: "style", title: "スタイル・演出", short: "スタイル", description: "長回し、映像美、色彩、ブラックコメディ。作り手の「手つき」で選ぶ。" },
  { slug: "region", title: "国・形式別", short: "国・形式", description: "日本、韓国、フランス、北欧、インド。アニメやジブリのガイドも。" },
  { slug: "order", title: "シリーズの観る順番", short: "観る順番", description: "スター・ウォーズ、マーベル、ハリー・ポッター。迷いがちな鑑賞順を整理。" },
  { slug: "awards", title: "受賞作品", short: "受賞作", description: "アカデミー賞、カンヌ、ヴェネツィア、ベルリン、日本アカデミー賞。" },
  { slug: "critics", title: "批評家・専門機関の選出", short: "批評家選", description: "Sight & Sound、AFI、キネマ旬報。プロが選んだ歴史的ベスト。" },
  { slug: "director", title: "監督別代表作", short: "監督", description: "ノーラン、キューブリック、宮崎駿、ポン・ジュノ。作家で追う映画史。" },
  { slug: "actor", title: "俳優別代表作", short: "俳優", description: "ディカプリオ、ソン・ガンホ、役所広司。俳優のキャリアを辿る。" },
];

export const categoryMap = new Map(categories.map((c) => [c.slug, c]));

export function getCategory(slug: string): Category | undefined {
  return categoryMap.get(slug);
}
