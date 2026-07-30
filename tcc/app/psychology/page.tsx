"use client";

import React, { useMemo, useState } from "react";
import { Brain, Plus, Trash2, Smile, Meh } from "lucide-react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/ui/Panel";
import { StatCard } from "@/components/ui/StatCard";
import { PrimaryButton, SecondaryButton } from "@/components/ui/Button";
import { EmptyState, ConfirmDialog } from "@/components/ui/EmptyState";
import { Field, inputCls } from "@/components/ui/Modal";
import { PageLoading } from "@/components/ui/PageLoading";
import { formatDate, formatMoney, todayISO } from "@/lib/utils/format";

const EMOTIONS = ["Calm", "Confident", "Excited", "Anxious", "Frustrated", "Bored", "Fearful", "Satisfied"];

export default function PsychologyPage() {
  const { loading, psychologyLogs, visibleTrades, addPsychologyLog, deletePsychologyLog } = useAppStore();
  const { pushToast } = useToast();
  const [formOpen, setFormOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ id: string; label: string } | null>(null);

  const [date, setDate] = useState(todayISO());
  const [emotionBefore, setEmotionBefore] = useState(EMOTIONS[0]);
  const [emotionAfter, setEmotionAfter] = useState(EMOTIONS[0]);
  const [confidence, setConfidence] = useState(7);
  const [discipline, setDiscipline] = useState(7);
  const [mistakes, setMistakes] = useState("");
  const [rulesBroken, setRulesBroken] = useState("");
  const [lessons, setLessons] = useState("");
  const [journal, setJournal] = useState("");

  const avg = useMemo(() => {
    if (!psychologyLogs.length) return { confidence: 0, discipline: 0 };
    return {
      confidence: psychologyLogs.reduce((s, p) => s + p.confidence, 0) / psychologyLogs.length,
      discipline: psychologyLogs.reduce((s, p) => s + p.discipline, 0) / psychologyLogs.length,
    };
  }, [psychologyLogs]);

  // Live correlation between logged mental state and same-day trading P/L.
  // Recomputes automatically whenever a trade is added, edited, or deleted.
  const correlation = useMemo(() => {
    const withPL = psychologyLogs
      .map((p) => {
        const dayPL = visibleTrades.filter((t) => t.date === p.date && t.status === "closed").reduce((s, t) => s + t.profitLoss, 0);
        return { ...p, dayPL, hasTrades: visibleTrades.some((t) => t.date === p.date) };
      })
      .filter((p) => p.hasTrades);

    const highConfidence = withPL.filter((p) => p.confidence >= 7);
    const lowConfidence = withPL.filter((p) => p.confidence < 7);
    const highDiscipline = withPL.filter((p) => p.discipline >= 7);
    const lowDiscipline = withPL.filter((p) => p.discipline < 7);
    const avgOf = (arr: typeof withPL) => (arr.length ? arr.reduce((s, p) => s + p.dayPL, 0) / arr.length : 0);

    return {
      daysMatched: withPL.length,
      highConfidenceAvg: avgOf(highConfidence),
      lowConfidenceAvg: avgOf(lowConfidence),
      highDisciplineAvg: avgOf(highDiscipline),
      lowDisciplineAvg: avgOf(lowDiscipline),
    };
  }, [psychologyLogs, visibleTrades]);

  const resetForm = () => {
    setDate(todayISO()); setEmotionBefore(EMOTIONS[0]); setEmotionAfter(EMOTIONS[0]);
    setConfidence(7); setDiscipline(7); setMistakes(""); setRulesBroken(""); setLessons(""); setJournal("");
  };

  const submit = () => {
    addPsychologyLog({
      date, emotionBefore, emotionAfter, confidence, discipline,
      mistakes: mistakes.split(",").map((m) => m.trim()).filter(Boolean),
      rulesBroken: rulesBroken.split(",").map((m) => m.trim()).filter(Boolean),
      lessons, journal,
    });
    pushToast("Psychology log saved");
    resetForm();
    setFormOpen(false);
  };

  if (loading) return <PageLoading variant="list" />;

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between mb-2 gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Psychology</h1>
          <p className="text-sm text-zinc-500 mt-1">Track the mental side of trading — the edge that doesn&apos;t show up in P/L</p>
        </div>
        <PrimaryButton icon={Plus} onClick={() => setFormOpen((v) => !v)}>{formOpen ? "Close" : "New Log"}</PrimaryButton>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Avg Confidence" value={`${avg.confidence.toFixed(1)}/10`} icon={Smile} tone="blue" />
        <StatCard label="Avg Discipline" value={`${avg.discipline.toFixed(1)}/10`} icon={Meh} tone="blue" />
      </div>

      {correlation.daysMatched > 0 && (
        <Panel className="p-5">
          <h3 className="font-semibold text-zinc-100 mb-1">Mindset ↔ Performance Correlation</h3>
          <p className="text-xs text-zinc-500 mb-4">
            Auto-computed from {correlation.daysMatched} logged day{correlation.daysMatched !== 1 ? "s" : ""} matched against that day&apos;s trades — updates instantly as you log trades.
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-2">Confidence ≥ 7 vs &lt; 7</p>
              <div className="flex items-center justify-between text-sm">
                <span className={`font-mono font-semibold ${correlation.highConfidenceAvg >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatMoney(correlation.highConfidenceAvg, "USD", true)}</span>
                <span className="text-zinc-600">vs</span>
                <span className={`font-mono font-semibold ${correlation.lowConfidenceAvg >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatMoney(correlation.lowConfidenceAvg, "USD", true)}</span>
              </div>
            </div>
            <div className="p-3 rounded-xl bg-zinc-900/60 border border-zinc-800">
              <p className="text-[11px] text-zinc-500 uppercase tracking-wide mb-2">Discipline ≥ 7 vs &lt; 7</p>
              <div className="flex items-center justify-between text-sm">
                <span className={`font-mono font-semibold ${correlation.highDisciplineAvg >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatMoney(correlation.highDisciplineAvg, "USD", true)}</span>
                <span className="text-zinc-600">vs</span>
                <span className={`font-mono font-semibold ${correlation.lowDisciplineAvg >= 0 ? "text-emerald-400" : "text-rose-400"}`}>{formatMoney(correlation.lowDisciplineAvg, "USD", true)}</span>
              </div>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-3">Average day P/L on days you logged that mindset — a big gap is a signal worth investigating.</p>
        </Panel>
      )}

      {formOpen && (
        <Panel className="p-5">
          <h3 className="font-semibold text-zinc-100 mb-4">New Psychology Log</h3>
          <div className="grid sm:grid-cols-3 gap-x-4">
            <Field label="Date">
              <input type="date" max={todayISO()} className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
            </Field>
            <Field label="Emotion Before">
              <select className={inputCls} value={emotionBefore} onChange={(e) => setEmotionBefore(e.target.value)}>
                {EMOTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
            <Field label="Emotion After">
              <select className={inputCls} value={emotionAfter} onChange={(e) => setEmotionAfter(e.target.value)}>
                {EMOTIONS.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label={`Confidence — ${confidence}/10`}>
              <input type="range" min={1} max={10} value={confidence} onChange={(e) => setConfidence(+e.target.value)} className="w-full accent-emerald-400" />
            </Field>
            <Field label={`Discipline — ${discipline}/10`}>
              <input type="range" min={1} max={10} value={discipline} onChange={(e) => setDiscipline(+e.target.value)} className="w-full accent-blue-400" />
            </Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Mistakes (comma separated)">
              <input className={inputCls} placeholder="Revenge traded, oversized" value={mistakes} onChange={(e) => setMistakes(e.target.value)} />
            </Field>
            <Field label="Rules Broken (comma separated)">
              <input className={inputCls} placeholder="Max 2 trades per session" value={rulesBroken} onChange={(e) => setRulesBroken(e.target.value)} />
            </Field>
          </div>
          <Field label="Lessons Learned">
            <input className={inputCls} placeholder="What will you do differently?" value={lessons} onChange={(e) => setLessons(e.target.value)} />
          </Field>
          <Field label="Daily Journal">
            <textarea rows={3} className={inputCls} placeholder="Free-write about today's session..." value={journal} onChange={(e) => setJournal(e.target.value)} />
          </Field>
          <div className="flex gap-3 mt-2">
            <SecondaryButton onClick={() => setFormOpen(false)}>Cancel</SecondaryButton>
            <PrimaryButton className="flex-1" onClick={submit}>Save Log</PrimaryButton>
          </div>
        </Panel>
      )}

      {psychologyLogs.length === 0 ? (
        <Panel><EmptyState icon={Brain} title="No psychology logs yet" subtitle="Log how you felt before and after trading to spot patterns over time." /></Panel>
      ) : (
        <div className="space-y-3">
          {psychologyLogs.map((p) => (
            <Panel key={p.id} className="p-5">
              <div className="flex items-start justify-between mb-3 gap-4 flex-wrap">
                <div>
                  <p className="text-sm font-semibold text-zinc-200">{formatDate(p.date)}</p>
                  <p className="text-xs text-zinc-500 mt-0.5">{p.emotionBefore} → {p.emotionAfter}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase">Confidence</p>
                    <p className="text-sm font-mono font-bold text-blue-400">{p.confidence}/10</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-zinc-500 uppercase">Discipline</p>
                    <p className="text-sm font-mono font-bold text-blue-400">{p.discipline}/10</p>
                  </div>
                  <button onClick={() => setConfirmDelete({ id: p.id, label: "psychology log" })} className="text-zinc-600 hover:text-rose-400"><Trash2 size={14} /></button>
                </div>
              </div>
              {p.journal && <p className="text-sm text-zinc-400 mb-2">{p.journal}</p>}
              <div className="flex flex-wrap gap-2">
                {p.mistakes.map((m, i) => <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-rose-400/10 text-rose-400 ring-1 ring-rose-400/20">{m}</span>)}
                {p.rulesBroken.map((r, i) => <span key={i} className="text-[11px] px-2 py-0.5 rounded-md bg-amber-400/10 text-amber-400 ring-1 ring-amber-400/20">Rule: {r}</span>)}
              </div>
              {p.lessons && <p className="text-xs text-zinc-500 mt-2 italic">Lesson: {p.lessons}</p>}
            </Panel>
          ))}
        </div>
      )}

      {confirmDelete && (
        <ConfirmDialog
          label={confirmDelete.label}
          onCancel={() => setConfirmDelete(null)}
          onConfirm={() => { deletePsychologyLog(confirmDelete.id); pushToast("Log deleted"); setConfirmDelete(null); }}
        />
      )}
    </div>
  );
}
