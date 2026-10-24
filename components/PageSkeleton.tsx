/** Neutral fallback shown while a URL-specific page body streams in (Cache Components app shell). */
export function PageSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <div className="animate-pulse" aria-hidden>
      <div className="mb-5 h-3 w-48 rounded bg-elev-2" />
      {hero ? <div className="h-[46svh] min-h-[320px] rounded-2xl bg-elev" /> : <div className="h-9 w-2/3 max-w-lg rounded bg-elev-2" />}
      <div className="mt-8 space-y-3">
        <div className="h-4 w-full max-w-2xl rounded bg-elev" />
        <div className="h-4 w-5/6 max-w-xl rounded bg-elev" />
        <div className="h-4 w-2/3 max-w-lg rounded bg-elev" />
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="aspect-[16/9] rounded-xl bg-elev" />
        ))}
      </div>
    </div>
  );
}
