// Empty string = same-origin (production: FastAPI serves both frontend and /api).
// Set NEXT_PUBLIC_API_URL=http://localhost:8080 for local dev when running frontend separately.
const API_BASE = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(/\/$/, "");

export const API_URL = API_BASE;

export type Citation = {
  source?: string;
  title?: string;
  url?: string;
  snippet?: string;
};

export type ChatResponse = {
  answer: string;
  source_used: string;
  trace: string[];
  citations: Citation[];
  rewritten_query: string;
};

export type IngestResponse = {
  message: string;
  file: string;
  chunks: number;
  ids_created: number;
};

async function readError(res: Response): Promise<string> {
  const text = await res.text();
  try {
    const parsed = JSON.parse(text);
    if (parsed?.detail) {
      return typeof parsed.detail === "string"
        ? parsed.detail
        : JSON.stringify(parsed.detail);
    }
  } catch {
    // fallthrough
  }
  return text || `HTTP ${res.status}`;
}

export async function askQuestion(
  question: string,
  signal?: AbortSignal,
): Promise<ChatResponse> {
  const res = await fetch(`${API_BASE}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
    signal,
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function ingestDocument(
  file: File,
  adminKey: string,
): Promise<IngestResponse> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE}/api/ingest`, {
    method: "POST",
    headers: { "x-admin-key": adminKey },
    body: form,
  });
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}

export async function healthCheck(): Promise<{ status: string; service: string }> {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(await readError(res));
  return res.json();
}
