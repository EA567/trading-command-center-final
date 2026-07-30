"use client";

import React from "react";
import { Wallet, Clock, Calendar as CalendarIcon, Layers, Gauge, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Account, Trade } from "@/types";
import { formatDate, formatMoney } from "@/lib/utils/format";

function accountName(accounts: Account[], accountId: string) {
  return accounts.find((a) => a.id === accountId)?.name || "Unknown Account";
}

/** Compact row-style card used in the day's trade list. */
export function TradeSummaryCard({
  trade, accounts, onClick,
}: { trade: Trade; accounts: Account[]; onClick: () => void }) {
  const win = trade.profitLoss >= 0;
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 rounded-2xl border transition-all duration-150 hover:-translate-y-0.5 hover:shadow-lg ${
        win ? "bg-emerald-400/[0.06] border-emerald-400/25 hover:border-emerald-400/50 hover:shadow-emerald-950/40" : "bg-rose-400/[0.06] border-rose-400/25 hover:border-rose-400/50 hover:shadow-rose-950/40"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`w-1.5 h-8 rounded-full shrink-0 ${win ? "bg-emerald-400" : "bg-rose-400"}`} />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-zinc-100">{trade.pair}</span>
              <Badge tone={trade.direction === "BUY" ? "green" : "red"}>{trade.direction}</Badge>
            </div>
            <p className="text-xs text-zinc-500 truncate mt-0.5">{accountName(accounts, trade.accountId)} · {trade.time} · {trade.session}</p>
          </div>
        </div>
        <span className={`font-mono font-bold text-base shrink-0 ${win ? "text-emerald-400" : "text-rose-400"}`}>
          {formatMoney(trade.profitLoss, "USD", true)}
        </span>
      </div>
    </button>
  );
}

function StatCell({ icon: Icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <div className="flex items-center gap-2.5 p-3 rounded-xl bg-zinc-950/60 border border-zinc-800">
      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
        <Icon size={14} className="text-zinc-500" />
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-mono font-semibold text-zinc-200 truncate">{value}</p>
      </div>
    </div>
  );
}

/** Full professional trade card shown at the top of the journal detail view. */
export function TradeCard({ trade, accounts }: { trade: Trade; accounts: Account[] }) {
  const win = trade.profitLoss >= 0;
  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 sm:p-6 ${win ? "bg-gradient-to-br from-emerald-400/[0.08] via-zinc-900 to-zinc-900 border-emerald-400/25" : "bg-gradient-to-br from-rose-400/[0.08] via-zinc-900 to-zinc-900 border-rose-400/25"}`}>
      <div className={`absolute -right-10 -top-10 w-40 h-40 rounded-full blur-3xl ${win ? "bg-emerald-400/10" : "bg-rose-400/10"}`} />

      <div className="relative flex items-start justify-between gap-4 flex-wrap mb-5">
        <div className="flex items-center gap-3">
          <span className="text-2xl sm:text-3xl font-mono font-bold text-zinc-50 tracking-tight">{trade.pair}</span>
          <Badge tone={trade.direction === "BUY" ? "green" : "red"} className="text-xs px-2.5 py-1">{trade.direction}</Badge>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-zinc-500 uppercase tracking-wide mb-0.5">Profit / Loss</p>
          <p className={`text-2xl sm:text-3xl font-mono font-bold tabular-nums ${win ? "text-emerald-400" : "text-rose-400"}`}>
            {formatMoney(trade.profitLoss, "USD", true)}
          </p>
        </div>
      </div>

      <div className="relative grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <StatCell icon={Wallet} label="Account" value={accountName(accounts, trade.accountId)} />
        <StatCell icon={Layers} label="Session" value={trade.session} />
        <StatCell icon={CalendarIcon} label="Date" value={formatDate(trade.date)} />
        <StatCell icon={Clock} label="Time" value={trade.time} />
        <StatCell icon={Gauge} label="Lot Size" value={trade.lotSize.toFixed(2)} />
        <StatCell icon={DollarSign} label="Risk ($)" value={formatMoney(trade.riskAmount)} />
        <StatCell icon={Gauge} label="R:R" value={`${trade.rr.toFixed(2)}R`} />
      </div>
    </div>
  );
}
