"use client";

import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { id } from "@/lib/utils/id";

interface ToastItem {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastCtxValue {
  pushToast: (message: string, type?: "success" | "error") => void;
}

const ToastCtx = createContext<ToastCtxValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const pushToast = useCallback((message: string, type: "success" | "error" = "success") => {
    setToasts((t) => [...t, { id: id(), message, type }]);
  }, []);

  const dismiss = (toastId: string) => setToasts((t) => t.filter((x) => x.id !== toastId));

  return (
    <ToastCtx.Provider value={{ pushToast }}>
      {children}
      <div className="fixed top-4 right-4 z-[60] flex flex-col gap-2 items-end">
        {toasts.map((t) => (
          <ToastRow key={t.id} toast={t} onDone={() => dismiss(t.id)} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastRow({ toast, onDone }: { toast: ToastItem; onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3200);
    return () => clearTimeout(t);
  }, [onDone]);
  const isError = toast.type === "error";
  const Icon = isError ? XCircle : CheckCircle2;
  return (
    <div className="flex items-center gap-3 bg-zinc-900 border border-zinc-800 shadow-2xl shadow-black/40 rounded-xl px-4 py-3 min-w-[260px] animate-[slideIn_0.25s_ease-out]">
      <Icon size={18} className={isError ? "text-rose-400" : "text-emerald-400"} />
      <span className="text-sm text-zinc-200 font-medium">{toast.message}</span>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
