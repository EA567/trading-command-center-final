"use client";

import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { useToast } from "@/components/ui/Toast";
import { PrimaryButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/PageLoading";
import { TradeTable } from "@/components/trades/TradeTable";
import { TradeModal } from "@/components/trades/TradeModal";
import { Trade } from "@/types";

export default function TradesContent() {
  const {
    loading,
    accounts,
    visibleTrades,
    addTrade,
    updateTrade,
    deleteTrade,
  } = useAppStore();

  const { pushToast } = useToast();
  const searchParams = useSearchParams();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Trade | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<{
    id: string;
    label: string;
  } | null>(null);

  useEffect(() => {
    if (searchParams.get("add") === "1") {
      setModalOpen(true);
    }
  }, [searchParams]);

  if (loading) return <PageLoading variant="table" />;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Trades
          </h1>
          <p className="text-sm text-zinc-500 mt-1">
            Your professional trade journal
          </p>
        </div>

        <PrimaryButton
          icon={Plus}
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
        >
          Log Trade
        </PrimaryButton>
      </div>

      <TradeTable
        trades={visibleTrades}
        accounts={accounts}
        onAdd={() => {
          setEditing(undefined);
          setModalOpen(true);
        }}
        onEdit={(t) => {
          setEditing(t);
          setModalOpen(true);
        }}
        onDelete={(id, label) => {
          setConfirmDelete({ id, label });
        }}
      />

      {modalOpen && (
        <TradeModal
          accounts={accounts}
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSubmit={(t) => {
            if (editing) {
              updateTrade(editing.id, t);
              pushToast(`${t.direction} ${t.pair} updated`);
            } else {
              addTrade(t);
              pushToast(`${t.direction} ${t.pair} logged`);
            }

            setModalOpen(false);
          }}
        />
      )}

      {confirmDelete && (
        <ConfirmDialog
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => {
            deleteTrade(confirmDelete.id);
            pushToast("Trade deleted");
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}