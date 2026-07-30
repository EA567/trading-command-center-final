"use client";

import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { formatMoney } from "@/lib/utils/format";

export interface DaySummary {
  total: number;
  count: number;
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarGrid({
  year, month, dayTotals, onSelectDay, onPrevMonth, onNextMonth,
}: {
  year: number;
  month: number; // 0-indexed
  dayTotals: Record<string, DaySummary>;
  onSelectDay: (iso: string) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const firstDay = new Date(year, month, 1);
  const startWeekday = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthLabel = firstDay.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  const cells: (number | null)[] = [];
  for (let i = 0; i < startWeekday; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const iso = (d: number) => `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const monthEntries = Object.entries(dayTotals).filter(([date]) => date.startsWith(`${year}-${String(month + 1).padStart(2, "0")}`));
  const monthTotal = monthEntries.reduce((s, [, v]) => s + v.total, 0);
  const monthTradeCount = monthEntries.reduce((s, [, v]) => s + v.count, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-zinc-100 text-lg">{monthLabel}</h3>
          <p className={`text-sm font-mono font-semibold ${monthTotal >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {formatMoney(monthTotal, "USD", true)} <span className="text-zinc-500 font-sans font-normal">· {monthTradeCount} trade{monthTradeCount !== 1 ? "s" : ""} this month</span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onPrevMonth} className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors"><ChevronLeft size={16} /></button>
          <button onClick={onNextMonth} className="p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 transition-colors"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2">
        {WEEKDAYS.map((w) => (
          <div key={w} className="text-center text-[11px] font-semibold text-zinc-500 uppercase tracking-wide py-1">{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {cells.map((d, i) => {
          if (d === null) return <div key={`empty-${i}`} />;
          const dateIso = iso(d);
          const summary = dayTotals[dateIso];
          const hasTrade = !!summary;
          const isProfit = hasTrade && summary.total >= 0;
          const isToday = dateIso === new Date().toISOString().slice(0, 10);
          return (
            <button
              key={dateIso}
              onClick={() => hasTrade && onSelectDay(dateIso)}
              disabled={!hasTrade}
              className={`group relative aspect-square rounded-xl sm:rounded-2xl border p-1 sm:p-2 flex flex-col items-start justify-between transition-all duration-150 ${
                hasTrade
                  ? isProfit
                    ? "bg-emerald-400/10 border-emerald-400/30 hover:bg-emerald-400/20 hover:border-emerald-400/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/40 cursor-pointer"
                    : "bg-rose-400/10 border-rose-400/30 hover:bg-rose-400/20 hover:border-rose-400/50 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-rose-950/40 cursor-pointer"
                  : "bg-zinc-900/40 border-zinc-800 cursor-default"
              } ${isToday ? "ring-1 ring-blue-400/60" : ""}`}
            >
              <span className={`text-[10px] sm:text-xs font-semibold ${isToday ? "text-blue-400" : "text-zinc-400"}`}>{d}</span>
              {hasTrade && (
                <div className="w-full leading-tight">
                  <span className={`block text-[9px] sm:text-[11px] font-mono font-bold ${isProfit ? "text-emerald-400" : "text-rose-400"}`}>
                    {formatMoney(summary.total, "USD", true)}
                  </span>
                  <span className="hidden sm:block text-[9px] text-zinc-500 mt-0.5">
                    {summary.count} trade{summary.count !== 1 ? "s" : ""}
                  </span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
