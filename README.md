# Novaris — AI Personal Assistant

<p align="center">
  <img src="docs/thumbnail.jpg" alt="Novaris Banner" width="100%"/>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/LangChain-Multi--Agent-C9A84C?style=flat-square&logo=chainlink&logoColor=white"/>
  <img src="https://img.shields.io/badge/GPT--4o-OpenAI-0A0E27?style=flat-square&logo=openai&logoColor=white"/>
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=flat-square&logo=fastapi&logoColor=white"/>
  <img src="https://img.shields.io/badge/Next.js_14-Frontend-black?style=flat-square&logo=next.js&logoColor=white"/>
  <img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=flat-square&logo=postgresql&logoColor=white"/>
  <img src="https://img.shields.io/badge/LangGraph-HITL-C9A84C?style=flat-square"/>
</p>

<p align="center">
  <strong>Manage your Gmail · Google Calendar · Personal Finances — all from one chat interface.</strong>
</p>

---

## The Problem

Most people lose 2–3 hours every day switching between their inbox, calendar, and budgeting apps. Checking emails. Rescheduling meetings. Logging expenses. None of it requires deep thinking — but it consumes your most productive time.

Novaris solves this by putting a multi-agent AI system in front of all three, coordinated by a single supervisor that understands your intent and routes tasks to the right specialist — with your approval before anything irreversible happens.

---

## Demo

>  the product working.

- Email agent surfaces today's important emails
- Calendar agent schedules a meeting from plain English
- Email agent drafts a reply, shows the HITL approval card, then sends

*https://www.loom.com/share/d03288004ad14d1c8a355a11f4c173da*

---

## Architecture

```
┌─────────────────────────────────────────────────┐
│               Next.js 14 Frontend                │
│         Dashboard · Chat · Inbox · Finance        │
└───────────────────────┬─────────────────────────┘
                        │  JWT · SSE streaming
┌───────────────────────▼─────────────────────────┐
│            FastAPI Backend (Python)              │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │          Supervisor Agent (GPT-4o)        │   │
│  │     Orchestrates · Routes · Synthesises   │   │
│  └──────┬──────────────────────┬────────────┘   │
│         │                      │                 │
│  ┌──────▼──────┐      ┌────────▼──────┐          │
│  │ Email Agent │      │Calendar Agent │          │
│  │  Gmail API  │      │ Google Cal API│          │
│  └──────┬──────┘      └────────┬──────┘          │
│         │                      │                 │
│  ┌──────▼──────────────────────▼──────────┐      │
│  │         Human-in-the-Loop (HITL)        │      │
│  │   Approve · Edit · Reject before send   │      │
│  └─────────────────────────────────────────┘     │
│                                                   │
│  ┌──────────────────────────────────────────┐    │
│  │           Finance Agent                   │    │
│  │  Budget · Expenses · Bill Reminders       │    │
│  │  PostgreSQL · SQLAlchemy                  │    │
│  └──────────────────────────────────────────┘    │
└──────────────────────────────────────────────────┘
```

Each agent only sees the tools in its own domain. The supervisor never calls a raw API directly — clean separation of concerns, easy to extend with new agents.

---

## Features

### Email Agent
- Surfaces today's important emails from Gmail
- Drafts replies from natural language instructions
- **Sends only after explicit human approval** (HITL)
- Daily email digest cached in PostgreSQL

### Calendar Agent
- Parses natural language into ISO datetime events ("next Tuesday at 2pm")
- Checks availability before scheduling
- Creates, modifies, and lists Google Calendar events
- **Creates events only after explicit human approval** (HITL)

### Finance Agent
- Tracks expenses by category (food, transport, utilities, health, shopping)
- Monitors monthly budgets and alerts at 80% threshold
- Tracks upcoming bills by due day
- Generates monthly spending summaries
- Fully local — no external bank API required (Plaid-ready stub)

### Dashboard
- At-a-glance stats: spending, bills due, today's events, unread emails
- Budget health bars per category
- Today's schedule from Google Calendar
- Recent emails and upcoming bills
- All data cached per user in PostgreSQL, refreshed daily

### Authentication & Onboarding
- JWT-based auth (register → login → protected routes)
- Google OAuth2 onboarding flow (Gmail + Calendar scopes)
- User must connect Google before accessing the assistant
- Per-user data isolation throughout

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| AI Agents | LangChain `create_agent()` · GPT-4o |
| Agent Orchestration | LangChain Supervisor Pattern |
| HITL Interrupts | LangGraph `HumanInTheLoopMiddleware` · `PostgresSaver` checkpointer |
| Backend | FastAPI · Python 3.11 |
| Streaming | Server-Sent Events (SSE) via `sse-starlette` |
| Database | PostgreSQL · SQLAlchemy · Alembic |
| Auth | JWT (`python-jose`) · bcrypt (`passlib`) |
| Google APIs | `google-auth-oauthlib` · `google-api-python-client` |
| Frontend | Next.js 14 (App Router) · TypeScript · Tailwind CSS |
| State | React hooks · SWR |

---

## Project Structure

