"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { askQuestion } from "@/lib/api";
import { useConversations, newTurnId, type Turn } from "@/lib/store";
import { Sidebar } from "@/components/sidebar";
import { Header } from "@/components/header";
import { EmptyState } from "@/components/empty-state";
import { Composer } from "@/components/composer";
import { Message } from "@/components/message";
import { AdminDialog } from "@/components/admin-dialog";

export default function Home() {
  const {
    hydrated,
    conversations,
    active,
    activeId,
    setActiveId,
    createConversation,
    deleteConversation,
    addTurn,
    updateTurn,
    ensureActive,
  } = useConversations();

  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [active?.turns.length, busy]);

  async function send(question: string) {
    const q = question.trim();
    if (!q || busy) return;

    const convId = ensureActive();
    const turn: Turn = {
      id: newTurnId(),
      question: q,
      loading: true,
      createdAt: Date.now(),
    };
    addTurn(convId, turn);
    setInput("");
    setBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await askQuestion(q, controller.signal);
      updateTurn(convId, turn.id, { response, loading: false });
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "AbortError"
          ? "Stopped by user."
          : err instanceof Error
            ? err.message
            : "Unknown error";
      updateTurn(convId, turn.id, { error: message, loading: false });
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        toast.error("Request failed", { description: message });
      }
    } finally {
      abortRef.current = null;
      setBusy(false);
    }
  }

  function handleStop() {
    abortRef.current?.abort();
  }

  const title = active?.title || "New chat";

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground">
      <Sidebar
        conversations={conversations}
        activeId={activeId}
        onSelect={setActiveId}
        onNew={createConversation}
        onDelete={deleteConversation}
        onOpenAdmin={() => setAdminOpen(true)}
      />

      <div className="flex flex-1 flex-col min-w-0">
        <Header
          title={title}
          onNew={createConversation}
          onOpenAdmin={() => setAdminOpen(true)}
        />

        <div className="flex-1 overflow-y-auto">
          {!hydrated ? (
            <div className="flex h-full items-center justify-center text-sm text-muted">
              Loading…
            </div>
          ) : !active || active.turns.length === 0 ? (
            <EmptyState onPick={(q) => send(q)} />
          ) : (
            <div className="mx-auto max-w-3xl px-4 pb-6">
              {active.turns.map((turn) => (
                <Message key={turn.id} turn={turn} />
              ))}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        <Composer
          value={input}
          onChange={setInput}
          onSubmit={() => send(input)}
          onStop={handleStop}
          isBusy={busy}
        />
      </div>

      <AdminDialog open={adminOpen} onClose={() => setAdminOpen(false)} />
    </div>
  );
}
