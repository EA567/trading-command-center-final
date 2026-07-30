import React from "react";
import { LucideIcon } from "lucide-react";
import { Panel } from "./Panel";

type Tone = "neutral" | "green" | "red" | "blue";

const TONE_TEXT: Record<Tone, string> = {
  neutral: "text-zinc-100",
  green: "text-emerald-400",
  red: "text-rose-400",
  blue: "text-blue-400",
};

export function StatCard({
  label, value, sub, icon: Icon, tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  icon: LucideIcon;
  tone?: Tone;
}) {
  return (
    <Panel className="p-5 hover:border-zinc-700 transition-colors duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-zinc-500 tracking-wide uppercase">{label}</span>
        <Icon size={16} className="text-zinc-600" />
      </div>
      <p className={`text-xl font-mono font-bold tabular-nums ${TONE_TEXT[tone]}`}>{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-1.5">{sub}</p>}
    </Panel>
  );
}
