"use client";

import { useEffect, useRef, useState } from "react";
import { X, Upload, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { ingestDocument } from "../lib/api";
import { cn } from "../lib/utils";

type Props = { open: boolean; onClose: () => void };

const KEY_STORAGE = "hr-rag-admin-key-v1";

export function AdminDialog({ open, onClose }: Props) {
  const [file, setFile] = useState<File | null>(null);
  const [adminKey, setAdminKey] = useState("");
  const [rememberKey, setRememberKey] = useState(true);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    const saved = localStorage.getItem(KEY_STORAGE);
    if (saved) setAdminKey(saved);
    setFile(null);
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !adminKey) return;
    setBusy(true);
    try {
      const res = await ingestDocument(file, adminKey);
      toast.success(`Ingested ${res.file}`, {
        description: `${res.chunks} chunks · ${res.ids_created} vectors created`,
      });
      if (rememberKey) localStorage.setItem(KEY_STORAGE, adminKey);
      else localStorage.removeItem(KEY_STORAGE);
      onClose();
    } catch (err) {
      toast.error("Ingest failed", {
        description: err instanceof Error ? err.message : "Unknown error",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl border border-border-strong bg-surface-elevated p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h3 className="font-serif text-xl font-medium text-foreground">
              Ingest document
            </h3>
            <p className="mt-1 text-sm text-muted">
              Uploads to your knowledge base in Pinecone.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted transition hover:bg-surface hover:text-foreground"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-strong">
              Document
            </label>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl border border-dashed p-4 text-left text-sm transition",
                file
                  ? "border-accent/60 bg-accent-soft"
                  : "border-border-strong text-muted-strong hover:border-muted hover:bg-surface",
              )}
            >
              {file ? (
                <>
                  <FileText className="h-5 w-5 text-accent" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-foreground">{file.name}</p>
                    <p className="text-xs text-muted">
                      {(file.size / 1024).toFixed(1)} KB
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Upload className="h-5 w-5" />
                  <span>Choose a file (.pdf, .docx, .txt, .md)</span>
                </>
              )}
            </button>
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.docx,.txt,.md"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted-strong">
              Admin API key
            </label>
            <input
              type="password"
              value={adminKey}
              onChange={(e) => setAdminKey(e.target.value)}
              placeholder="ADMIN_API_KEY from backend/.env"
              className="w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground outline-none placeholder:text-muted focus:border-muted"
            />
            <label className="mt-2 flex items-center gap-2 text-xs text-muted">
              <input
                type="checkbox"
                checked={rememberKey}
                onChange={(e) => setRememberKey(e.target.checked)}
                className="rounded border-border"
              />
              Remember on this device
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 py-2 text-sm text-muted-strong transition hover:bg-surface hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || !adminKey || busy}
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
            >
              {busy ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Uploading
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Ingest
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
