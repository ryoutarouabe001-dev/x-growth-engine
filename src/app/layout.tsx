import "./globals.css";
import type { Metadata, Viewport } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { MobileTopNav } from "@/components/MobileTopNav";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "X Growth Engine",
  description: "X運用とAmazonアフィの半自動ダッシュボード",
  manifest: "/manifest.json",
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
    apple: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
  appleWebApp: {
    capable: true,
    title: "X Growth Engine",
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  themeColor: "#020617",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-full bg-slate-950 text-slate-50 antialiased">
        <MobileTopNav />
        <div className="flex min-h-[calc(100vh-1px)]">
          <aside className="hidden w-60 flex-col border-r border-slate-800 bg-slate-950/90 xl:flex xl:w-64">
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
              {NAV_ITEMS.map((item) => (
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
            <header className="hidden border-b border-slate-800 px-6 py-3 lg:block">
              <div className="text-xs uppercase tracking-[0.25em] text-slate-500">
                X Operations
              </div>
              <p className="text-sm text-slate-300">
                スマホは上の丸ボタンで移動。Amazonアフィは「Amazon」タブ。
              </p>
            </header>
            <div className="px-4 py-4 pb-28 lg:px-6 lg:py-6 lg:pb-6">{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
