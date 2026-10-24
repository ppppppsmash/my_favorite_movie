/** 5-star rating rendered from a 0–10 TMDB score. */
export function Stars({ value, className = "" }: { value: number; className?: string }) {
  const five = Math.max(0, Math.min(5, value / 2));
  const pct = (five / 5) * 100;
  return (
    <span className={`relative inline-block h-3.5 w-[4.6rem] align-middle ${className}`} aria-label={`${value.toFixed(1)} / 10`} role="img">
      <StarRow className="text-line" />
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <StarRow className="text-star" />
      </span>
    </span>
  );
}

function StarRow({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 74 14" className={`absolute inset-0 h-full w-full ${className}`} fill="currentColor" aria-hidden>
      {[0, 15, 30, 45, 60].map((x) => (
        <path key={x} transform={`translate(${x},0)`} d="M7 .8l1.9 4 4.4.6-3.2 3.1.8 4.4L7 10.8l-3.9 2.1.8-4.4L.7 5.4l4.4-.6z" />
      ))}
    </svg>
  );
}
