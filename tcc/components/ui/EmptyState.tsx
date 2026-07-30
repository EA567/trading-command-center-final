"use client";

import React from "react";
import { AlertCircle, LucideIcon } from "lucide-react";
import { SecondaryButton } from "./Button";

export function EmptyState({
  icon: Icon, title, subtitle, action,
}: { icon: LucideIcon; title: string; subtitle: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-6">
      <div className="w-14 h-14 rounded-2xl bg-zinc-800/60 border border-zinc-700 flex items-center justify-center mb-4">
        <Icon size={22} className="text-zinc-500" />
      </div>
      <p className="text-zinc-200 font-semibold mb-1">{title}</p>
      <p className="text-zinc-500 text-sm max-w-xs mb-5">{subtitle}</p>
      {action}
    </div>
  );
}

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-zinc-800/70 rounded-lg ${className}`} />;
}

export function ConfirmDialog({
  label, onCancel, onConfirm,
}: { label: string; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6">
        <div className="w-11 h-11 rounded-xl bg-rose-400/10 flex items-center justify-center mb-4">
          <AlertCircle size={20} className="text-rose-400" />
        </div>
        <h3 className="font-bold text-zinc-50 mb-1.5">Delete {label}?</h3>
        <p className="text-sm text-zinc-500 mb-6">This action can&apos;t be undone. Stats will update immediately.</p>
        <div className="flex gap-3">
          <SecondaryButton onClick={onCancel}>Cancel</SecondaryButton>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl bg-rose-500 text-zinc-950 text-sm font-semibold hover:bg-rose-400 transition-colors">
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
