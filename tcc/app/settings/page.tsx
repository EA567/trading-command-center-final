"use client";

import React, { useRef, useState } from "react";
import { AlertCircle, Download, Upload, RotateCcw } from "lucide-react";
import { useAppStore } from "@/lib/store/AppStoreContext";
import { useToast } from "@/components/ui/Toast";
import { Panel } from "@/components/ui/Panel";
import { SecondaryButton } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/EmptyState";
import { PageLoading } from "@/components/ui/PageLoading";
import { Field, inputCls } from "@/components/ui/Modal";

const CURRENCIES = ["USD", "EUR", "GBP", "JPY", "AUD"];

export default function SettingsPage() {
  const { loading, settings, updateSettings, accounts, trades, exportData, importData, resetData } = useAppStore();
  const { pushToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleExport = () => {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `trading-command-center-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    pushToast("Backup exported");
  };

  const handleImportFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      importData(reader.result as string);
      pushToast("Backup restored");
    };
    reader.readAsText(file);
  };

  if (loading) return <PageLoading variant="list" />;

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-50">Settings</h1>
        <p className="text-sm text-zinc-500 mt-1">Preferences, profile, and data management</p>
      </div>

      <Panel className="p-5">
        <h3 className="font-semibold text-zinc-100 mb-4">Journal Overview</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-zinc-500 text-xs mb-1">Accounts tracked</p>
            <p className="font-mono font-semibold text-zinc-100">{accounts.length}</p>
          </div>
          <div>
            <p className="text-zinc-500 text-xs mb-1">Trades logged</p>
            <p className="font-mono font-semibold text-zinc-100">{trades.length}</p>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <h3 className="font-semibold text-zinc-100 mb-1">Profile</h3>
        <p className="text-xs text-zinc-500 mb-4">Shown across the app — not shared unless you connect Supabase Auth</p>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Name">
            <input className={inputCls} value={settings.profileName} onChange={(e) => updateSettings({ profileName: e.target.value })} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} value={settings.profileEmail} onChange={(e) => updateSettings({ profileEmail: e.target.value })} />
          </Field>
        </div>
      </Panel>

      <Panel className="p-5">
        <h3 className="font-semibold text-zinc-100 mb-1">Preferences</h3>
        <p className="text-xs text-zinc-500 mb-4">Display and risk defaults used across the journal</p>
        <div className="grid sm:grid-cols-2 gap-x-4">
          <Field label="Currency">
            <select className={inputCls} value={settings.currency} onChange={(e) => updateSettings({ currency: e.target.value })}>
              {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Default Risk %">
            <input type="number" step="0.1" className={inputCls} value={settings.riskDefaultPercent} onChange={(e) => updateSettings({ riskDefaultPercent: +e.target.value })} />
          </Field>
        </div>
        <Field label="Timezone">
          <input className={inputCls} value={settings.timezone} onChange={(e) => updateSettings({ timezone: e.target.value })} placeholder="e.g. America/New_York" />
        </Field>
      </Panel>

      <Panel className="p-5">
        <h3 className="font-semibold text-zinc-100 mb-1">Backup</h3>
        <p className="text-xs text-zinc-500 mb-4">Export a full JSON snapshot, or restore one. This is also your migration path to Supabase — import the same JSON shape via the API routes in <code className="text-zinc-400">app/api</code>.</p>
        <div className="flex flex-wrap gap-3">
          <SecondaryButton onClick={handleExport} className="flex-none inline-flex items-center gap-2 px-4"><Download size={14} /> Export Backup</SecondaryButton>
          <SecondaryButton onClick={() => fileInputRef.current?.click()} className="flex-none inline-flex items-center gap-2 px-4"><Upload size={14} /> Import Backup</SecondaryButton>
          <input ref={fileInputRef} type="file" accept="application/json" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImportFile(f); }} />
        </div>
      </Panel>

      <Panel className="p-5 border-rose-900/40">
        <h3 className="font-semibold text-zinc-100 mb-1 flex items-center gap-2"><AlertCircle size={15} className="text-rose-400" /> Danger Zone</h3>
        <p className="text-xs text-zinc-500 mb-4">Reset all local data back to the sample seed. This can&apos;t be undone — export a backup first.</p>
        <button onClick={() => setConfirmReset(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-900/40 text-sm font-semibold hover:bg-rose-500/20 transition-colors">
          <RotateCcw size={14} /> Reset All Data
        </button>
      </Panel>

      {confirmReset && (
        <ConfirmDialog
          label="all local data"
          onCancel={() => setConfirmReset(false)}
          onConfirm={() => { resetData(); pushToast("Data reset to sample seed"); setConfirmReset(false); }}
        />
      )}
    </div>
  );
}
