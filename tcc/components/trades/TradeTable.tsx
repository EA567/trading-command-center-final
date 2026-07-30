"use client";

import React, { useMemo, useState } from "react";
import { Search, Filter, ArrowUpDown, ChevronDown, Trash2, Pencil, Repeat, Plus } from "lucide-react";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrimaryButton } from "@/components/ui/Button";
import { Account, Trade } from "@/types";
import { formatDate, formatMoney } from "@/lib/utils/format";

function SelectFilter({ icon: Icon, value, onChange, options }: {
  icon: any; value: string; onChange: (v: string) => void; options: { value: string; label: string }[];
}) {
  return (
    <div className="relative">
      <Icon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
      <select value={value} onChange={(e) => onChange(e.target.value)} className="appearance-none bg-zinc-950 border border-zinc-800 rounded-xl pl-8 pr-8 py-2.5 text-sm text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-700 cursor-pointer">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
    </div>
  );
}

export function TradeTable({
  trades, accounts, onAdd, onEdit, onDelete,
}: {
  trades: Trade[];
  accounts: Account[];
  onAdd: () => void;
  onEdit: (t: Trade) => void;
  onDelete: (id: string, label: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [pairFilter, setPairFilter] = useState("all");
  const [sortBy, setSortBy] = useState("date_desc");

  const accountName = (id: string) => accounts.find((a) => a.id === id)?.name || "Unknown";
  const pairs = useMemo(() => Array.from(new Set(trades.map((t) => t.pair))), [trades]);

  const filtered = useMemo(() => {
    let list = [...trades];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((t) => t.pair.toLowerCase().includes(q) || accountName(t.accountId).toLowerCase().includes(q));
    }
    if (accountFilter !== "all") list = list.filter((t) => t.accountId === accountFilter);
    if (pairFilter !== "all") list = list.filter((t) => t.pair === pairFilter);
    switch (sortBy) {
      case "date_desc": list.sort((a, b) => (a.date < b.date ? 1 : -1)); break;
      case "date_asc": list.sort((a, b) => (a.date > b.date ? 1 : -1)); break;
      case "profit_desc": list.sort((a, b) => b.profitLoss - a.profitLoss); break;
      case "profit_asc": list.sort((a, b) => a.profitLoss - b.profitLoss); break;
    }
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trades, search, accountFilter, pairFilter, sortBy, accounts]);

  return (
    <div>
      <Panel className="p-3 sm:p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[180px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search pair or account…" className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700" />
          </div>
          <SelectFilter icon={Filter} value={accountFilter} onChange={setAccountFilter} options={[{ value: "all", label: "All accounts" }, ...accounts.map((a) => ({ value: a.id, label: a.name }))]} />
          <SelectFilter icon={Filter} value={pairFilter} onChange={setPairFilter} options={[{ value: "all", label: "All pairs" }, ...pairs.map((p) => ({ value: p, label: p }))]} />
          <SelectFilter icon={ArrowUpDown} value={sortBy} onChange={setSortBy} options={[
            { value: "date_desc", label: "Newest first" },
            { value: "date_asc", label: "Oldest first" },
            { value: "profit_desc", label: "Highest profit" },
            { value: "profit_asc", label: "Lowest profit" },
          ]} />
        </div>
      </Panel>

      {filtered.length === 0 ? (
        <Panel>
          <EmptyState
            icon={Repeat}
            title={trades.length === 0 ? "No trades logged yet" : "No trades match your filters"}
            subtitle={trades.length === 0 ? "Log your first trade to start building your journal." : "Try adjusting your search or filters."}
            action={trades.length === 0 ? <PrimaryButton icon={Plus} onClick={onAdd}>Log Trade</PrimaryButton> : undefined}
          />
        </Panel>
      ) : (
        <>
          <Panel className="hidden md:block overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-500 text-xs uppercase tracking-wide">
                  <th className="px-4 py-3 font-medium">Pair</th>
                  <th className="px-4 py-3 font-medium">Dir</th>
                  <th className="px-4 py-3 font-medium">Account</th>
                  <th className="px-4 py-3 font-medium">Session</th>
                  <th className="px-4 py-3 font-medium">RR</th>
                  <th className="px-4 py-3 font-medium">Lots</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium text-right">P/L</th>
                  <th className="px-4 py-3 font-medium w-16"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((t) => (
                  <tr key={t.id} className="border-b border-zinc-800/60 last:border-0 hover:bg-zinc-800/30 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-zinc-100">{t.pair}</td>
                    <td className="px-4 py-3"><Badge tone={t.direction === "BUY" ? "green" : "red"}>{t.direction}</Badge></td>
                    <td className="px-4 py-3 text-zinc-400">{accountName(t.accountId)}</td>
                    <td className="px-4 py-3 text-zinc-500">{t.session}</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{t.rr.toFixed(1)}R</td>
                    <td className="px-4 py-3 font-mono text-zinc-400">{t.lotSize.toFixed(2)}</td>
                    <td className="px-4 py-3 text-zinc-500">{formatDate(t.date)}</td>
                    <td className={`px-4 py-3 text-right font-mono font-semibold tabular-nums ${t.profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatMoney(t.profitLoss, "USD", true)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => onEdit(t)} className="text-zinc-600 hover:text-blue-400 transition-colors"><Pencil size={14} /></button>
                        <button onClick={() => onDelete(t.id, `${t.direction} ${t.pair}`)} className="text-zinc-600 hover:text-rose-400 transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>

          <div className="md:hidden space-y-3">
            {filtered.map((t) => (
              <Panel key={t.id} className={`p-4 border-l-2 ${t.profitLoss >= 0 ? "border-l-emerald-400" : "border-l-rose-400"}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-zinc-100">{t.pair}</span>
                    <Badge tone={t.direction === "BUY" ? "green" : "red"}>{t.direction}</Badge>
                  </div>
                  <span className={`font-mono font-bold ${t.profitLoss >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatMoney(t.profitLoss, "USD", true)}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-zinc-500 mb-2">
                  <span>{accountName(t.accountId)} · {t.lotSize.toFixed(2)} lots</span>
                  <span>{formatDate(t.date)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">{t.session}</span>
                  <div className="flex items-center gap-3">
                    <button onClick={() => onEdit(t)} className="text-zinc-500"><Pencil size={14} /></button>
                    <button onClick={() => onDelete(t.id, `${t.direction} ${t.pair}`)} className="text-zinc-500"><Trash2 size={14} /></button>
                  </div>
                </div>
              </Panel>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
