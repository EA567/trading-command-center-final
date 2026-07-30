"use client";

import React from "react";
import { LucideIcon } from "lucide-react";

export function PrimaryButton({
  children, onClick, className = "", icon: Icon, type = "button",
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  icon?: LucideIcon;
  type?: "button" | "submit";
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-50 text-zinc-950 text-sm font-semibold hover:bg-white active:scale-[0.98] transition-all duration-150 shadow-lg shadow-black/20 ${className}`}
    >
      {Icon && <Icon size={16} />}
      {children}
    </button>
  );
}

export function SecondaryButton({
  children, onClick, className = "",
}: { children: React.ReactNode; onClick?: () => void; className?: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 py-2.5 px-4 rounded-xl border border-zinc-800 text-zinc-400 text-sm font-semibold hover:bg-zinc-900 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}

export function IconButton({
  icon: Icon, onClick, className = "", title,
}: { icon: LucideIcon; onClick?: () => void; className?: string; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className={`p-2 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 transition-colors duration-150 text-zinc-400 hover:text-zinc-100 ${className}`}
    >
      <Icon size={16} />
    </button>
  );
}
