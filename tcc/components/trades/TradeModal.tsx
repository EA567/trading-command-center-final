"use client";

import React, { useState } from "react";
import { AlertCircle, Wallet } from "lucide-react";
import { Modal, Field, inputCls } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { Account, Trade, TradeSession } from "@/types";
import { todayISO } from "@/lib/utils/format";

const PAIRS = ["EURUSD", "GBPUSD", "XAUUSD", "US30", "NAS100", "USDJPY", "AUDUSD", "GBPJPY", "USOIL", "BTCUSD"];
const SESSIONS: TradeSession[] = ["Asian", "London", "New York", "London/NY Overlap"];

function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function TradeModal({
  accounts, defaultAccountId, initial, onClose, onSubmit,
}: {
  accounts: Account[];
  defaultAccountId?: string;
  initial?: Trade;
  onClose: () => void;
  onSubmit: (t: Omit<Trade, "id" | "createdAt">) => void;
}) {
  const [accountId, setAccountId] = useState(initial?.accountId || defaultAccountId || accounts[0]?.id || "");
  const [pair, setPair] = useState(initial?.pair || PAIRS[0]);
  const [direction, setDirection] = useState<Trade["direction"]>(initial?.direction || "BUY");
  const [session, setSession] = useState<TradeSession>(initial?.session || "London");
  const [date, setDate] = useState(initial?.date || todayISO());
  const [time, setTime] = useState(initial?.time || new Date().toTimeString().slice(0, 5));
  const [lotSize, setLotSize] = useState(initial ? String(initial.lotSize) : "0.10");
  const [riskAmount, setRiskAmount] = useState(initial ? String(initial.riskAmount) : "");
  const [rr, setRr] = useState(initial ? String(initial.rr) : "");
  const [profitLoss, setProfitLoss] = useState(initial ? String(initial.profitLoss) : "");
  const [status, setStatus] = useState<Trade["status"]>(initial?.status || "closed");
  const [notes, setNotes] = useState(initial?.notes || "");
  const [psychologyNotes, setPsychologyNotes] = useState(initial?.psychologyNotes || "");
  const [mistakes, setMistakes] = useState((initial?.mistakes || []).join(", "));
  const [lessons, setLessons] = useState(initial?.lessons || "");
  const [screenshotBefore, setScreenshotBefore] = useState(initial?.screenshotBefore);
  const [screenshotAfter, setScreenshotAfter] = useState(initial?.screenshotAfter);
  const [error, setError] = useState("");

  const account = accounts.find((a) => a.id === accountId);

  const submit = () => {
    if (!accountId) return setError("Select an account.");
    if (!lotSize || +lotSize <= 0) return setError("Enter a valid lot size.");
    if (profitLoss === "" || isNaN(+profitLoss)) return setError("Enter a profit/loss amount.");
    const riskPercent = account && riskAmount ? (+riskAmount / account.startingBalance) * 100 : 0;
    const profitLossPercent = account ? (+profitLoss / account.startingBalance) * 100 : 0;
    onSubmit({
      accountId, date, time, pair, direction, session,
      lotSize: +lotSize, riskAmount: +riskAmount || 0, riskPercent, rr: +rr || 0,
      profitLoss: +profitLoss, profitLossPercent, status,
      screenshotBefore, screenshotAfter, notes, psychologyNotes,
      mistakes: mistakes.split(",").map((m) => m.trim()).filter(Boolean),
      lessons,
    });
  };

  if (accounts.length === 0) {
    return (
      <Modal title="Log Trade" onClose={onClose}>
        <EmptyState icon={Wallet} title="No accounts yet" subtitle="Create an account first before logging a trade." />
      </Modal>
    );
  }

  return (
    <Modal title={initial ? "Edit Trade" : "Log Trade"} subtitle="Record a new entry in your professional journal" onClose={onClose} wide>
      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Account">
          <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
            {accounts.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
        </Field>
        <Field label="Pair">
          <select className={inputCls} value={pair} onChange={(e) => setPair(e.target.value)}>
            {PAIRS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Field>
      </div>

      <Field label="Direction">
        <div className="grid grid-cols-2 gap-3">
          <button onClick={() => setDirection("BUY")} className={`py-2.5 rounded-xl font-semibold text-sm transition-all ${direction === "BUY" ? "bg-emerald-500 text-zinc-950" : "bg-zinc-900 text-zinc-500 border border-zinc-800"}`}>BUY</button>
          <button onClick={() => setDirection("SELL")} className={`py-2.5 rounded-xl font-semibold text-sm transition-all ${direction === "SELL" ? "bg-rose-500 text-zinc-950" : "bg-zinc-900 text-zinc-500 border border-zinc-800"}`}>SELL</button>
        </div>
      </Field>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Session">
          <select className={inputCls} value={session} onChange={(e) => setSession(e.target.value as TradeSession)}>
            {SESSIONS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label="Status">
          <select className={inputCls} value={status} onChange={(e) => setStatus(e.target.value as Trade["status"])}>
            <option value="closed">Closed</option>
            <option value="open">Open</option>
          </select>
        </Field>
      </div>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Date">
          <input type="date" max={todayISO()} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>
        <Field label="Time">
          <input type="time" className={inputCls} value={time} onChange={(e) => setTime(e.target.value)} />
        </Field>
      </div>

      <div className="grid sm:grid-cols-3 gap-x-4">
        <Field label="Lot Size">
          <input type="number" step="0.01" min="0.01" className={inputCls} value={lotSize} onChange={(e) => setLotSize(e.target.value)} />
        </Field>
        <Field label="Risk ($)">
          <input type="number" step="0.01" className={inputCls} value={riskAmount} onChange={(e) => setRiskAmount(e.target.value)} />
        </Field>
        <Field label="Risk:Reward">
          <input type="number" step="0.1" placeholder="e.g. 2.5" className={inputCls} value={rr} onChange={(e) => setRr(e.target.value)} />
        </Field>
      </div>

      <Field label="Profit / Loss ($)">
        <input type="number" step="0.01" placeholder="-45.00" className={inputCls} value={profitLoss} onChange={(e) => setProfitLoss(e.target.value)} />
      </Field>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Screenshot — Before">
          <input type="file" accept="image/*" className="text-xs text-zinc-400" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setScreenshotBefore(await fileToDataUrl(f));
          }} />
          {screenshotBefore && <img src={screenshotBefore} alt="before" className="mt-2 rounded-lg border border-zinc-800 max-h-32" />}
        </Field>
        <Field label="Screenshot — After">
          <input type="file" accept="image/*" className="text-xs text-zinc-400" onChange={async (e) => {
            const f = e.target.files?.[0];
            if (f) setScreenshotAfter(await fileToDataUrl(f));
          }} />
          {screenshotAfter && <img src={screenshotAfter} alt="after" className="mt-2 rounded-lg border border-zinc-800 max-h-32" />}
        </Field>
      </div>

      <Field label="Notes">
        <textarea rows={2} placeholder="What did you see? What was the setup?" className={inputCls} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      <Field label="Psychology Notes">
        <textarea rows={2} placeholder="How did you feel during the trade?" className={inputCls} value={psychologyNotes} onChange={(e) => setPsychologyNotes(e.target.value)} />
      </Field>
      <div className="grid sm:grid-cols-2 gap-x-4">
        <Field label="Mistakes (comma separated)">
          <input className={inputCls} placeholder="Entered early, oversized" value={mistakes} onChange={(e) => setMistakes(e.target.value)} />
        </Field>
        <Field label="Lessons">
          <input className={inputCls} placeholder="What would you do differently?" value={lessons} onChange={(e) => setLessons(e.target.value)} />
        </Field>
      </div>

      {error && <p className="text-xs text-rose-400 mb-3 flex items-center gap-1.5"><AlertCircle size={13} />{error}</p>}
      <div className="flex gap-3 mt-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton className="flex-1" onClick={submit}>{initial ? "Save Changes" : "Save Trade"}</PrimaryButton>
      </div>
    </Modal>
  );
}
