"use client";

import React from "react";
import { ArrowLeft, X } from "lucide-react";
import { TradeCard } from "./TradeCard";
import { TradeJournalEditor } from "./TradeJournalEditor";
import { Account, Trade } from "@/types";

export function TradeJournalModal({
  trade, accounts, onBack, onClose, onSave,
}: {
  trade: Trade;
  accounts: Account[];
  onBack: () => void;
  onClose: () => void;
  onSave: (html: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 lg:p-8">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-5xl bg-zinc-950 border border-zinc-800 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[96vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 sm:px-8 py-4 bg-zinc-950/95 backdrop-blur border-b border-zinc-800">
          <button onClick={onBack} className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-100 transition-colors">
            <ArrowLeft size={15} /> Back to day
          </button>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 p-1"><X size={18} /></button>
        </div>

        <div className="px-5 sm:px-8 py-6 space-y-6">
          <TradeCard trade={trade} accounts={accounts} />

          <div>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-1">
              <h3 className="font-serif text-xl text-zinc-100">Journal</h3>
              <p className="text-[11px] text-zinc-500">Why you entered · market analysis · emotions · mistakes · lessons</p>
            </div>
            <TradeJournalEditor content={trade.journal || ""} onSave={onSave} />
          </div>
        </div>
      </div>
    </div>
  );
}
