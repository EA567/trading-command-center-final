"use client";

import React, { useState } from "react";
import { Target, Plus, Trash2, CheckSquare, Square, AlertCircle, Pencil, Check } from "lucide-react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { EmptyState, ConfirmDialog } from "@/components/ui/EmptyState";
import { Modal, Field, inputCls } from "@/components/ui/Modal";
import { PageLoading } from "@/components/ui/PageLoading";
import { Goal, GoalType } from "@/types";
import { computeEffectiveCurrent } from "@/lib/utils/goals";

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: "daily", label: "Daily Target" },
  { value: "weekly", label: "Weekly Target" },
  { value: "monthly", label: "Monthly Target" },
  { value: "yearly", label: "Yearly Target" },
  { value: "challenge", label: "Funded Challenge Progress" },
  { value: "payout", label: "Payout Progress" },
  { value: "growth", label: "Account Growth" },
];

function GoalModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (g: Omit<Goal, "id">) => void }) {
  const [type, setType] = useState<GoalType>("monthly");
  const [title, setTitle] = useState("");
  const [target, setTarget] = useState("1000");
  const [current, setCurrent] = useState("0");
  const [unit, setUnit] = useState<"$" | "%">("$");
  const [deadline, setDeadline] = useState("");
  const [error, setError] = useState("");

  const submit = () => {
    if (!title.trim()) return setError("Give the goal a title.");
    onSubmit({ type, title: title.trim(), target: +target || 0, current: +current || 0, unit, deadline: deadline || undefined, checklist: [] });
  };

  return (
    <Modal title="New Goal" onClose={onClose}>
      <Field label="Goal Type">
        <select className={inputCls} value={type} onChange={(e) => setType(e.target.value as GoalType)}>
          {GOAL_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </Field>
      <Field label="Title">
        <input className={inputCls} placeholder="e.g. Monthly Profit Target" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Target">
          <input type="number" className={inputCls} value={target} onChange={(e) => setTarget(e.target.value)} />
        </Field>
        <Field label="Current">
          <input type="number" className={inputCls} value={current} onChange={(e) => setCurrent(e.target.value)} />
        </Field>
        <Field label="Unit">
          <select className={inputCls} value={unit} onChange={(e) => setUnit(e.target.value as "$" | "%")}>
            <option value="$">$</option>
            <option value="%">%</option>
          </select>
        </Field>
      </div>
      <Field label="Deadline (optional)">
        <input type="date" className={inputCls} value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </Field>
      {error && <p className="text-xs text-rose-400 mb-3 flex items-center gap-1.5"><AlertCircle size={13} />{error}</p>}
      <div className="flex gap-3 mt-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton className="flex-1" onClick={submit}>Create Goal</PrimaryButton>
      </div>
    </Modal>
  );
}

function ProgressBar({ current, target, unit }: { current: number; target: number; unit: string }) {
  const pct = target !== 0 ? Math.min(100, Math.max(0, (current / target) * 100)) : 0;
  const positive = current >= 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5 text-xs">
        <span className={`font-mono font-semibold ${positive ? "text-zinc-200" : "text-rose-400"}`}>{current}{unit} / {target}{unit}</span>
        <span className="text-zinc-500">{pct.toFixed(0)}%</span>
      </div>
      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${positive ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-rose-500"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function ManualProgressEditor({ goal, onSave }: { goal: Goal; onSave: (value: number) => void }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(String(goal.current));

  if (!editing) {
    return (
      <button onClick={() => { setValue(String(goal.current)); setEditing(true); }} className="text-zinc-600 hover:text-blue-400 shrink-0" title="Update progress">
        <Pencil size={13} />
      </button>
    );
  }
  return (
    <div className="flex items-center gap-1.5 shrink-0">
      <input
        type="number"
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-20 bg-zinc-950 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-700"
      />
      <button onClick={() => { onSave(+value || 0); setEditing(false); }} className="text-emerald-400"><Check size={14} /></button>
    </div>
  );
}

export default function GoalsPage() {
  const { loading, goals, accounts, trades, addGoal, updateGoal, deleteGoal } = useAppStore();
  const { pushToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);

  const accountName = (accId?: string) => accounts.find((a) => a.id === accId)?.name;

  const toggleChecklistItem = (goal: Goal, itemId: string) => {
    updateGoal(goal.id, {
      checklist: goal.checklist.map((c) => (c.id === itemId ? { ...c, done: !c.done } : c)),
    });
  };

  if (loading) return <PageLoading variant="grid" />;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Goals</h1>
          <p className="text-sm text-zinc-500 mt-1">Targets, challenge progress, and payout tracking</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>New Goal</PrimaryButton>
      </div>

      {goals.length === 0 ? (
        <Panel><EmptyState icon={Target} title="No goals set" subtitle="Set daily, weekly, monthly, or challenge targets to stay accountable." action={<PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>Add Goal</PrimaryButton>} /></Panel>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {goals.map((g) => {
            const auto = computeEffectiveCurrent(g, accounts, trades);
            const displayCurrent = auto !== null ? auto : g.current;
            return (
            <Panel key={g.id} className="p-5">
              <div className="flex items-start justify-between mb-3 gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-zinc-100">{g.title}</h3>
                    <Badge tone="blue">{g.type}</Badge>
                    {auto !== null && <Badge tone="green">Live</Badge>}
                  </div>
                  {g.accountId && <p className="text-xs text-zinc-500">{accountName(g.accountId)}</p>}
                  {g.deadline && <p className="text-xs text-zinc-500">Due {new Date(g.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {auto === null && <ManualProgressEditor goal={g} onSave={(v) => updateGoal(g.id, { current: v })} />}
                  <button onClick={() => setConfirmDelete({ id: g.id, label: g.title })} className="text-zinc-600 hover:text-rose-400"><Trash2 size={14} /></button>
                </div>
              </div>
              <ProgressBar current={displayCurrent} target={g.target} unit={g.unit} />
              {g.checklist.length > 0 && (
                <div className="mt-4 space-y-1.5 border-t border-zinc-800 pt-3">
                  {g.checklist.map((item) => (
                    <button key={item.id} onClick={() => toggleChecklistItem(g, item.id)} className="w-full flex items-center gap-2 text-left text-sm">
                      {item.done ? <CheckSquare size={15} className="text-emerald-400 shrink-0" /> : <Square size={15} className="text-zinc-600 shrink-0" />}
                      <span className={item.done ? "text-zinc-500 line-through" : "text-zinc-300"}>{item.text}</span>
                    </button>
                  ))}
                </div>
              )}
            </Panel>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <GoalModal
          onClose={() => setModalOpen(false)}
          onSubmit={(g) => { addGoal(g); pushToast(`Goal "${g.title}" created`); setModalOpen(false); }}
        />
      )}
      {confirmDelete && (
        <ConfirmDialog
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { deleteGoal(confirmDelete.id); pushToast("Goal removed"); setConfirmDelete(null); }}
        />
      )}
    </div>
  );
}
