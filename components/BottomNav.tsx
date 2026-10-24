"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

const ITEMS = [
  { href: "/", label: "ホーム", match: (p: string) => p === "/", icon: <path d="M3 11.5 12 4l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" /> },
  { href: "/lists", label: "リスト", match: (p: string) => p.startsWith("/list"), icon: <path d="M4 6h16M4 12h16M4 18h10" /> },
  { href: "/ranking", label: "ランキング", match: (p: string) => p.startsWith("/ranking"), icon: <path d="M5 20V10M12 20V4M19 20v-7" /> },
  { href: "/posts", label: "記事", match: (p: string) => p.startsWith("/post"), icon: <path d="M5 4h11l3 3v13H5zM8 10h8M8 14h8" /> },
];

/** App-style tab bar on phones. Hidden on md+ where the header carries navigation. */
export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="モバイルナビゲーション"
      className="glass fixed inset-x-0 bottom-0 z-40 border-t border-line md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5">
        {ITEMS.map((it) => {
          const active = it.match(pathname);
          return (
            <li key={it.href}>
              <Link href={it.href} className={clsx("pressable control flex h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium", active ? "text-fg" : "text-subtle")}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={active ? 2.2 : 1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  {it.icon}
                </svg>
                {it.label}
              </Link>
            </li>
          );
        })}
        <li>
          <button type="button" onClick={() => window.dispatchEvent(new Event("open-search"))} className="pressable flex h-14 w-full flex-col items-center justify-center gap-0.5 text-[10px] font-medium text-subtle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            検索
          </button>
        </li>
      </ul>
    </nav>
  );
}
