import React from "react";

type Tone = "neutral" | "green" | "red" | "blue" | "amber";

const TONES: Record<Tone, string> = {
  neutral: "bg-zinc-800 text-zinc-300 ring-zinc-700",
  green: "bg-emerald-400/10 text-emerald-400 ring-emerald-400/20",
  red: "bg-rose-400/10 text-rose-400 ring-rose-400/20",
  blue: "bg-blue-400/10 text-blue-400 ring-blue-400/20",
  amber: "bg-amber-400/10 text-amber-400 ring-amber-400/20",
};

export function Badge({ children, tone = "neutral", className = "" }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 whitespace-nowrap ${TONES[tone]} ${className}`}>
      {children}
    </span>
  );
}

const STATUS_STYLES: Record<string, { label: string; dot: string; text: string; bg: string; ring: string }> = {
  active: { label: "Active", dot: "bg-emerald-400", text: "text-emerald-400", bg: "bg-emerald-400/10", ring: "ring-emerald-400/20" },
  funded: { label: "Funded", dot: "bg-blue-400", text: "text-blue-400", bg: "bg-blue-400/10", ring: "ring-blue-400/20" },
  passed: { label: "Passed", dot: "bg-amber-400", text: "text-amber-400", bg: "bg-amber-400/10", ring: "ring-amber-400/20" },
  failed: { label: "Failed", dot: "bg-rose-400", text: "text-rose-400", bg: "bg-rose-400/10", ring: "ring-rose-400/20" },
  breached: { label: "Breached", dot: "bg-rose-400", text: "text-rose-400", bg: "bg-rose-400/10", ring: "ring-rose-400/20" },
};

export function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.active;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ${s.bg} ${s.text} ${s.ring}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
}
