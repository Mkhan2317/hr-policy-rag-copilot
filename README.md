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
│   │   ├── core/tracing.py    # LangSmith bootstrap
│   │   └── main.py            # FastAPI app + CORS + static file serving
│   ├── data/sample_kb/        # Sample HR policies
│   ├── requirements.txt
│   ├── .env                   # secrets (gitignored)
│   └── .env.example
├── frontend/                  # Next.js 16 + React 19 + Tailwind 4
│   ├── src/app/page.tsx       # Anthropic-style chat UI
│   ├── src/components/        # Sidebar, Composer, Message, etc.
│   └── next.config.ts         # output: 'export' → static HTML/JS/CSS
├── Dockerfile                 # Unified: builds Next.js → serves via FastAPI
├── docker-compose.yml         # Single service (web)
├── .do/app.yaml               # DigitalOcean App Platform spec (1 service = $5/mo)
└── README.md
```

**Deployment model:** the frontend is built as a static site (`next build && next export`) and served by FastAPI at `/`. API routes live at `/api/*`. Same-origin — no CORS in production, one container to deploy.

## Local development

### Option A — Two-process dev (recommended for frontend work)

Backend with hot reload:
```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements.txt
cp .env.example .env       # then edit .env with real API keys
python run.py              # http://localhost:8080
```

Frontend with hot reload:
```powershell
cd frontend
npm install
echo NEXT_PUBLIC_API_URL=http://localhost:8080 > .env.local
npm run dev                # http://localhost:3000
```

### Option B — Unified container (matches production)

```powershell
docker compose up --build
# Open http://localhost:8080
```

Everything served from one origin. This is exactly what runs in DigitalOcean.

### Seed the knowledge base

```powershell
cd backend
.venv\Scripts\Activate.ps1
python ingest_sample_kb.py
```

Loads `backend/data/sample_kb/*.md` into Pinecone.

## Deploy to DigitalOcean App Platform

The `.do/app.yaml` defines a **single** service (~$5/month with basic-xxs) that serves the frontend and API from one container.

### One-time setup
1. Install `doctl`: `winget install DigitalOcean.Doctl` (or `brew install doctl`)
2. Authenticate: `doctl auth init` (paste API token from https://cloud.digitalocean.com/account/api/tokens)
3. Push this repo to GitHub

### Deploy
```powershell
doctl apps create --spec .do/app.yaml
```

DO prompts for each `type: SECRET` env var. Paste your production keys.

### Or via UI
1. https://cloud.digitalocean.com/apps → Create App
2. Choose GitHub → select `Mkhan2317/hr-policy-rag-copilot` → branch `main`
3. Set **Source directory** to `/` (root — the unified Dockerfile is here)
4. Instance: `Basic - apps-s-1vcpu-0.5gb` (**$5/mo**), 1 container
5. Add env vars (4 SECRETS + ~8 plain — see [.do/app.yaml](.do/app.yaml))
6. Create — build takes ~5–8 min

**Public URL:** `https://hr-policy-rag-copilot-xxxxx.ondigitalocean.app`

## API

| Method | Path            | Purpose                             |
|--------|-----------------|-------------------------------------|
| GET    | `/api/health`   | Liveness check                      |
| GET    | `/api/meta`     | Service info + LangSmith status     |
| POST   | `/api/chat`     | `{question}` → agentic response     |
| POST   | `/api/ingest`   | Upload doc (requires `x-admin-key`) |
| GET    | `/docs`         | Swagger UI                          |

Everything else (`/`, `/anything`) → serves the Next.js frontend.

## Tech stack

- **Backend:** FastAPI, LangGraph, LangChain, OpenAI, Pinecone, Tavily, SQLite (audit log)
- **Frontend:** Next.js 16 (App Router, static export), React 19, TypeScript, Tailwind CSS 4
- **Tracing:** LangSmith (env-toggled)
- **Deploy:** Docker (unified image), DigitalOcean App Platform (~$5/mo)
