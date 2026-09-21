"use client";

import { Menu, Upload, Plus } from "lucide-react";
import { StatusIndicator } from "./status-indicator";

type Props = {
  title: string;
  onNew: () => void;
  onOpenAdmin: () => void;
  onOpenSidebar?: () => void;
};

export function Header({ title, onNew, onOpenAdmin, onOpenSidebar }: Props) {
  return (
    <header className="flex items-center gap-3 px-4 py-3">
      {onOpenSidebar && (
        <button
          type="button"
          onClick={onOpenSidebar}
          className="md:hidden rounded-md p-1.5 text-muted-strong hover:bg-surface hover:text-foreground"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      <h1 className="flex-1 truncate text-sm text-muted-strong">{title}</h1>
      <StatusIndicator />
      <button
        type="button"
        onClick={onOpenAdmin}
        className="hidden md:inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs text-muted-strong transition hover:bg-surface hover:text-foreground"
      >
        <Upload className="h-3.5 w-3.5" />
        Ingest
      </button>
      <button
        type="button"
        onClick={onNew}
        className="md:hidden rounded-md p-1.5 text-muted-strong hover:bg-surface hover:text-foreground"
        aria-label="New chat"
      >
        <Plus className="h-5 w-5" />
      </button>
    </header>
  );
}
