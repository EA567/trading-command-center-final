import React from "react";
import { Loader2 } from "lucide-react";
import { Skeleton } from "./EmptyState";

export function PageLoading({ variant = "cards" }: { variant?: "cards" | "table" | "grid" | "list" }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-zinc-500 text-sm mb-2">
        <Loader2 size={15} className="animate-spin" /> Loading…
      </div>
      {variant === "cards" && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
        </div>
      )}
      {variant === "grid" && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40" />)}
        </div>
      )}
      {variant === "table" && (
        <div className="space-y-3">
          <Skeleton className="h-12" />
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14" />)}
        </div>
      )}
      {variant === "list" && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-20" />)}
        </div>
      )}
    </div>
  );
}
