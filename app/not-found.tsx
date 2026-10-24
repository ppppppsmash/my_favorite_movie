import Link from "next/link";

export default function NotFound() {
  return (
    <div className="py-24 text-center">
      <p className="display text-7xl text-line-strong">404</p>
      <h1 className="mt-4 text-xl font-bold">ページが見つかりませんでした</h1>
      <p className="mt-2 text-sm text-muted">URL が変わったか、削除された可能性があります。</p>
      <div className="mt-8 flex justify-center gap-3">
        <Link href="/" className="pressable rounded-full bg-fg px-5 py-2 text-sm font-bold text-bg">
          ホームへ
        </Link>
        <Link href="/lists" className="pressable rounded-full border border-line px-5 py-2 text-sm text-muted hover:text-fg">
          リストを探す
        </Link>
      </div>
    </div>
  );
}
