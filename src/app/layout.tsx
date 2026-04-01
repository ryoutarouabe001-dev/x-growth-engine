import "./globals.css";
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "X Growth Engine",
  description: "X専用の半自動運用ダッシュボード",
};

const navItems = [
  { href: "/", label: "ダッシュボード" },
  { href: "/scheduler", label: "投稿スケジュール" },
  { href: "/inbox", label: "リプ / メンション" },
  { href: "/analytics", label: "分析" },
];

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-full bg-slate-950 text-slate-50 antialiased">
        <div className="flex min-h-screen">
          <aside className="flex w-64 flex-col border-r border-slate-800 bg-slate-950/90">
            <div className="border-b border-slate-800 px-5 py-4">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                X Growth
              </div>
              <div className="mt-1 text-lg font-semibold">Engine</div>
              <p className="mt-1 text-xs leading-relaxed text-slate-500">
                投稿・返信・分析を1か所に集約
              </p>
            </div>
            <nav className="mt-4 flex-1 space-y-1 px-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "block rounded-md px-3 py-2 text-sm font-medium text-slate-200 transition-colors",
                    "hover:bg-slate-800 hover:text-white",
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-slate-800 px-4 py-4 text-xs text-slate-500">
              <div className="mb-1 text-[10px] uppercase tracking-[0.18em]">Status</div>
              <div className="flex items-center justify-between gap-2">
                <span>半自動運用</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-2 py-0.5 text-[10px] text-emerald-300">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                  Ready
                </span>
              </div>
            </div>
          </aside>

          <main className="min-w-0 flex-1 bg-slate-950">
            <header className="flex items-center justify-between border-b border-slate-800 px-6 py-3">
              <div>
                <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  X Operations
                </div>
                <p className="text-sm text-slate-300">
                  伸びる型の投稿と返信に集中できるUI（APIは後から接続）
                </p>
              </div>
              <div className="hidden items-center gap-3 text-xs text-slate-400 sm:flex">
                <span>本番: Vercel</span>
                <span className="rounded-full border border-slate-700 px-2 py-1 text-[11px] text-slate-300">
                  Next.js App Router
                </span>
              </div>
            </header>
            <div className="px-6 py-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
