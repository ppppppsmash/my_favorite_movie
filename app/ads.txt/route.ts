/**
 * ads.txt for Google AdSense. Serves the publisher line once
 * NEXT_PUBLIC_ADSENSE_CLIENT (ca-pub-XXXX) is configured; otherwise an empty file.
 */
export function GET() {
  const client = process.env.NEXT_PUBLIC_ADSENSE_CLIENT ?? "";
  const pub = client.replace(/^ca-/, "");
  const body = pub ? `google.com, ${pub}, DIRECT, f08c47fec0942fa0\n` : "";
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=86400" } });
}
