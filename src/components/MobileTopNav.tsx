"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "@/lib/nav";
import { cn } from "@/lib/utils";

export function MobileTopNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md lg:hidden">
      <div className="flex items-center justify-between px-4 pb-2 pt-3">
        <Link href="/" className="text-sm font-semibold tracking-tight text-white">
          X Growth Engine
        </Link>
        <span className="text-[10px] text-slate-500">スマホOK</span>
      </div>
      <nav
        className="flex gap-1.5 overflow-x-auto px-3 pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        aria-label="メインメニュー"
      >
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "min-h-[40px] shrink-0 rounded-full px-3.5 py-2 text-xs font-medium leading-none transition-colors",
                active
                  ? "bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-500/50"
                  : "bg-slate-900/90 text-slate-400 ring-1 ring-slate-800 hover:bg-slate-800 hover:text-slate-200",
              )}
            >
              {item.short}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
