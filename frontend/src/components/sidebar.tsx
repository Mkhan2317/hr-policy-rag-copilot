"use client";

import { Plus, MessageSquare, Trash2, Upload, ExternalLink } from "lucide-react";
import { cn, formatRelativeTime } from "@/lib/utils";
import type { Conversation } from "@/lib/store";

type Props = {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onOpenAdmin: () => void;
};

export function Sidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  onOpenAdmin,
}: Props) {
  return (
    <aside className="hidden md:flex md:w-64 lg:w-72 flex-col bg-surface">
      <div className="flex items-center gap-2.5 px-4 pt-5 pb-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent text-white">
          <span className="font-serif text-sm font-semibold leading-none">H</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-serif text-[15px] font-medium text-foreground leading-tight">
            HR Copilot
          </p>
        </div>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onNew}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-strong transition hover:bg-surface-2 hover:text-foreground"
        >
          <Plus className="h-4 w-4" />
          New chat
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-2">
        {conversations.length > 0 && (
          <p className="px-3 pb-1.5 pt-2 text-[11px] font-medium uppercase tracking-wider text-muted">
            Recents
          </p>
        )}
        {conversations.length === 0 ? (
          <p className="px-3 py-6 text-center text-xs text-muted">
            No conversations yet
          </p>
        ) : (
          <ul className="space-y-0.5">
            {conversations.map((c) => (
              <li key={c.id}>
                <div
                  className={cn(
                    "group flex items-center gap-2 rounded-lg px-2.5 py-2 text-sm transition",
                    activeId === c.id
                      ? "bg-surface-2 text-foreground"
                      : "text-muted-strong hover:bg-surface-2/70 hover:text-foreground",
                  )}
                >
                  <MessageSquare className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <button
                    type="button"
                    onClick={() => onSelect(c.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <span className="block truncate">{c.title}</span>
                    <span className="block truncate text-[11px] text-muted">
                      {formatRelativeTime(c.updatedAt)}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDelete(c.id)}
                    className="rounded p-1 text-muted opacity-0 transition hover:bg-danger/10 hover:text-danger group-hover:opacity-100"
                    aria-label="Delete conversation"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="p-2 space-y-0.5">
        <button
          type="button"
          onClick={onOpenAdmin}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-strong transition hover:bg-surface-2 hover:text-foreground"
        >
          <Upload className="h-4 w-4" />
          Ingest document
        </button>
        <a
          href="https://github.com/Mkhan2317/hr-policy-rag-copilot"
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-strong transition hover:bg-surface-2 hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4" />
          View on GitHub
        </a>
      </div>
    </aside>
  );
}
