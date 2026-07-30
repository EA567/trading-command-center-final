"use client";

import React, { useMemo, useState } from "react";
import { ListChecks, Plus, Trash2, CheckCircle2, Circle, Repeat, AlertCircle } from "lucide-react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/ui/Panel";
import { Badge } from "@/components/ui/Badge";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { EmptyState, ConfirmDialog } from "@/components/ui/EmptyState";
import { Modal, Field, inputCls } from "@/components/ui/Modal";
import { PageLoading } from "@/components/ui/PageLoading";
import { Task, TaskCategory } from "@/types";
import { todayISO } from "@/lib/utils/format";

const CATEGORIES: TaskCategory[] = ["Trading", "Personal", "Study", "Health", "Business"];
const CATEGORY_TONE: Record<TaskCategory, "blue" | "green" | "amber" | "red" | "neutral"> = {
  Trading: "blue", Personal: "neutral", Study: "amber", Health: "green", Business: "red",
};

function TaskModal({ onClose, onSubmit }: { onClose: () => void; onSubmit: (t: Omit<Task, "id" | "createdAt">) => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("Trading");
  const [recurring, setRecurring] = useState(false);
  const [frequency, setFrequency] = useState<"daily" | "weekly" | "monthly">("daily");
  const [dueDate, setDueDate] = useState(todayISO());
  const [error, setError] = useState("");

  const submit = () => {
    if (!title.trim()) return setError("Give the task a title.");
    onSubmit({ title: title.trim(), category, recurring, frequency: recurring ? frequency : undefined, dueDate, done: false });
  };

  return (
    <Modal title="New Task" onClose={onClose}>
      <Field label="Title">
        <input className={inputCls} placeholder="e.g. Review yesterday's trades" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Category">
          <select className={inputCls} value={category} onChange={(e) => setCategory(e.target.value as TaskCategory)}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Field>
        <Field label="Due Date">
          <input type="date" className={inputCls} value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
      </div>
      <Field label="Recurring">
        <div className="flex items-center gap-3">
          <button onClick={() => setRecurring((v) => !v)} className={`px-3 py-2 rounded-xl text-sm font-semibold ${recurring ? "bg-blue-500 text-zinc-950" : "bg-zinc-900 text-zinc-500 border border-zinc-800"}`}>
            {recurring ? "Recurring" : "One-time"}
          </button>
          {recurring && (
            <select className={inputCls} value={frequency} onChange={(e) => setFrequency(e.target.value as "daily" | "weekly" | "monthly")}>
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          )}
        </div>
      </Field>
      {error && <p className="text-xs text-rose-400 mb-3 flex items-center gap-1.5"><AlertCircle size={13} />{error}</p>}
      <div className="flex gap-3 mt-2">
        <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
        <PrimaryButton className="flex-1" onClick={submit}>Add Task</PrimaryButton>
      </div>
    </Modal>
  );
}

export default function TasksPage() {
  const { loading, tasks, addTask, updateTask, deleteTask } = useAppStore();
  const { pushToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<"all" | TaskCategory>("all");
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);

  const filtered = useMemo(() => tasks.filter((t) => categoryFilter === "all" || t.category === categoryFilter), [tasks, categoryFilter]);
  const todayTasks = filtered.filter((t) => t.dueDate === todayISO());
  const otherTasks = filtered.filter((t) => t.dueDate !== todayISO());

  const TaskRow = ({ t }: { t: Task }) => (
    <div className="flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-zinc-800/40 transition-colors group">
      <button onClick={() => updateTask(t.id, { done: !t.done })} className="flex items-center gap-3 flex-1 text-left min-w-0">
        {t.done ? <CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> : <Circle size={18} className="text-zinc-600 shrink-0" />}
        <span className={`text-sm truncate ${t.done ? "text-zinc-500 line-through" : "text-zinc-200"}`}>{t.title}</span>
        {t.recurring && <Repeat size={12} className="text-zinc-500 shrink-0" />}
      </button>
      <div className="flex items-center gap-2 shrink-0">
        <Badge tone={CATEGORY_TONE[t.category]}>{t.category}</Badge>
        <button onClick={() => setConfirmDelete({ id: t.id, label: t.title })} className="opacity-0 group-hover:opacity-100 text-zinc-600 hover:text-rose-400 transition-opacity"><Trash2 size={14} /></button>
      </div>
    </div>
  );

  if (loading) return <PageLoading variant="list" />;

  return (
    <div>
      <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Tasks</h1>
          <p className="text-sm text-zinc-500 mt-1">Trading routines, study, health, and business — all in one checklist</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setModalOpen(true)}>New Task</PrimaryButton>
      </div>

      <div className="flex gap-1.5 mb-4 flex-wrap">
        <button onClick={() => setCategoryFilter("all")} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${categoryFilter === "all" ? "bg-zinc-50 text-zinc-950" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>All</button>
        {CATEGORIES.map((c) => (
          <button key={c} onClick={() => setCategoryFilter(c)} className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${categoryFilter === c ? "bg-zinc-50 text-zinc-950" : "bg-zinc-900 text-zinc-400 border border-zinc-800"}`}>{c}</button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Panel><EmptyState icon={ListChecks} title="No tasks yet" subtitle="Add trading routines, study goals, or personal to-dos to stay on track." /></Panel>
      ) : (
        <div className="space-y-4">
          <Panel className="p-3">
            <p className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Today&apos;s Checklist</p>
            {todayTasks.length === 0 ? <p className="text-sm text-zinc-500 px-3 py-4">Nothing due today.</p> : todayTasks.map((t) => <TaskRow key={t.id} t={t} />)}
          </Panel>
          {otherTasks.length > 0 && (
            <Panel className="p-3">
              <p className="px-3 py-1 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Other Tasks</p>
              {otherTasks.map((t) => <TaskRow key={t.id} t={t} />)}
            </Panel>
          )}
        </div>
      )}

      {modalOpen && (
        <TaskModal onClose={() => setModalOpen(false)} onSubmit={(t) => { addTask(t); pushToast(`Task "${t.title}" added`); setModalOpen(false); }} />
      )}
      {confirmDelete && (
        <ConfirmDialog label={confirmDelete.label} onCancel={() => setConfirmDelete(null)} onConfirm={() => { deleteTask(confirmDelete.id); pushToast("Task deleted"); setConfirmDelete(null); }} />
      )}
    </div>
  );
}
