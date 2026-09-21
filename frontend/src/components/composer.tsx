"use client";

import { ArrowUp, Square } from "lucide-react";
import { useEffect, useRef } from "react";
import { cn } from "../lib/utils";

type Props = {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  onStop?: () => void;
  disabled?: boolean;
  isBusy?: boolean;
};

export function Composer({ value, onChange, onSubmit, onStop, disabled, isBusy }: Props) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 240)}px`;
  }, [value]);

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!disabled && value.trim()) onSubmit();
    }
  }

  const canSubmit = !disabled && !isBusy && value.trim().length > 0;

  return (
    <div className="px-4 pb-6 pt-2">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (canSubmit) onSubmit();
        }}
        className="mx-auto flex max-w-3xl flex-col rounded-3xl border border-border-strong bg-surface-elevated p-3 shadow-sm transition focus-within:border-muted focus-within:shadow-md"
      >
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Reply to HR Copilot…"
          rows={1}
          disabled={disabled}
          className="min-h-[24px] w-full resize-none bg-transparent px-3 py-1.5 text-[15px] text-foreground outline-none placeholder:text-muted disabled:opacity-50"
        />
        <div className="mt-2 flex items-center justify-between px-1">
          <span className="text-[11px] text-muted">
            <kbd className="rounded border border-border bg-surface px-1 py-0.5 text-[10px] font-sans">
              ⏎
            </kbd>{" "}
            to send{" "}
            <span className="mx-1">·</span>
            <kbd className="rounded border border-border bg-surface px-1 py-0.5 text-[10px] font-sans">
              ⇧⏎
            </kbd>{" "}
            for newline
          </span>
          {isBusy && onStop ? (
            <button
              type="button"
              onClick={onStop}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground text-background transition hover:opacity-90"
              aria-label="Stop generation"
            >
              <Square className="h-3 w-3 fill-current" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={!canSubmit}
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-full transition",
                canSubmit
                  ? "bg-accent text-white hover:bg-accent-hover"
                  : "bg-surface-2 text-muted",
              )}
              aria-label="Send"
            >
              <ArrowUp className="h-4 w-4" />
            </button>
          )}
        </div>
      </form>
      <p className="mx-auto mt-3 max-w-3xl text-center text-[11px] text-muted">
        HR Copilot can make mistakes — validate against official policy.
      </p>
    </div>
  );
}
