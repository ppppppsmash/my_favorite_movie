"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import type { SearchItem } from "@/lib/content";

const GROUPS: Array<{ type: SearchItem["type"]; heading: string }> = [
  { type: "list", heading: "リスト" },
  { type: "post", heading: "記事" },
  { type: "category", heading: "カテゴリ" },
  { type: "movie", heading: "作品" },
];

/** Case-, width- and kana-insensitive match so "ノーラン" also matches "のーらん". */
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[ァ-ヶ]/g, (ch) => String.fromCharCode(ch.charCodeAt(0) - 0x60))
    .replace(/[\s・:：!！?？。、,.'’"「」『』()（）\-]/g, "");
}

/**
 * ⌘K palette built on cmdk (accessible dialog, roving focus, typeahead).
 * Keyboard-initiated and used constantly, so it opens with no animation.
 */
export function SearchPalette({ items }: { items: SearchItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-search", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-search", onOpen);
    };
  }, []);

  const nq = normalize(q);
  const grouped = GROUPS.map((g) => ({
    ...g,
    items: items.filter((it) => it.type === g.type && (nq ? normalize(`${it.title} ${it.hint ?? ""}`).includes(nq) : g.type !== "movie")).slice(0, nq ? 8 : 6),
  })).filter((g) => g.items.length > 0);

  return (
    <Command.Dialog
      open={open}
      onOpenChange={(v) => {
        setOpen(v);
        if (!v) setQ("");
      }}
      label="検索"
      shouldFilter={false}
      loop
      overlayClassName="fixed inset-0 z-50 bg-black/40 backdrop-blur-[2px]"
      contentClassName="fixed left-1/2 top-[12vh] z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-2xl border border-line-strong bg-elev shadow-2xl outline-none"
    >
      <div className="flex items-center gap-3 border-b border-line px-4">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-subtle" aria-hidden>
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Command.Input value={q} onValueChange={setQ} placeholder="リスト、記事、作品名で検索..." className="h-14 w-full bg-transparent text-base outline-none placeholder:text-subtle" autoFocus />
        <kbd className="hidden rounded-md border border-line px-1.5 py-0.5 text-[10px] text-subtle sm:block">ESC</kbd>
      </div>
      <Command.List className="max-h-[min(60vh,28rem)] overflow-y-auto overscroll-contain py-2">
        <Command.Empty className="px-4 py-12 text-center text-sm text-muted">見つかりませんでした</Command.Empty>
        {grouped.map((g) => (
          <Command.Group key={g.type} heading={g.heading}>
            {g.items.map((it) => (
              <Command.Item
                key={`${it.type}-${it.href}`}
                value={`${it.type}-${it.href}`}
                onSelect={() => {
                  setOpen(false);
                  setQ("");
                  router.push(it.href);
                }}
                className="mx-2 flex items-center gap-3 rounded-xl px-3 py-2.5"
              >
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{it.title}</span>
                  {it.hint && <span className="block truncate text-xs text-muted">{it.hint}</span>}
                </span>
                <span className="text-subtle" aria-hidden>
                  ↵
                </span>
              </Command.Item>
            ))}
          </Command.Group>
        ))}
      </Command.List>
    </Command.Dialog>
  );
}

export function SearchButton({ className = "" }: { className?: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-search"))}
      className={`pressable inline-flex h-9 items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3.5 text-[13px] text-muted backdrop-blur hover:bg-white/10 hover:text-fg ${className}`}
      aria-label="検索"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span className="hidden sm:inline">検索</span>
      <kbd className="hidden rounded-md border border-line px-1.5 text-[10px] lg:inline">⌘K</kbd>
    </button>
  );
}
