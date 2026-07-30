"use client";

import React from "react";
import { X, BookOpen, CircleDot } from "lucide-react";
import { TradeSummaryCard } from "./TradeCard";
import { Account, Trade } from "@/types";
import { formatDate, formatMoney } from "@/lib/utils/format";

export function DayDrawer({
  dateIso, trades, accounts, onClose, onSelectTrade,
}: {
  dateIso: string;
  trades: Trade[];
  accounts: Account[];
  onClose: () => void;
  onSelectTrade: (trade: Trade) => void;
}) {
  const total = trades.reduce((s, t) => s + t.profitLoss, 0);
  const wins = trades.filter((t) => t.profitLoss >= 0).length;

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-zinc-950 border border-zinc-800 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-start justify-between px-6 pt-6 pb-4 sticky top-0 bg-zinc-950/95 backdrop-blur z-10 border-b border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-50">{formatDate(dateIso)}</h2>
            <div className="flex items-center gap-3 mt-1">
              <p className={`text-sm font-mono font-semibold ${total >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                {formatMoney(total, "USD", true)}
              </p>
              <span className="text-xs text-zinc-500 flex items-center gap-1">
                <CircleDot size={11} /> {trades.length} trade{trades.length !== 1 ? "s" : ""} · {wins}W / {trades.length - wins}L
              </span>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 p-1"><X size={18} /></button>
        </div>

        <div className="px-6 py-4 space-y-2.5">
          {trades.map((t) => (
            <div key={t.id} className="relative">
              <TradeSummaryCard trade={t} accounts={accounts} onClick={() => onSelectTrade(t)} />
              {t.journal && t.journal.trim() && (
                <span className="absolute top-3 right-3 pointer-events-none">
                  <BookOpen size={12} className="text-amber-400" />
                </span>
              )}
            </div>
          ))}
        </div>

        <p className="px-6 pb-5 text-xs text-zinc-600 text-center">Tap a trade to open its full journal entry</p>
      </div>
    </div>
  );
}
