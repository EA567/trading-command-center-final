"use client";

import React from "react";
import { X } from "lucide-react";

export const inputCls =
  "w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-zinc-700";

export function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wide mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export function Modal({
  title, subtitle, onClose, children, wide = false,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div
        className={`relative w-full ${wide ? "sm:max-w-2xl" : "sm:max-w-md"} bg-zinc-950 border border-zinc-800 sm:rounded-2xl rounded-t-2xl shadow-2xl max-h-[90vh] overflow-y-auto`}
      >
        <div className="flex items-start justify-between px-6 pt-6 pb-2 sticky top-0 bg-zinc-950 z-10">
          <div>
            <h2 className="text-lg font-bold text-zinc-50">{title}</h2>
            {subtitle && <p className="text-xs text-zinc-500 mt-1">{subtitle}</p>}
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 p-1">
            <X size={18} />
          </button>
        </div>
        <div className="px-6 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}
