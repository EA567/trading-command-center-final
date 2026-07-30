"use client";

import React, { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/ui/Panel";
import { PageLoading } from "@/components/ui/PageLoading";
import { CalendarGrid, DaySummary } from "@/components/calendar/CalendarGrid";
import { DayDrawer } from "@/components/calendar/DayDrawer";
import { TradeJournalModal } from "@/components/calendar/TradeJournalModal";
import { tradesByDayMap } from "@/lib/utils/stats";
import { Trade } from "@/types";

export default function CalendarPage() {
  const { loading, accounts, visibleTrades, updateTrade } = useAppStore();
  const { pushToast } = useToast();
  const now = new Date();
  const [cursor, setCursor] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);

  const byDay = useMemo(() => tradesByDayMap(visibleTrades), [visibleTrades]);
  const dayTotals = useMemo(() => {
    const totals: Record<string, DaySummary> = {};
    Object.entries(byDay).forEach(([date, trades]) => {
      totals[date] = {
        total: trades.reduce((s, t) => s + t.profitLoss, 0),
        count: trades.length,
      };
    });
    return totals;
  }, [byDay]);

  // Look the selected trade up live from visibleTrades (not a stale copy),
  // so the journal modal always reflects the latest saved content.
  const selectedTrade: Trade | undefined = selectedTradeId
    ? visibleTrades.find((t) => t.id === selectedTradeId)
    : undefined;

  if (loading) return <PageLoading variant="cards" />;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Trading Journal Calendar</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Green days are profitable, red days are losing, gray days had no trades. Tap a day to review every trade, then open one to write a full journal entry.
        </p>
      </div>

      <Panel className="p-5">
        <CalendarGrid
          year={cursor.year}
          month={cursor.month}
          dayTotals={dayTotals}
          onSelectDay={setSelectedDay}
          onPrevMonth={() => setCursor((c) => (c.month === 0 ? { year: c.year - 1, month: 11 } : { year: c.year, month: c.month - 1 }))}
          onNextMonth={() => setCursor((c) => (c.month === 11 ? { year: c.year + 1, month: 0 } : { year: c.year, month: c.month + 1 }))}
        />
      </Panel>

      {selectedDay && byDay[selectedDay] && !selectedTrade && (
        <DayDrawer
          dateIso={selectedDay}
          trades={byDay[selectedDay]}
          accounts={accounts}
          onClose={() => setSelectedDay(null)}
          onSelectTrade={(t) => setSelectedTradeId(t.id)}
        />
      )}

      {selectedTrade && (
        <TradeJournalModal
          trade={selectedTrade}
          accounts={accounts}
          onBack={() => setSelectedTradeId(null)}
          onClose={() => { setSelectedTradeId(null); setSelectedDay(null); }}
          onSave={(html) => {
            updateTrade(selectedTrade.id, { journal: html });
            pushToast("Journal entry saved");
          }}
        />
      )}
    </div>
  );
}
