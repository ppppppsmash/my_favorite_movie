// One-off helper: resolve movie titles in content/plan/*.mjs to TMDB ids and
// write content/lists/*.mdx.  Usage: node scripts/resolve-tmdb.mjs [--only slug]
// Requires TMDB_API_KEY in .env.local (or the environment).
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(new URL(".", import.meta.url).pathname, "..");
if (!process.env.TMDB_API_KEY) {
  const envFile = path.join(root, ".env.local");
  if (fs.existsSync(envFile)) {
    for (const line of fs.readFileSync(envFile, "utf8").split("\n")) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m) process.env[m[1]] = m[2].replace(/^"|"$/g, "");
    }
  }
}
const KEY = process.env.TMDB_API_KEY;
if (!KEY) throw new Error("TMDB_API_KEY missing");

const only = process.argv.includes("--only") ? process.argv[process.argv.indexOf("--only") + 1] : null;
const { lists } = await import(path.join(root, "content/plan/lists.mjs"));
const { overrides } = await import(path.join(root, "content/plan/overrides.mjs"));

const cachePath = path.join(root, "content/plan/.resolve-cache.json");
const cache = fs.existsSync(cachePath) ? JSON.parse(fs.readFileSync(cachePath, "utf8")) : {};

async function tmdb(p, params = {}) {
  const u = new URL(`https://api.themoviedb.org/3${p}`);
  u.searchParams.set("api_key", KEY);
  for (const [k, v] of Object.entries(params)) if (v != null) u.searchParams.set(k, String(v));
  for (let i = 0; i < 4; i++) {
    const r = await fetch(u);
    if (r.status === 429) { await new Promise((s) => setTimeout(s, 1500)); continue; }
    if (!r.ok) throw new Error(`${r.status} ${u.pathname}`);
    return r.json();
  }
  throw new Error("rate limited");
}

async function resolve(title, year) {
  const key = `${title}|${year ?? ""}`;
  if (cache[key]) return cache[key];
  if (overrides[key]) {
    const d = await tmdb(`/movie/${overrides[key]}`, { language: "ja-JP" });
    const hit = { id: d.id, title: d.title, original: d.original_title, year: (d.release_date || "").slice(0, 4), votes: d.vote_count, fixed: true };
    cache[key] = hit;
    return hit;
  }
  // Search WITHOUT the year filter (TMDB's year filter demotes popular hits), then
  // choose the most-voted result whose release year is within ±1 of the requested year.
  const pages = await Promise.all([1, 2].map((page) => tmdb("/search/movie", { query: title, language: "ja-JP", include_adult: false, page })));
  let results = pages.flatMap((d) => d?.results ?? []);
  if (!results.length) return null;
  const y = Number(year);
  const near = year ? results.filter((r) => r.release_date && Math.abs(Number(r.release_date.slice(0, 4)) - y) <= 1) : results;
  const pool = near.length ? near : results;
  pool.sort((a, b) => (b.vote_count ?? 0) - (a.vote_count ?? 0));
  const r = pool[0];
  const hit = { id: r.id, title: r.title, original: r.original_title, year: (r.release_date || "").slice(0, 4), votes: r.vote_count, nearMiss: !near.length };
  cache[key] = hit;
  return hit;
}

const report = [];
for (const list of lists) {
  if (only && list.slug !== only) continue;
  const items = [];
  for (const [title, year, comment] of list.movies) {
    let hit;
    try { hit = typeof title === "number" ? { id: title, title: `#${title}`, year: "", fixed: true } : await resolve(title, year); }
    catch (e) { hit = null; report.push(`ERR  ${list.slug}: ${title} (${year}) ${e.message}`); }
    if (!hit) { report.push(`MISS ${list.slug}: ${title} (${year})`); continue; }
    const yearOff = !hit.fixed && year && hit.year && Math.abs(Number(hit.year) - Number(year)) > 1;
    if (hit.nearMiss) report.push(`NEAR ${list.slug}: ${title} (${year}) -> ${hit.title} / ${hit.original} (${hit.year}) id=${hit.id}`);
    if (yearOff) report.push(`YEAR ${list.slug}: ${title} (${year}) -> ${hit.title} / ${hit.original} (${hit.year}) id=${hit.id}`);
    items.push({ ...hit, query: title, comment });
  }
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
  const fm = [
    "---",
    `title: ${JSON.stringify(list.title)}`,
    `category: ${list.category}`,
    `description: ${JSON.stringify(list.description)}`,
    `date: ${list.date ?? "2026-10-24"}`,
    list.tags ? `tags: ${JSON.stringify(list.tags)}` : null,
    list.ordered ? "ordered: true" : null,
    "---",
  ].filter(Boolean).join("\n");
  const body = items
    .map((it) => {
      const label = `{/* ${it.title}${it.year ? ` (${it.year})` : ""} */}`;
      return it.comment ? `${label}\n<Movie id="${it.id}">\n  ${it.comment}\n</Movie>` : `${label}\n<Movie id="${it.id}" />`;
    })
    .join("\n\n");
  const mdx = `${fm}\n\n${list.intro.trim()}\n\n${body}\n${list.outro ? `\n${list.outro.trim()}\n` : ""}`;
  fs.writeFileSync(path.join(root, "content/lists", `${list.slug}.mdx`), mdx);
  console.log(`wrote ${list.slug} (${items.length})`);
}
fs.writeFileSync(cachePath, JSON.stringify(cache, null, 1));
console.log("\n=== REPORT ===");
console.log(report.join("\n") || "no issues");
