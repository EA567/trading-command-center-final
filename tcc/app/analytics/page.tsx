"use client";

import React, { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { ProfitBarChart } from "@/components/charts/ProfitBarChart";
import { WinLossPieChart } from "@/components/charts/WinLossPieChart";
import { HeatmapChart } from "@/components/charts/HeatmapChart";
import { PageLoading } from "@/components/ui/PageLoading";
import { computeStats, equityCurve, groupProfitBy, monthlyProfitSeries, tradesByDayMap } from "@/lib/utils/stats";
import { formatMoney } from "@/lib/utils/format";
import { Trophy, TrendingDown, Flame, Snowflake, Target, Percent } from "lucide-react";

const GROUPINGS = [
  { key: "month", label: "Month" },
  { key: "week", label: "Week" },
  { key: "day", label: "Day of Week" },
  { key: "session", label: "Session" },
  { key: "pair", label: "Pair" },
] as const;

export default function AnalyticsPage() {
  const { loading, visibleAccounts, visibleTrades } = useAppStore();
  const [grouping, setGrouping] = useState<(typeof GROUPINGS)[number]["key"]>("pair");

  const stats = useMemo(() => computeStats(visibleAccounts, visibleTrades), [visibleAccounts, visibleTrades]);
  const equity = useMemo(() => equityCurve(visibleAccounts, visibleTrades), [visibleAccounts, visibleTrades]);
  const monthly = useMemo(() => monthlyProfitSeries(visibleTrades), [visibleTrades]);
  const grouped = useMemo(() => groupProfitBy(visibleTrades, grouping), [visibleTrades, grouping]);
  const dayTotals = useMemo(() => {
    const map = tradesByDayMap(visibleTrades);
    const totals: Record<string, number> = {};
    Object.entries(map).forEach(([date, trades]) => { totals[date] = trades.reduce((s, t) => s + t.profitLoss, 0); });
    return totals;
  }, [visibleTrades]);

  if (loading) return <PageLoading variant="cards" />;

  const wins = stats.closedPositions - Math.round((1 - stats.winRate / 100) * stats.closedPositions);
  const losses = stats.closedPositions - wins;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Analytics</h1>
        <p className="text-sm text-zinc-500 mt-1">Deeper performance breakdown across your journal</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard label="Avg Win" value={formatMoney(stats.avgWin)} icon={Trophy} tone="green" />
        <StatCard label="Avg Loss" value={formatMoney(stats.avgLoss)} icon={TrendingDown} tone="red" />
        <StatCard label="Biggest Win" value={formatMoney(stats.biggestWin)} icon={Trophy} tone="green" />
        <StatCard label="Biggest Loss" value={formatMoney(stats.biggestLoss)} icon={TrendingDown} tone="red" />
        <StatCard label="Max Consecutive Wins" value={String(stats.maxConsecutiveWins)} icon={Flame} tone="green" />
        <StatCard label="Max Consecutive Losses" value={String(stats.maxConsecutiveLosses)} icon={Snowflake} tone="red" />
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} icon={Target} tone="blue" />
        <StatCard label="Profit Factor" value={stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)} icon={Percent} tone="blue" />
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Panel className="p-5">
          <h3 className="font-semibold text-zinc-100 mb-1">Win / Loss Split</h3>
          <p className="text-xs text-zinc-500 mb-2">{stats.closedPositions} closed trades</p>
          <WinLossPieChart wins={wins} losses={losses} />
          <div className="flex items-center justify-center gap-5 -mt-2">
            <span className="flex items-center gap-1.5 text-xs text-zinc-400"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Wins {wins}</span>
            <span className="flex items-center gap-1.5 text-xs text-zinc-400"><span className="w-2 h-2 rounded-full bg-rose-400" /> Losses {losses}</span>
          </div>
        </Panel>

        <Panel className="p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-1 flex-wrap gap-2">
            <h3 className="font-semibold text-zinc-100">Profit Breakdown</h3>
            <div className="flex flex-wrap gap-1.5">
              {GROUPINGS.map((g) => (
                <button
                  key={g.key}
                  onClick={() => setGrouping(g.key)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${grouping === g.key ? "bg-zinc-50 text-zinc-950" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
          <p className="text-xs text-zinc-500 mb-4">Net profit grouped by {GROUPINGS.find((g) => g.key === grouping)?.label.toLowerCase()}</p>
          <ProfitBarChart data={grouped} xKey="label" layout={grouping === "pair" ? "vertical" : "horizontal"} height={260} />
        </Panel>
      </div>

      <Panel className="p-5">
        <h3 className="font-semibold text-zinc-100 mb-1">Equity Curve — Detailed</h3>
        <p className="text-xs text-zinc-500 mb-4">Full history across selected accounts</p>
        <EquityCurveChart data={equity} />
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel className="p-5">
          <h3 className="font-semibold text-zinc-100 mb-4">Monthly Profit</h3>
          <ProfitBarChart data={monthly} xKey="month" />
        </Panel>
        <Panel className="p-5">
          <h3 className="font-semibold text-zinc-100 mb-4">Daily Activity Heat Map</h3>
          <HeatmapChart dayTotals={dayTotals} />
        </Panel>
      </div>
    </div>
  );
}
