"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Wallet, Repeat, CalendarDays, BarChart3, Brain,
  Target, ListChecks, Settings as SettingsIcon,
} from "lucide-react";

const GROUPS = [
  {
    label: "Trading Desk",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
      { href: "/accounts", label: "Accounts", icon: Wallet },
      { href: "/trades", label: "Trades", icon: Repeat },
      { href: "/calendar", label: "Calendar", icon: CalendarDays },
      { href: "/analytics", label: "Analytics", icon: BarChart3 },
    ],
  },
  {
    label: "Mindset & Growth",
    items: [
      { href: "/psychology", label: "Psychology", icon: Brain },
      { href: "/goals", label: "Goals", icon: Target },
    ],
  },
  {
    label: "Productivity",
    items: [
      { href: "/tasks", label: "Tasks", icon: ListChecks },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex flex-col w-64 shrink-0 border-r border-zinc-900 bg-zinc-950/80 sticky top-0 h-screen overflow-y-auto">
      <div className="px-6 py-6 flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center font-bold text-zinc-950 text-sm">
          Ω
        </div>
        <div>
          <p className="font-bold text-sm tracking-tight leading-none">COMMAND CENTER</p>
          <p className="text-[10px] text-zinc-500 mt-1 tracking-wide">TRADING OPERATING SYSTEM</p>
        </div>
      </div>

      <nav className="flex-1 px-3 mt-2 space-y-5 pb-4">
        {GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-1.5 text-[10px] font-semibold text-zinc-600 uppercase tracking-wider">{group.label}</p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors duration-150 ${
                      active ? "bg-zinc-900 text-zinc-50 ring-1 ring-zinc-800" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60"
                    }`}
                  >
                    <item.icon size={17} className={active ? "text-emerald-400" : ""} />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-4">
        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
            pathname === "/settings" ? "bg-zinc-900 text-zinc-50" : "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900/60"
          }`}
        >
          <SettingsIcon size={17} />
          Settings
        </Link>
        <div className="mt-3 p-4 rounded-xl bg-zinc-900/70 border border-zinc-800">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-semibold text-zinc-300 tracking-wide">LOCAL SESSION</span>
          </div>
          <p className="text-[11px] text-zinc-500">Connect Supabase in Settings → Backup to sync across devices.</p>
        </div>
      </div>
    </aside>
  );
}
