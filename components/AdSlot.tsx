"use client";

import { useEffect, useRef } from "react";
import { adsense } from "@/lib/monetize";

type Props = {
  /** Which configured slot to render. */
  kind: "infeed" | "article" | "display";
  className?: string;
  /** Show a dashed placeholder in development when no slot is configured. */
  placeholder?: boolean;
};

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

/**
 * Google AdSense unit. Renders nothing until NEXT_PUBLIC_ADSENSE_CLIENT and the
 * matching slot id are configured, so the layout is unaffected before approval.
 */
export function AdSlot({ kind, className = "", placeholder = process.env.NODE_ENV !== "production" }: Props) {
  const slot = adsense.slots[kind];
  const ref = useRef<HTMLModElement>(null);

  useEffect(() => {
    if (!adsense.client || !slot || !ref.current) return;
    if (ref.current.getAttribute("data-adsbygoogle-status")) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* blocked */
    }
  }, [slot]);

  if (!adsense.client || !slot) {
    if (!placeholder) return null;
    return (
      <div
        aria-hidden
        className={`ad-slot my-6 flex h-24 items-center justify-center rounded-lg border border-dashed border-line text-xs text-muted ${className}`}
      >
        AD ({kind})
      </div>
    );
  }

  const format = kind === "infeed" ? { "data-ad-format": "fluid", "data-ad-layout-key": "-6t+ed+2i-1n-4w" } : kind === "article" ? { "data-ad-format": "fluid", "data-ad-layout": "in-article" } : { "data-ad-format": "auto", "data-full-width-responsive": "true" };

  return (
    <div className={`ad-slot my-6 ${className}`}>
      <ins ref={ref} className="adsbygoogle block" data-ad-client={adsense.client} data-ad-slot={slot} {...format} />
    </div>
  );
}
