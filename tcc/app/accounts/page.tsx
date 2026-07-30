"use client";

import React, { useState } from "react";
import { Plus, Wallet } from "lucide-react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/ui/Panel";
import { PrimaryButton } from "@/components/ui/Button";
import { EmptyState, ConfirmDialog } from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/PageLoading";
import { AccountCard } from "@/components/accounts/AccountCard";
import { AccountModal } from "@/components/accounts/AccountModal";
import { Account } from "@/types";

export default function AccountsPage() {
  const { loading, accounts, trades, addAccount, updateAccount, deleteAccount } = useAppStore();
  const { pushToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Account | undefined>(undefined);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);

  if (loading) return <PageLoading variant="grid" />;

  const winRateFor = (accountId: string) => {
    const t = trades.filter((tr) => tr.accountId === accountId && tr.status === "closed");
    if (!t.length) return 0;
    return (t.filter((tr) => tr.profitLoss > 0).length / t.length) * 100;
  };

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Accounts</h1>
          <p className="text-sm text-zinc-500 mt-1">All prop firm and personal trading accounts</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => { setEditing(undefined); setModalOpen(true); }}>New Account</PrimaryButton>
      </div>

      {accounts.length === 0 ? (
        <Panel>
          <EmptyState icon={Wallet} title="No accounts yet" subtitle="Add your first prop firm or personal account to start tracking performance." action={<PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>Add Account</PrimaryButton>} />
        </Panel>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {accounts.map((a) => (
            <AccountCard
              key={a.id}
              account={a}
              tradeCount={trades.filter((t) => t.accountId === a.id).length}
              winRate={winRateFor(a.id)}
              onEdit={() => { setEditing(a); setModalOpen(true); }}
              onDelete={() => setConfirmDelete({ id: a.id, label: a.name })}
            />
          ))}
        </div>
      )}

      {modalOpen && (
        <AccountModal
          initial={editing}
          onClose={() => setModalOpen(false)}
          onSubmit={(a) => {
            if (editing) {
              updateAccount(editing.id, a);
              pushToast(`Account "${a.name}" updated`);
            } else {
              addAccount(a);
              pushToast(`Account "${a.name}" created`);
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
            deleteAccount(confirmDelete.id);
            pushToast("Account removed");
            setConfirmDelete(null);
          }}
        />
      )}
    </div>
  );
}
