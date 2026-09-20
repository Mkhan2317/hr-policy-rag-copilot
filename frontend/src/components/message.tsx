"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Copy,
  Check,
  AlertTriangle,
  Database,
  Globe,
  MessageCircle,
  Shield,
  ExternalLink,
} from "lucide-react";
import type { Turn } from "@/lib/store";
import { cn } from "@/lib/utils";
import { TracePanel } from "@/components/trace-panel";

function SourceBadge({ source }: { source: string }) {
  const s = source.toLowerCase();
  let cls = "text-muted-strong";
  let Icon = MessageCircle;
  let label = source;
  if (s.includes("kb") || s.includes("pinecone")) {
    cls = "text-success";
    Icon = Database;
    label = "Knowledge Base";
  } else if (s.includes("web") || s.includes("tavily")) {
    cls = "text-info";
    Icon = Globe;
    label = "Web Search";
  } else if (s.includes("direct")) {
    cls = "text-accent";
    Icon = MessageCircle;
    label = "Direct";
  } else if (s.includes("fallback") || s.includes("insufficient")) {
    cls = "text-warning";
    Icon = Shield;
    label = "Fallback";
  }
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-[11px] font-medium", cls)}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="inline-flex items-center gap-1 rounded-md px-1.5 py-1 text-[11px] text-muted transition hover:bg-surface hover:text-foreground"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-success" />
          Copied
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          Copy
        </>
      )}
    </button>
  );
}

export function Message({ turn }: { turn: Turn }) {
  return (
    <div className="animate-in space-y-6 py-6">
      {/* User message — right-aligned bubble */}
      <div className="flex justify-end">
        <div className="max-w-[85%] rounded-2xl rounded-tr-md bg-surface px-4 py-2.5">
          <p className="whitespace-pre-wrap text-[15px] text-foreground">
            {turn.question}
          </p>
        </div>
      </div>

      {/* Assistant message — flowing left-aligned, no bubble */}
      <div className="space-y-3 pl-1">
        {turn.loading && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <span className="dot-pulse text-accent">
              <span />
              <span />
              <span />
            </span>
            <span>Routing → retrieving → grading → generating</span>
          </div>
        )}

        {turn.error && (
          <div className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/5 p-3 text-sm text-danger">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="font-medium">Request failed</p>
              <p className="mt-0.5 font-mono text-xs opacity-90 break-words">
                {turn.error}
              </p>
            </div>
          </div>
        )}

        {turn.response && (
          <>
            <div className="prose-answer">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {turn.response.answer}
              </ReactMarkdown>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <SourceBadge source={turn.response.source_used} />
              {turn.response.rewritten_query &&
                turn.response.rewritten_query.trim() !== turn.question.trim() && (
                  <span className="text-[11px] text-muted">
                    Rewritten:{" "}
                    <em className="text-muted-strong not-italic">
                      &ldquo;{turn.response.rewritten_query}&rdquo;
                    </em>
                  </span>
                )}
              <div className="ml-auto">
                <CopyButton text={turn.response.answer} />
              </div>
            </div>

            {turn.response.citations && turn.response.citations.length > 0 && (
              <div className="rounded-xl border border-border bg-surface-elevated p-4">
                <p className="mb-2.5 text-[11px] font-medium uppercase tracking-wider text-muted">
                  Sources
                </p>
                <ol className="space-y-2">
                  {turn.response.citations.map((c, i) => (
                    <li key={i} className="flex gap-2 text-sm">
                      <span className="mt-0.5 text-[11px] font-medium text-muted">
                        {i + 1}.
                      </span>
                      <div className="flex-1 min-w-0">
                        {c.url ? (
                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-accent hover:underline"
                          >
                            {c.title || c.source || c.url}
                            <ExternalLink className="h-3 w-3 opacity-60" />
                          </a>
                        ) : (
                          <span className="text-foreground">
                            {c.title || c.source}
                          </span>
                        )}
                        {c.snippet && (
                          <p className="mt-0.5 text-xs text-muted">{c.snippet}</p>
                        )}
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <TracePanel trace={turn.response.trace} />
          </>
        )}
      </div>
    </div>
  );
}
