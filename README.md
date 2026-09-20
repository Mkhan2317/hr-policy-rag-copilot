# HR Policy RAG Copilot

Agentic RAG assistant for enterprise HR policy questions. Routes intelligently between a private knowledge base (Pinecone), live web search (Tavily), and fallback answers — orchestrated by LangGraph.

## Architecture

```
User → Router (LLM) ─┬─→ Retrieve KB (Pinecone) → Grade → good → Generate (KB)
                     │                              ↓ weak
                     │                          Web Search (Tavily) → Grade → good → Generate (Web)
                     │                                                   ↓ weak
                     │                                               Fallback (LLM)
                     └─→ Direct answer (general conversation)
```

## Project structure

```
hr-policy-rag-copilot/
├── backend/                   # FastAPI + LangGraph agent
│   ├── app/
│   │   ├── api/routes.py      # /api/chat, /api/ingest, /api/health
│   │   ├── rag/workflow.py    # LangGraph agentic flow
│   │   ├── services/          # ingestion, audit log
│   │   └── main.py            # FastAPI app + CORS
│   ├── data/                  # sample KB + audit.db
│   ├── uploads/               # ingested docs
│   ├── requirements.txt
│   ├── Dockerfile
│   ├── run.py                 # uvicorn entrypoint (dev)
│   ├── .env                   # secrets (gitignored)
│   └── .env.example
├── frontend/                  # Next.js 16 + React 19 + Tailwind 4
│   ├── src/app/page.tsx       # Chat UI with source badge + trace
│   ├── src/lib/api.ts         # FastAPI client
│   ├── Dockerfile             # standalone multi-stage build
│   ├── .env.local             # NEXT_PUBLIC_API_URL (gitignored)
│   └── .env.local.example
├── .do/app.yaml               # DigitalOcean App Platform spec
├── docker-compose.yml         # Local dev: both services
└── README.md
```

## Local development

### 1. Backend (FastAPI)

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env       # then edit .env with real API keys
python run.py              # runs on http://localhost:8080
```

**Required keys in `backend/.env`:**
- `OPENAI_API_KEY` — https://platform.openai.com/api-keys
- `TAVILY_API_KEY` — https://tavily.com/
- `PINECONE_API_KEY` — https://app.pinecone.io/
- `ADMIN_API_KEY` — any random string (gates `/api/ingest`)

Verify: `curl http://localhost:8080/api/health`

### 2. Frontend (Next.js)

```powershell
cd frontend
npm install
cp .env.local.example .env.local
npm run dev                # runs on http://localhost:3000
```

Open http://localhost:3000 and ask a question.

### 3. Seed the knowledge base

```powershell
cd backend
.venv\Scripts\Activate.ps1
python ingest_sample_kb.py
```

## Docker (local, both services)

```powershell
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend:  http://localhost:8080

## Deploy to DigitalOcean App Platform

1. Push this repo to GitHub (already at `Mkhan2317/hr-policy-rag-copilot`)
2. In the DO dashboard: **Apps → Create App → From GitHub → select repo → main branch**
3. DO detects `.do/app.yaml` and creates two services (backend + frontend)
4. Set the **SECRET** env vars in the dashboard:
   - `OPENAI_API_KEY`, `TAVILY_API_KEY`, `PINECONE_API_KEY`, `ADMIN_API_KEY`
5. Click **Create Resources**

The spec uses `${backend.PUBLIC_URL}` so the frontend auto-discovers the backend URL — no manual wiring needed. CORS is set from the frontend's public URL automatically.

**Cost:** ~$12/mo (2 × basic-xxs instances). Bump to `basic-xs` if you hit memory limits during Pinecone/LangChain init.

## API

| Method | Path            | Purpose                             |
|--------|-----------------|-------------------------------------|
| GET    | `/api/health`   | Liveness check                      |
| POST   | `/api/chat`     | `{question}` → agent response       |
| POST   | `/api/ingest`   | Upload doc (requires `x-admin-key`) |

Full OpenAPI docs at http://localhost:8080/docs.

## Tech stack

- **Backend:** FastAPI, LangGraph, LangChain, OpenAI, Pinecone, Tavily, SQLite (audit log)
- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4
- **Deploy:** Docker, DigitalOcean App Platform
