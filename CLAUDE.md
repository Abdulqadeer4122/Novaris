# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Backend
```bash
# Activate virtual environment
source backend/venc/bin/activate

# Install dependencies
pip install -r backend/requirements.txt

# Run backend (port 8001)
cd backend && uvicorn main:app --reload --port 8001

# Database migrations (run from backend/)
cd backend
alembic revision --autogenerate -m "description"
alembic upgrade head
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

## Architecture

### Overview
A personal AI assistant with a **FastAPI backend** (port 8001) and **Next.js 14 frontend** (port 3000). The system uses **LangGraph** with a supervisor agent pattern and GPT-4o to orchestrate email, calendar, and finance operations. The key feature is **Human-in-the-Loop (HITL)** interrupts: before sending emails or creating calendar events, the agent pauses and asks for user approval in the UI.

### Backend (`backend/`)

**Startup sequence (lifespan in `main.py`):**
1. `db.init_db()` — creates SQLAlchemy tables via `Base.metadata.create_all`, then initialises the LangGraph `PostgresSaver` checkpointer with `psycopg_pool.ConnectionPool`
2. `build_supervisor(checkpointer)` — constructs the LangGraph supervisor agent
3. `PgHitlStore()` — PostgreSQL-backed HITL store

**Request flow:**
1. `POST /chat` → `main.py` → sets `current_user_id` ContextVar → `agents/supervisor.py` (LangGraph supervisor) → specialized agents/tools → SSE stream back to client
2. If a tool requires approval, supervisor emits an `interrupt` SSE event; frontend shows an ActionCard
3. `POST /chat/resume` resumes the LangGraph thread with user decision (approve/edit/reject)

**Key constraints:**
- The supervisor agent has `parallel_tool_calls=False` to prevent message history corruption in LangGraph
- `langchain==1.2.13` is pinned — provides `create_agent()`. Do not upgrade.
- LangGraph `PostgresSaver` requires `autocommit=True, prepare_threshold=0` on the connection pool (needed for `CREATE INDEX CONCURRENTLY`)

**Database access — two patterns, never mix them:**
- `get_db()` — plain generator for `Depends(get_db)` in FastAPI route signatures
- `db_session()` — `@contextmanager` for direct use: `with db_session() as db:`

**ORM models (`models.py`):**
- `User` — email/password auth, `google_connected` flag
- `GoogleCredential` — per-user Google OAuth credentials as JSON (one row per user, FK → users.id)
- `HitlPending` — pending HITL interrupt IDs mapped to thread IDs
- `OAuthState` — PKCE code_verifier storage between `/connect` and `/callback`
- `ChatSession` — conversation history index (thread_id, title, timestamps)
- `Expense`, `Budget`, `Bill` — finance tracking

**Google OAuth (`auth/google_router.py` + `auth/google_auth.py`):**
- `/auth/google/connect?token=<jwt>` — accepts JWT as query param (browser redirect, can't send headers); redirects to Google consent screen
- `/auth/google/callback` — exchanges code for credentials, stores in `google_credentials` table with `expiry` field
- `autogenerate_code_verifier=False` must be passed to `Flow.from_client_config()` to disable PKCE (the default is `True`, which causes "Missing code verifier" when the callback rebuilds the flow without the original verifier)
- After OAuth, `user.google_connected = True` is set in the DB

**Google credentials in tools:**
- Tools call `get_credentials()` from `auth/google_auth.py`
- `get_credentials()` reads `current_user_id` from the `ContextVar` (set by chat endpoints in `main.py`) and calls `get_credentials_for_user(user_id)`
- `get_credentials_for_user()` auto-refreshes expired tokens using `google.auth.transport.requests.Request()` and saves the refreshed token + new expiry back to DB
- Legacy rows without `expiry` field are force-refreshed on first use

**User identity in tools (`context.py`):**
- `current_user_id: ContextVar[int]` is set in both `/chat` and `/chat/resume` event generators before invoking the agent
- Tools never receive `user_id` as a parameter — they read it via `get_credentials()` which consults the ContextVar

**Agents:**
- `agents/supervisor.py` — `build_supervisor(checkpointer)` factory; tools: `read_emails`, `check_calendar`, `send_email`, `create_calendar_event`, `manage_finance`
- `agents/email_agent.py` — stateless agent using `list_emails` tool
- `agents/calendar_agent.py` — stateless agent using `get_available_time_slots` tool
- `agents/finance_agent.py` — stateless GPT-4o agent for finance queries (no checkpointer/HITL)

**Finance tools (`tools/finance_tools.py`):** `add_expense`, `get_expenses`, `check_budget`, `set_budget`, `get_upcoming_bills`, `add_bill`, `get_monthly_summary` — all use `db_session()` directly.

**Auth (`auth/`):**
- `auth/utils.py` — JWT via `python-jose`, password hashing via `bcrypt` directly (no passlib — incompatible with bcrypt 4.x)
- `auth/router.py` — `POST /auth/register`, `POST /auth/login`, `GET /auth/me`
- `require_google_connected` dependency used on `/chat` and `/chat/resume`; `/sessions` uses `get_current_user` only

**HITL store (`hitl/store.py`):** `PgHitlStore` — SQLAlchemy upsert/delete on `hitl_pending` table. `set(interrupt_id, thread_id)` / `pop(interrupt_id) → thread_id`.

### Frontend (`frontend/`)

**Component hierarchy:**
```
app/chat/page.tsx
  └── <AuthGuard> — redirects unauthenticated → /login, no Google → /onboarding
  └── useChat() hook (hooks/useChat.ts) — all state & SSE logic
  ├── SessionSidebar.tsx — past sessions list + "New Session" button
  ├── ChatWindow.tsx — messages + ActionCards
  │   └── ActionCard.tsx — approve/edit/reject UI with JSON editing
  └── InputBar.tsx — text input
```

**Auth pages:** `app/(auth)/login/page.tsx`, `app/(auth)/register/page.tsx`
**Onboarding:** `app/onboarding/page.tsx` — Google connect page; redirects browser to `/auth/google/connect?token=<jwt>`

**Auth helpers (`lib/auth.ts`):** `saveToken`, `getToken`, `clearToken`, `authHeaders()` — JWT stored in `localStorage` under key `pa_token`.

**SSE handling:** `lib/api.ts` exports `streamPost()` used by `useChat` for both `/chat` and `/chat/resume`. The hook detects `interrupt` events and stores them as `pendingActions`; detects broken thread state errors and issues a new `thread_id` automatically.

**Session loading guard:** `refreshSessions()` in `useChat` checks `getToken()` before fetching — prevents 401 on mount before auth is confirmed.

### Environment Variables
- `backend/.env` — `OPENAI_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REDIRECT_URI`, `POSTGRES_URL`, `JWT_SECRET`, `FRONTEND_URL`
- `frontend/.env.local` — `NEXT_PUBLIC_API_URL=http://localhost:8001`
