"use client";

import { useEffect, useState } from "react";
import type { SearchItem } from "@/lib/content";
import { SearchPalette } from "./SearchPalette";

/** Lazily loads the search index (lists, posts, movies) the first time search is opened. */
export function SearchPaletteLoader() {
  const [items, setItems] = useState<SearchItem[] | null>(null);

  useEffect(() => {
    let loaded = false;
    async function load() {
      if (loaded) return;
      loaded = true;
      try {
        const res = await fetch("/search-index.json");
        if (res.ok) setItems((await res.json()) as SearchItem[]);
      } catch {
        setItems([]);
      }
    }
    const onOpen = () => void load();
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") void load();
    };
    window.addEventListener("open-search", onOpen);
    window.addEventListener("keydown", onKey);
    // Warm the index when the browser is idle so the first open is instant.
    const idle = (window as Window & { requestIdleCallback?: (cb: () => void) => number }).requestIdleCallback;
    if (idle) idle(() => void load());
    else setTimeout(() => void load(), 2500);
    return () => {
      window.removeEventListener("open-search", onOpen);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return <SearchPalette items={items ?? []} />;
}
