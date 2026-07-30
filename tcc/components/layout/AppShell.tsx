"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Wallet, Repeat, CalendarDays, BarChart3,
  Brain, Target, ListChecks, Settings as SettingsIcon, Plus,
} from "lucide-react";
import { Sidebar } from "./Sidebar";
import { Topbar, MobileTopbar } from "./Topbar";

const MOBILE_NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/accounts", label: "Accounts", icon: Wallet },
  { href: "/trades", label: "Trades", icon: Repeat },
  { href: "/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
];

const ALL_NAV = [
  ...MOBILE_NAV,
  { href: "/psychology", label: "Psychology", icon: Brain },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/settings", label: "Settings", icon: SettingsIcon },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="min-h-screen w-full bg-zinc-950 text-zinc-100 font-sans flex">
      <Sidebar />

      <MobileTopbar onMenu={() => setMobileOpen((v) => !v)} />
      {mobileOpen && (
        <div className="md:hidden fixed top-[52px] inset-x-0 z-30 bg-zinc-950 border-b border-zinc-900 px-3 py-2 space-y-1 max-h-[calc(100vh-52px)] overflow-y-auto">
          {ALL_NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${active ? "bg-zinc-900 text-zinc-50" : "text-zinc-500"}`}
              >
                <item.icon size={17} />
                {item.label}
              </Link>
            );
          })}
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <Topbar onMobileMenu={() => setMobileOpen((v) => !v)} />
        <main className="flex-1 min-w-0 pt-16 md:pt-0 pb-20 md:pb-0">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">{children}</div>
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-zinc-950/95 backdrop-blur border-t border-zinc-900 flex items-center justify-around px-2 py-2">
        {MOBILE_NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href} className={`flex flex-col items-center gap-1 px-2 py-1.5 rounded-lg text-[10px] font-medium ${active ? "text-emerald-400" : "text-zinc-500"}`}>
              <item.icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <Link
        href="/trades?add=1"
        className="md:hidden fixed bottom-20 right-4 z-30 w-14 h-14 rounded-full bg-zinc-50 text-zinc-950 shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
      >
        <Plus size={24} />
      </Link>
    </div>
  );
}