```
novaris/
├── backend/
│   ├── main.py                  # FastAPI app, routers, startup
│   ├── config.py                # Pydantic settings
│   ├── database.py              # Engine, SessionLocal, Base
│   ├── db/
│   │   └── models.py            # All SQLAlchemy models
│   ├── agents/
│   │   ├── supervisor.py        # Supervisor agent + tool wrappers
│   │   ├── email_agent.py       # Email specialist agent
│   │   ├── calendar_agent.py    # Calendar specialist agent
│   │   └── finance_agent.py     # Finance specialist agent
│   ├── tools/
│   │   ├── gmail_tools.py       # @tool functions for Gmail
│   │   ├── gcal_tools.py        # @tool functions for Google Calendar
│   │   └── finance_tools.py     # @tool functions for finance DB
│   ├── auth/
│   │   ├── utils.py             # JWT helpers, get_current_user
│   │   ├── router.py            # /auth/register, /auth/login, /auth/me
│   │   └── google_router.py     # /auth/google/connect, /auth/google/callback
│   ├── routers/
│   │   └── dashboard.py         # /dashboard, /dashboard/emails, /dashboard/calendar
│   ├── services/
│   │   └── sync.py              # Google API → DB cache sync
│   ├── hitl/
│   │   └── store.py             # In-memory interrupt store
│   └── alembic/                 # Database migrations
│
└── frontend/
    ├── app/
    │   ├── (auth)/
    │   │   ├── login/page.tsx
    │   │   └── register/page.tsx
    │   ├── onboarding/page.tsx
    │   └── (dashboard)/
    │       ├── layout.tsx        # Sidebar shell
    │       ├── dashboard/page.tsx
    │       ├── assistant/page.tsx
    │       ├── inbox/page.tsx
    │       ├── finance/page.tsx
    │       ├── calendar/page.tsx
    │       └── profile/page.tsx
    ├── components/
    │   ├── Sidebar.tsx
    │   ├── AuthGuard.tsx
    │   └── hitl/
    │       └── ActionCard.tsx    # Approve / Edit / Reject
    ├── hooks/
    │   ├── useAuth.ts
    │   ├── useChat.ts            # SSE streaming
    │   └── useDashboard.ts
    └── lib/
        ├── auth.ts               # Token storage
        └── api.ts                # Typed fetch wrappers
```

---

## Getting Started

### Prerequisites

- Python 3.11+
- Node.js 18+
- PostgreSQL 14+
- OpenAI API key
- Google Cloud project with Gmail API and Google Calendar API enabled

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/novaris.git
cd novaris
```

### 2. Backend setup

```bash
cd backend
python -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Copy the environment file and fill in your keys:

```bash
cp .env.example .env
```

Run database migrations:

```bash
alembic upgrade head
```

Start the backend:

```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup

```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 4. Google OAuth setup

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a new project
3. Enable **Gmail API** and **Google Calendar API**
4. Create OAuth 2.0 credentials (Web application)
5. Add `http://localhost:8000/auth/google/callback` as an authorised redirect URI
6. Copy the client ID and secret into your `.env`

---

## Environment Variables

### backend/.env

```env
# OpenAI
OPENAI_API_KEY=sk-...

# PostgreSQL
DATABASE_URL=postgresql://user:password@localhost:5432/novaris

# JWT
JWT_SECRET=your-strong-random-secret-min-32-chars
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# Frontend URL (for OAuth redirect after Google callback)
FRONTEND_URL=http://localhost:3000
```

### frontend/.env.local

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## User Journey

```
Register → Onboarding (connect Google) → Dashboard → Assistant Chat
```

1. Register with email + password
2. Connect your Google account (Gmail + Calendar OAuth)
3. Dashboard loads — emails and events cached from Google
4. Chat with the assistant in natural language
5. Any irreversible action (send email, create event) pauses for your approval
6. Approve, edit, or reject directly in the chat interface

---

## How HITL Works

LangGraph's `HumanInTheLoopMiddleware` intercepts tool calls flagged as sensitive before execution:

```
User message
    ↓
Supervisor routes to Email Agent
    ↓
Email Agent calls send_email()
    ↓
INTERRUPT — execution pauses
    ↓
Frontend renders ActionCard (Approve / Edit / Reject)
    ↓
User decides
    ↓
POST /chat/resume → LangGraph Command(resume=...)
    ↓
Execution continues (or cancels)
```

The LangGraph checkpointer stores conversation state in PostgreSQL, so interrupts survive server restarts.

---

## Roadmap

- [ ] Health agent — medication reminders, wellness nudges
- [ ] Shopping agent — grocery lists, price drop alerts
- [ ] Plaid integration — real bank transaction sync
- [ ] Push notifications via Twilio SMS
- [ ] Voice input (Web Speech API)
- [ ] Weekly digest email (automated, Sunday evening)
- [ ] Mobile app (React Native)

---

## Built At

<p>
  <strong>Datics.ai</strong> — where we don't just learn AI, we ship it.<br/>
  Under the mentorship of <strong>Umar Majeed</strong>.
</p>

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with care by <strong>Abdul Qadeer</strong> · 
  <a href="https://datics.ai">datics.ai</a> · 
  <a href="https://linkedin.com/in/yourhandle">LinkedIn</a> · 
  <a href="https://github.com/yourusername">GitHub</a>
</p>
