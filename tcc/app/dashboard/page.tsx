"use client";

import React, { useMemo, useState } from "react";
import {
  Wallet, TrendingUp, TrendingDown, Target, Percent, Layers, Activity,
  BarChart3, ArrowDownRight, ArrowUpRight, Plus, Gauge, Repeat, PieChart as PieIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { useToast } from "@/components/ui/Toast";
import { StatCard } from "@/components/ui/StatCard";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { PrimaryButton } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/EmptyState";
import { EquityCurveChart } from "@/components/charts/EquityCurveChart";
import { ProfitBarChart } from "@/components/charts/ProfitBarChart";
import { WinLossPieChart } from "@/components/charts/WinLossPieChart";
import { TradeModal } from "@/components/trades/TradeModal";
import { computeStats, equityCurve, monthlyProfitSeries } from "@/lib/utils/stats";
import { formatDate, formatMoney } from "@/lib/utils/format";

export default function DashboardPage() {
  const { loading, visibleAccounts, visibleTrades, accounts, addTrade } = useAppStore();
  const { pushToast } = useToast();
  const [tradeModalOpen, setTradeModalOpen] = useState(false);

  const stats = useMemo(() => computeStats(visibleAccounts, visibleTrades), [visibleAccounts, visibleTrades]);
  const equity = useMemo(() => equityCurve(visibleAccounts, visibleTrades), [visibleAccounts, visibleTrades]);
  const monthly = useMemo(() => monthlyProfitSeries(visibleTrades), [visibleTrades]);
  const recent = visibleTrades.slice(0, 6);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Dashboard</h1>
          <p className="text-sm text-zinc-500 mt-1">Live overview across your trading desk</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setTradeModalOpen(true)}>Log Trade</PrimaryButton>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <StatCard label="Total Balance" value={formatMoney(stats.totalBalance)} sub={`${visibleAccounts.length} account${visibleAccounts.length !== 1 ? "s" : ""}`} icon={Wallet} />
        <StatCard label="Equity" value={formatMoney(stats.equity)} sub="Live account equity" icon={Activity} tone="blue" />
        <StatCard label="Daily P/L" value={formatMoney(stats.dailyPL, "USD", true)} sub="Today" icon={stats.dailyPL >= 0 ? TrendingUp : TrendingDown} tone={stats.dailyPL >= 0 ? "green" : "red"} />
        <StatCard label="Weekly P/L" value={formatMoney(stats.weeklyPL, "USD", true)} sub="This week" icon={stats.weeklyPL >= 0 ? TrendingUp : TrendingDown} tone={stats.weeklyPL >= 0 ? "green" : "red"} />
        <StatCard label="Monthly P/L" value={formatMoney(stats.monthlyPL, "USD", true)} sub="This month" icon={stats.monthlyPL >= 0 ? TrendingUp : TrendingDown} tone={stats.monthlyPL >= 0 ? "green" : "red"} />
        <StatCard label="Overall Profit" value={formatMoney(stats.overallProfit, "USD", true)} sub="All time, closed trades" icon={stats.overallProfit >= 0 ? ArrowUpRight : ArrowDownRight} tone={stats.overallProfit >= 0 ? "green" : "red"} />
        <StatCard label="Win Rate" value={`${stats.winRate.toFixed(1)}%`} sub={`${stats.closedPositions} closed trades`} icon={Target} tone="blue" />
        <StatCard label="Avg Risk %" value={`${stats.avgRiskPercent.toFixed(2)}%`} sub="Per trade" icon={Gauge} />
        <StatCard label="Avg R:R" value={`${stats.avgRR.toFixed(2)}R`} sub="Risk to reward" icon={BarChart3} />
        <StatCard label="Total Trades" value={String(stats.totalTrades)} sub={`${stats.openPositions} open · ${stats.closedPositions} closed`} icon={Layers} />
        <StatCard label="Open Positions" value={String(stats.openPositions)} sub="Currently running" icon={Repeat} tone="blue" />
        <StatCard label="Closed Positions" value={String(stats.closedPositions)} sub="Fully settled" icon={Repeat} />
        <StatCard label="Drawdown" value={`${stats.drawdown.toFixed(1)}%`} sub="Peak to trough" icon={TrendingDown} tone="red" />
        <StatCard label="Profit Factor" value={stats.profitFactor === Infinity ? "∞" : stats.profitFactor.toFixed(2)} sub="Gross win / gross loss" icon={PieIcon} tone="blue" />
      </div>

      <Panel className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-zinc-100">Equity Curve</h3>
            <p className="text-xs text-zinc-500 mt-0.5">Cumulative balance across selected accounts</p>
          </div>
          <Badge tone={stats.overallProfit >= 0 ? "green" : "red"}>
            {stats.overallProfit >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {formatMoney(stats.overallProfit, "USD", true)}
          </Badge>
        </div>
        <EquityCurveChart data={equity} />
      </Panel>

      <div className="grid md:grid-cols-2 gap-4">
        <Panel className="p-5">
          <h3 className="font-semibold text-zinc-100 mb-1">Monthly Performance</h3>
          <p className="text-xs text-zinc-500 mb-4">Net profit by calendar month</p>
          <ProfitBarChart data={monthly} xKey="month" />
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-semibold text-zinc-100">Win / Loss Distribution</h3>
          </div>
          <p className="text-xs text-zinc-500 mb-2">{stats.closedPositions} closed trades</p>
          <WinLossPieChart wins={stats.closedPositions - Math.round((1 - stats.winRate / 100) * stats.closedPositions)} losses={Math.round((1 - stats.winRate / 100) * stats.closedPositions)} />
        </Panel>
      </div>

      <Panel className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-zinc-100">Recent Trades</h3>
          <span className="text-xs text-zinc-500">Last {recent.length}</span>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-zinc-500 py-8 text-center">No trades logged yet.</p>
        ) : (
          <div className="space-y-2">
            {recent.map((t) => (
              <div key={t.id} className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-zinc-800/40 transition-colors">
                <div className="flex items-center gap-3">
                  <Badge tone={t.direction === "BUY" ? "green" : "red"}>{t.direction}</Badge>
                  <div>
                    <p className="text-sm font-medium text-zinc-200 font-mono">{t.pair}</p>
                    <p className="text-[11px] text-zinc-500">{formatDate(t.date)} · {t.session}</p>
                  </div>
                </div>
                <span className={`font-mono text-sm font-semibold tabular-nums ${t.profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                  {formatMoney(t.profitLoss, "USD", true)}
                </span>
              </div>
            ))}
          </div>
        )}
      </Panel>

      {tradeModalOpen && (
        <TradeModal
          accounts={accounts}
          onClose={() => setTradeModalOpen(false)}
          onSubmit={(t) => {
            addTrade(t);
            pushToast(`${t.direction} ${t.pair} logged`);
            setTradeModalOpen(false);
          }}
        />
      )}
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
      </div>
      <Skeleton className="h-80" />
      <div className="grid md:grid-cols-2 gap-4">
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    </div>
  );
}
