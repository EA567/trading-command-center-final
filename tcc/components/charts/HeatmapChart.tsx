"use client";

import React from "react";
import { formatDate, formatMoney } from "@/lib/utils/format";

export function HeatmapChart({ dayTotals, weeks = 16 }: { dayTotals: Record<string, number>; weeks?: number }) {
  const days: { date: string; profit: number | null }[] = [];
  const today = new Date();
  const totalDays = weeks * 7;

  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    days.push({ date: iso, profit: dayTotals[iso] ?? null });
  }

  // group into columns of 7 (weeks)
  const columns: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) columns.push(days.slice(i, i + 7));

  const maxAbs = Math.max(1, ...days.map((d) => Math.abs(d.profit ?? 0)));

  const colorFor = (profit: number | null) => {
    if (profit === null) return "bg-zinc-900";
    if (profit === 0) return "bg-zinc-800";
    const intensity = Math.min(1, Math.abs(profit) / maxAbs);
    if (profit > 0) {
      if (intensity > 0.66) return "bg-emerald-400";
      if (intensity > 0.33) return "bg-emerald-500/60";
      return "bg-emerald-500/25";
    }
    if (intensity > 0.66) return "bg-rose-400";
    if (intensity > 0.33) return "bg-rose-500/60";
    return "bg-rose-500/25";
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {columns.map((col, ci) => (
          <div key={ci} className="flex flex-col gap-1">
            {col.map((d) => (
              <div
                key={d.date}
                title={d.profit !== null ? `${formatDate(d.date)} · ${formatMoney(d.profit, "USD", true)}` : formatDate(d.date)}
                className={`w-3.5 h-3.5 rounded-sm ${colorFor(d.profit)}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3 text-[11px] text-zinc-500">
        <span>Loss</span>
        <div className="flex gap-1">
          <div className="w-3 h-3 rounded-sm bg-rose-400" />
          <div className="w-3 h-3 rounded-sm bg-rose-500/60" />
          <div className="w-3 h-3 rounded-sm bg-zinc-800" />
          <div className="w-3 h-3 rounded-sm bg-emerald-500/60" />
          <div className="w-3 h-3 rounded-sm bg-emerald-400" />
        </div>
        <span>Profit</span>
      </div>
    </div>
  );
}
