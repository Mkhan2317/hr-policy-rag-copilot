"use client";

import { useState } from "react";
import { ChevronDown, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

function stepColor(step: string): string {
  const s = step.toLowerCase();
  if (s.includes("weak") || s.includes("fallback") || s.includes("insufficient"))
    return "text-warning";
  if (s.includes("good") || s.includes("generation")) return "text-success";
  if (s.includes("web") || s.includes("tavily")) return "text-info";
  if (s.includes("retrieval") || s.includes("kb")) return "text-accent";
  return "text-muted-strong";
}

export function TracePanel({ trace }: { trace: string[] }) {
  const [open, setOpen] = useState(false);
  if (!trace || trace.length === 0) return null;

  return (
    <div className="rounded-xl border border-border bg-surface-elevated">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-xs font-medium text-muted-strong transition hover:text-foreground"
      >
        <GitBranch className="h-3.5 w-3.5" />
        Agent trace · {trace.length} step{trace.length === 1 ? "" : "s"}
        <ChevronDown
          className={cn("ml-auto h-3.5 w-3.5 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ol className="border-t border-border px-4 py-3 space-y-2">
          {trace.map((step, i) => (
            <li key={i} className="flex items-start gap-2.5 text-xs">
              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-surface text-[10px] font-medium text-muted">
                {i + 1}
              </span>
              <span className={cn("font-mono", stepColor(step))}>{step}</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
