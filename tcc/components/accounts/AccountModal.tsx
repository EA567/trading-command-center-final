"use client";

import React, { useState } from "react";
import { AlertCircle } from "lucide-react";
import { Modal, Field, inputCls } from "@/components/ui/Modal";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { Account, AccountStatus, AccountType } from "@/types";

const BROKERS = ["FTMO", "MyForexFunds", "The5ers", "Maven Trading", "Personal (IC Markets)", "Personal (Other)"];
const ACCOUNT_TYPES: AccountType[] = ["Challenge", "Verification", "Funded", "Personal"];
const STATUSES: AccountStatus[] = ["active", "funded", "passed", "failed", "breached"];

export function AccountModal({
  initial, onClose, onSubmit,
}: { initial?: Account; onClose: () => void; onSubmit: (a: Omit<Account, "id" | "createdAt">) => void }) {
  const [name, setName] = useState(initial?.name || "");
  const [broker, setBroker] = useState(initial?.broker || BROKERS[0]);
  const [type, setType] = useState<AccountType>(initial?.type || ACCOUNT_TYPES[0]);
  const [startingBalance, setStartingBalance] = useState(initial ? String(initial.startingBalance) : "10000");
  const [currentBalance, setCurrentBalance] = useState(initial ? String(initial.currentBalance) : "10000");
  const [equity, setEquity] = useState(initial ? String(initial.equity) : "10000");
  const [status, setStatus] = useState<AccountStatus>(initial?.status || "active");
  const [error, setError] = useState("");

  const submit = () => {
    if (!name.trim()) return setError("Give the account a name.");
    if (!startingBalance || +startingBalance <= 0) return setError("Enter a valid starting balance.");
    onSubmit({
      name: name.trim(), broker, type, status,
      startingBalance: +startingBalance,
      currentBalance: initial ? +currentBalance : +startingBalance,
      equity: initial ? +equity : +startingBalance,
    });
  };

  return (
    <Modal title={initial ? "Edit Account" : "New Account"} subtitle="Connect a prop firm or personal account" onClose={onClose}>
      <Field label="Account Name">
        <input className={inputCls} placeholder="e.g. FTMO 100K" value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Broker / Firm">
        <select className={inputCls} value={broker} onChange={(e) => setBroker(e.target.value)}>
          {BROKERS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Account Type">
          <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as AccountType)}>
            {ACCOUNT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as AccountStatus)}>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Starting Balance ($)">
        <input type="number" step="1" min="1" className={inputCls} value={startingBalance} onChange={(e) => setStartingBalance(e.target.value)} />
      </Field>
      {initial && (
        <div className="grid grid-cols-2 gap-3">
          <Field label="Current Balance ($)">
            <input type="number" step="0.01" className={inputCls} value={currentBalance} onChange={(e) => setCurrentBalance(e.target.value)} />
          </Field>
          <Field label="Equity ($)">
            <input type="number" step="0.01" className={inputCls} value={equity} onChange={(e) => setEquity(e.target.value)} />
          </Field>
        </div>
      )}
      {error && <p className="text-xs text-rose-400 mb-3 flex items-center gap-1.5"><AlertCircle size={13} />{error}</p>}
      <div className="flex gap-3 mt-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton className="flex-1" onClick={submit}>{initial ? "Save Changes" : "Create Account"}</PrimaryButton>
      </div>
    </Modal>
  );
}
