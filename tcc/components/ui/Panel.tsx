import React from "react";

export function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-zinc-900/60 border border-zinc-800 rounded-2xl backdrop-blur-sm ${className}`}>
      {children}
    </div>
  );
}
