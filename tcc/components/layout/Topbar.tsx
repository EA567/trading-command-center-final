"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Bell, ChevronDown, Menu, Sun, Moon } from "lucide-react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { useTheme } from "@/lib/theme/ThemeContext";
import { buildNotifications } from "@/lib/utils/notifications";
import { Badge } from "@/components/ui/Badge";

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";
  return (
    <button
      onClick={toggleTheme}
      title={isLight ? "Switch to dark mode" : "Switch to light mode"}
      aria-label="Toggle color theme"
      className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100 transition-colors"
    >
      <Sun size={16} className={`transition-all duration-200 ${isLight ? "opacity-100 scale-100 rotate-0" : "opacity-0 scale-50 -rotate-90 absolute inset-0 m-auto"}`} />
      <Moon size={16} className={`transition-all duration-200 ${isLight ? "opacity-0 scale-50 rotate-90 absolute inset-0 m-auto" : "opacity-100 scale-100 rotate-0"}`} />
    </button>
  );
}

export function Topbar({ onMobileMenu }: { onMobileMenu: () => void }) {
  const { accounts, activeAccountId, setActiveAccountId, goals, tasks } = useAppStore();
  const [accountOpen, setAccountOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);

  const activeLabel = activeAccountId === "all" ? "All Accounts" : accounts.find((a) => a.id === activeAccountId)?.name || "All Accounts";
  const notifications = buildNotifications(goals, tasks).slice(0, 6);

  return (
    <header className="hidden md:flex items-center justify-between border-b border-zinc-900 bg-zinc-950/80 backdrop-blur px-6 py-3 sticky top-0 z-20">
      <div className="relative">
        <button
          onClick={() => setAccountOpen((v) => !v)}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-sm font-medium text-zinc-200"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          {activeLabel}
          <ChevronDown size={14} className="text-zinc-500" />
        </button>
        {accountOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setAccountOpen(false)} />
            <div className="absolute left-0 mt-2 w-64 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden">
              <button
                onClick={() => { setActiveAccountId("all"); setAccountOpen(false); }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800 ${activeAccountId === "all" ? "text-emerald-400" : "text-zinc-300"}`}
              >
                All Accounts (aggregate)
              </button>
              <div className="h-px bg-zinc-800" />
              {accounts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => { setActiveAccountId(a.id); setAccountOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm hover:bg-zinc-800 flex items-center justify-between ${activeAccountId === a.id ? "text-emerald-400" : "text-zinc-300"}`}
                >
                  {a.name}
                  <span className="text-xs text-zinc-500">${a.currentBalance.toLocaleString()}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        <ThemeToggle />

        <div className="relative">
          <button onClick={() => setBellOpen((v) => !v)} className="relative p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-100">
            <Bell size={16} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-[10px] font-bold text-zinc-950 flex items-center justify-center">
                {notifications.length}
              </span>
            )}
          </button>
          {bellOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setBellOpen(false)} />
              <div className="absolute right-0 mt-2 w-80 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-20 overflow-hidden">
                <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
                  <span className="text-sm font-semibold text-zinc-200">Notifications</span>
                  <Link href="/notifications" className="text-xs text-blue-400 hover:underline" onClick={() => setBellOpen(false)}>
                    View all
                  </Link>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <p className="text-sm text-zinc-500 text-center py-6">You&apos;re all caught up.</p>
                  ) : (
                    notifications.map((n) => (
                      <div key={n.id} className="px-4 py-3 border-b border-zinc-800/60 last:border-0">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <p className="text-sm font-medium text-zinc-200 truncate">{n.title}</p>
                          <Badge tone={n.severity === "critical" ? "red" : n.severity === "warning" ? "amber" : "blue"}>{n.type}</Badge>
                        </div>
                        <p className="text-xs text-zinc-500">{n.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

export function MobileTopbar({ onMenu }: { onMenu: () => void }) {
  return (
    <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-zinc-950/90 backdrop-blur border-b border-zinc-900 flex items-center justify-between px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-400 to-blue-500 flex items-center justify-center font-bold text-zinc-950 text-xs">Ω</div>
        <span className="font-bold text-sm">COMMAND CENTER</span>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button onClick={onMenu} className="p-2 text-zinc-400">
          <Menu size={20} />
        </button>
      </div>
    </div>
  );
}
