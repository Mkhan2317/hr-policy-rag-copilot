"use client";

import { useCallback, useEffect, useState } from "react";
import type { ChatResponse } from "./api";

export type Turn = {
  id: string;
  question: string;
  response?: ChatResponse;
  error?: string;
  loading?: boolean;
  createdAt: number;
};

export type Conversation = {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  turns: Turn[];
};

const STORAGE_KEY = "hr-rag-conversations-v1";
const ACTIVE_KEY = "hr-rag-active-conversation-v1";

function loadAll(): Conversation[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Conversation[];
  } catch {
    return [];
  }
}

function saveAll(conversations: Conversation[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
}

function newId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function deriveTitle(question: string): string {
  const clean = question.trim().replace(/\s+/g, " ");
  return clean.length > 60 ? `${clean.slice(0, 57)}…` : clean;
}

export function useConversations() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveIdState] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const all = loadAll();
    setConversations(all);
    const savedActive = localStorage.getItem(ACTIVE_KEY);
    if (savedActive && all.some((c) => c.id === savedActive)) {
      setActiveIdState(savedActive);
    } else if (all.length > 0) {
      setActiveIdState(all[0].id);
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) saveAll(conversations);
  }, [conversations, hydrated]);

  useEffect(() => {
    if (!hydrated) return;
    if (activeId) localStorage.setItem(ACTIVE_KEY, activeId);
    else localStorage.removeItem(ACTIVE_KEY);
  }, [activeId, hydrated]);

  const setActiveId = useCallback((id: string | null) => setActiveIdState(id), []);

  const active = conversations.find((c) => c.id === activeId) || null;

  const createConversation = useCallback(() => {
    const conv: Conversation = {
      id: newId(),
      title: "New chat",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      turns: [],
    };
    setConversations((prev) => [conv, ...prev]);
    setActiveIdState(conv.id);
    return conv.id;
  }, []);

  const deleteConversation = useCallback(
    (id: string) => {
      setConversations((prev) => {
        const next = prev.filter((c) => c.id !== id);
        if (activeId === id) {
          setActiveIdState(next[0]?.id ?? null);
        }
        return next;
      });
    },
    [activeId],
  );

  const clearAll = useCallback(() => {
    setConversations([]);
    setActiveIdState(null);
  }, []);

  const addTurn = useCallback(
    (conversationId: string, turn: Turn) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          const title = c.turns.length === 0 ? deriveTitle(turn.question) : c.title;
          return {
            ...c,
            title,
            updatedAt: Date.now(),
            turns: [...c.turns, turn],
          };
        }),
      );
    },
    [],
  );

  const updateTurn = useCallback(
    (conversationId: string, turnId: string, patch: Partial<Turn>) => {
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c;
          return {
            ...c,
            updatedAt: Date.now(),
            turns: c.turns.map((t) => (t.id === turnId ? { ...t, ...patch } : t)),
          };
        }),
      );
    },
    [],
  );

  const ensureActive = useCallback((): string => {
    if (activeId) return activeId;
    return createConversation();
  }, [activeId, createConversation]);

  return {
    hydrated,
    conversations,
    active,
    activeId,
    setActiveId,
    createConversation,
    deleteConversation,
    clearAll,
    addTurn,
    updateTurn,
    ensureActive,
  };
}

export function newTurnId() {
  return newId();
}
