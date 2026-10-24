# シネリスト (Cinelist)

ジャンル・テーマ・監督・受賞歴から映画を選べる、日本語の厳選映画リストサイト。
Next.js 16 (App Router / Cache Components) + TMDB API。収益化は Google AdSense とアフィリエイトリンク。

## セットアップ

```bash
pnpm install
cp .env.example .env.local   # TMDB_API_KEY を設定
pnpm dev                     # http://localhost:3000
```

TMDB API キーは <https://www.themoviedb.org/settings/api> で無料取得できます。

```bash
pnpm build && pnpm start     # 本番ビルド (全ページ静的生成、約1分)
pnpm lint                    # ESLint
pnpm exec tsc --noEmit       # 型チェック
```

## 構成

```
app/
  page.tsx                 ホーム (特集・トレンド・カテゴリ別)
  lists/                   カテゴリ一覧 / lists/[category]
  list/[slug]/             リスト詳細 (MDX)
  posts/, post/[slug]/     記事
  movie/[id]/              作品詳細 (TMDB: あらすじ・キャスト・配信先・類似作品)
  ranking/                 トレンド / 上映中 / 公開予定 / 高評価
  page/[slug]/             固定ページ (about, privacy, disclaimer, contact)
  search-index.json/       検索パレット用インデックス (⌘K)
  sitemap.ts, robots.ts, ads.txt/
components/                UI (MovieCard, ListCard, WatchProviders, AdSlot, SearchPalette ...)
content/
  lists/*.mdx              リスト本体 (frontmatter + <Movie id="..."> )
  posts/*.mdx              記事
  pages/*.mdx              固定ページ
  plan/*.mjs               リストの元データ (タイトル + 年 + コメント)。scripts/resolve-tmdb.mjs の入力
lib/
  tmdb.ts                  TMDB クライアント ("use cache"、リトライ、ポスター言語選択)
  content.ts               MDX の読み込み・frontmatter・作品ID抽出
  monetize.ts              AdSense / Amazon / アフィリエイトのヘルパー
  categories.ts, site.ts   カテゴリ定義・サイト設定
```

## コンテンツの書き方

### リストを追加する

`content/lists/<slug>.mdx` を作成します。

```mdx
---
title: "SF映画の必修科目15本"
category: genre          # lib/categories.ts の slug
description: "一覧カードと meta description に使う1〜2文"
date: 2026-10-24
tags: ["SF"]
ordered: true            # 省略可。true にすると番号付き (ランキング・観る順番)
cover: 27205             # 省略可。ヒーロー画像に使う TMDB id (既定は先頭の作品)
---

導入文 (Markdown)。

<Movie id="27205">
  一言コメント (Markdown 可)
</Movie>

<Movie id="157336" />
```

**`id` は文字列 (`id="27205"`) で書いてください。** next-mdx-remote が `id={27205}` のような JS 式属性を落とすためです。
TMDB id は <https://www.themoviedb.org/> で作品を開いたときの URL (`/movie/27205-inception`) で確認できます。

`<Ad />` を本文に置くと記事内広告が入ります。リストでは 6 作品ごとに自動でインフィード広告が入ります。

### 大量のリストを一括生成する

`content/plan/*.mjs` に `["英題", 公開年, "コメント"]` の形式で書き、

```bash
node scripts/resolve-tmdb.mjs            # 全リスト
node scripts/resolve-tmdb.mjs --only sf-essentials
```

を実行すると TMDB 検索で id を解決して `content/lists/*.mdx` を生成します。
検索が別作品を掴んだ場合は `content/plan/overrides.mjs` に `"英題|年": id` を追加して再実行してください
(`content/plan/.resolve-cache.json` を消すと全件再検索します)。

### 記事・固定ページ

`content/posts/*.mdx` (frontmatter: title, description, date, tags, cover) と `content/pages/*.mdx` (title, description, updated)。

## データとキャッシュ

