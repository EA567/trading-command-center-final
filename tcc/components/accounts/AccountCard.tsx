"use client";

import React from "react";
import { ArrowUpRight, ArrowDownRight, Repeat, Trash2, Pencil } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { StatusBadge } from "@/components/ui/Badge";
import { Account } from "@/types";
import { formatMoney, formatPercent } from "@/lib/utils/format";

export function AccountCard({
  account, tradeCount, winRate, onDelete, onEdit,
}: { account: Account; tradeCount: number; winRate: number; onDelete: () => void; onEdit: () => void }) {
  const growth = ((account.currentBalance - account.startingBalance) / account.startingBalance) * 100;
  return (
    <Panel className="p-5 group hover:border-zinc-700 transition-colors duration-200 relative overflow-hidden">
      <div className="absolute -right-8 -top-8 w-28 h-28 rounded-full bg-gradient-to-br from-emerald-400/10 to-transparent blur-2xl group-hover:from-emerald-400/20 transition-all" />
      <div className="flex items-start justify-between mb-4 relative">
        <div>
          <h3 className="font-semibold text-zinc-50">{account.name}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{account.broker} · {account.type}</p>
        </div>
        <StatusBadge status={account.status} />
      </div>
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Balance</p>
          <p className="text-lg font-mono font-bold text-zinc-50 tabular-nums">{formatMoney(account.currentBalance)}</p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Equity</p>
          <p className="text-lg font-mono font-bold text-zinc-300 tabular-nums">{formatMoney(account.equity)}</p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Profit</p>
          <p className={`text-sm font-mono font-bold tabular-nums flex items-center gap-1 ${growth >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {growth >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {formatPercent(growth)}
          </p>
        </div>
        <div>
          <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-1">Win Rate</p>
          <p className="text-sm font-mono font-bold text-zinc-300 tabular-nums">{winRate.toFixed(0)}%</p>
        </div>
      </div>
      <div className="flex items-center justify-between pt-3 border-t border-zinc-800">
        <span className="flex items-center gap-1 text-xs text-zinc-500"><Repeat size={12} /> {tradeCount} trades</span>
        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={onEdit} className="text-zinc-600 hover:text-blue-400"><Pencil size={14} /></button>
          <button onClick={onDelete} className="text-zinc-600 hover:text-rose-400"><Trash2 size={14} /></button>
        </div>
      </div>
    </Panel>
  );
}