- 作品情報は `lib/tmdb.ts` の `getMovie()` が TMDB から取得し、`"use cache"` + `cacheLife("weeks")` でキャッシュします。ビルド時に全ページが静的生成され、1週間ごとに再検証されます
- ランキングは `cacheLife("days")`
- ポスターは `images` を取得して **日本語版 → 英語版 → 文字なし** の順で選びます。TMDB の言語タグは誤りが多い (中国語ポスターが "ja" 扱い) ため、日本語版は英語版の半分以上の投票数があるときだけ採用します
- リストに含まれない作品ページ (`/movie/[id]`) は初回アクセス時に生成され、以降キャッシュされます

## 収益化

すべて環境変数で切り替わり、未設定なら何も表示されません (`.env.example` 参照)。

| 変数 | 用途 |
| --- | --- |
| `NEXT_PUBLIC_ADSENSE_CLIENT` | AdSense の `ca-pub-...`。設定すると `adsbygoogle.js` の読み込みと `/ads.txt` の出力が有効になる |
| `NEXT_PUBLIC_ADSENSE_SLOT_INFEED` / `_ARTICLE` / `_DISPLAY` | 広告ユニットの slot id。リスト内 / 記事内 / ページ下部・サイドバー |
| `NEXT_PUBLIC_AMAZON_TAG` | Amazon アソシエイトのタグ。作品ページに「Prime Video で探す」「Blu-ray / DVD を探す」ボタンが出る |
| `NEXT_PUBLIC_AFF_UNEXT` など | 各配信サービスのアフィリエイト LP。TMDB (JustWatch) の配信情報で該当サービスが出たとき、そのリンクに差し替わる |
| `NEXT_PUBLIC_GA_ID` | Google アナリティクス 4 |

AdSense 審査に必要なプライバシーポリシー・免責事項・お問い合わせページは `content/pages/` に用意済みです。
アフィリエイトリンクには `rel="sponsored"` が付きます。

## デプロイ

Vercel にそのままデプロイできます。環境変数に `TMDB_API_KEY` と `NEXT_PUBLIC_SITE_URL` (本番 URL) を設定してください。
ビルドは約 950 ページを静的生成します (TMDB への問い合わせは並列数を絞ってリトライするため、レート制限で落ちることはありません)。

## 謝辞

This product uses the TMDB API but is not endorsed or certified by TMDB. 配信情報は JustWatch 提供。

## デザイン指針

`.claude/skills/` に Emil Kowalski 流のデザインエンジニアリング用スキル (proj_kampo から複製) を置いています。UI を触るときは `emil-design-eng` / `animate` / `mobile-native` / `prototype` を参照してください。

採用した方向は **Noir (没入型シネマ)**。`/prototypes` で 3 方向 (Noir / Paper / Studio) を比較して選びました。

- **常時ダーク、無彩色**。アクセント色は持たず、ポスターと背景画像だけが色。評価の星 (`--star`) のみ琥珀
- トークンは `app/globals.css` の `:root` に一式。面は `bg` / `elev` / `elev-2` の 3 段階、罫線は 10% 白
- 語彙: `.display` (大見出し、-0.03em)、`.eyebrow` (小見出し、字間広め)、`.poster` (影付きポスター)、`.glass` (半透明クローム)、`.bleed` (全幅)、`.fade-bottom` / `.fade-left` (背景画像を地に溶かす)、`.rank-outline` (トレンドの輪郭数字)
- ホームは「今夜の一本」の全幅ヒーロー (`getHeroMovie`、日替わり) + 横スクロールのレール。リストカードは背景スチルにタイトルを重ねる
- モーションは `--ease-out` / `--dur-press` / `--dur-hover`。押せる要素は `.pressable`、カードは `.card`。⌘K はアニメーションなし。`prefers-reduced-motion` 対応
- モバイルは下部タブバー (`BottomNav`)。tap-highlight 透過、`viewport-fit=cover`、safe-area 対応
- ライブラリ: ⌘K は `cmdk`、クラス結合は `clsx`
