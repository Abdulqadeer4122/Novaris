import json
import logging
import os
import traceback
import uuid
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()  # must be before any agent imports

# Allow OAuth over HTTP on localhost
os.environ.setdefault("OAUTHLIB_INSECURE_TRANSPORT", "1")

# ── Logging setup ─────────────────────────────────────────────────────────────
logging.basicConfig(
    level=logging.DEBUG,
    format="%(asctime)s [%(levelname)s] %(name)s — %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("assistant")
logging.getLogger("httpx").setLevel(logging.WARNING)
logging.getLogger("httpcore").setLevel(logging.WARNING)
logging.getLogger("openai").setLevel(logging.WARNING)
logging.getLogger("googleapiclient").setLevel(logging.WARNING)
logging.getLogger("urllib3").setLevel(logging.WARNING)
# ──────────────────────────────────────────────────────────────────────────────

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from langgraph.types import Command
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sse_starlette.sse import EventSourceResponse

from database import get_db
from db import close_db, init_db
from models import ChatSession, User
from hitl.store import PgHitlStore
from auth.router import router as auth_router
from auth.google_router import router as google_router
from auth.utils import get_current_user, require_google_connected
from routers.dashboard import router as dashboard_router
from agents.supervisor import build_supervisor
from context import current_user_id as current_user_id_var

# ── Global state set during lifespan ──────────────────────────────────────────
supervisor_agent = None
hitl_store: PgHitlStore | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global supervisor_agent, hitl_store

    log.info("Starting up — initialising Postgres and agents…")
    checkpointer = init_db()               # SQLAlchemy engine + psycopg pool
    hitl_store = PgHitlStore()             # uses module-level SessionLocal
    log.info("Loading supervisor agent…")
    supervisor_agent = build_supervisor(checkpointer)
    log.info("Startup complete ✅")

    yield

    log.info("Shutting down…")
    close_db()


app = FastAPI(lifespan=lifespan)

app.include_router(auth_router)
app.include_router(google_router)
app.include_router(dashboard_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Models ────────────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    message: str
    thread_id: str = ""


class ResumeRequest(BaseModel):
    interrupt_id: str
    thread_id: str
    decision: str          # "approve" | "edit" | "reject"
    edited_args: dict | None = None


# ── Helpers ───────────────────────────────────────────────────────────────────

def _is_final_ai_message(msg) -> bool:
    """Return True only for final AI responses — not tool calls, not tool results."""
    if msg.__class__.__name__ != "AIMessage":
        return False
    content = getattr(msg, "content", None)
    if not content:
        return False
    if getattr(msg, "tool_calls", []):
        return False
    return True


def _upsert_session(db: Session, thread_id: str, title: str) -> None:
    """Create session record on first message; update last_active_at on subsequent ones."""
    record = db.get(ChatSession, thread_id)
    if record is None:
        db.add(ChatSession(thread_id=thread_id, title=title[:80]))
    else:
        record.last_active_at = datetime.now(timezone.utc)
    db.commit()


def _messages_to_history(messages: list) -> list[dict]:
    """Convert LangGraph message objects to simple {role, content} dicts."""
    result = []
    for msg in messages:
        cls = msg.__class__.__name__
        content = getattr(msg, "content", "")
        if not content:
            continue
        if cls == "HumanMessage":
            result.append({"role": "user", "content": content})
        elif cls == "AIMessage" and not getattr(msg, "tool_calls", []):
            result.append({"role": "assistant", "content": content})
    return result


# ── Endpoints ─────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok"}


# ── Session history endpoints ──────────────────────────────────────────────────

@app.get("/sessions")
def list_sessions(
    _: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Return all sessions ordered by most recently active."""
    sessions = (
        db.query(ChatSession)
        .order_by(ChatSession.last_active_at.desc())
        .all()
    )
    return [
        {
            "thread_id": s.thread_id,
            "title": s.title,
            "created_at": s.created_at.isoformat(),
            "last_active_at": s.last_active_at.isoformat(),
        }
        for s in sessions
    ]


@app.get("/sessions/{thread_id}/messages")
def get_session_messages(thread_id: str):
    """Return the full message history for a session from LangGraph state."""
    config = {"configurable": {"thread_id": thread_id}}
    state = supervisor_agent.get_state(config)
    messages = state.values.get("messages", []) if state.values else []
    return _messages_to_history(messages)


# ── Chat endpoints ─────────────────────────────────────────────────────────────

@app.post("/chat")
async def chat(
    body: ChatRequest,
    current_user: User = Depends(require_google_connected),
    db: Session = Depends(get_db),
):
    thread_id = body.thread_id or str(uuid.uuid4())
    message = body.message
    log.info("POST /chat | thread=%s | message=%r", thread_id, message[:80])

    _upsert_session(db, thread_id, message)

    async def event_generator():
        # Yield thread_id first so the frontend knows which thread was assigned
        yield {"data": json.dumps({"type": "thread_id", "thread_id": thread_id})}

        current_user_id_var.set(current_user.id)
        config = {"configurable": {"thread_id": thread_id}}
        try:
            step_count = 0
            for step in supervisor_agent.stream(
                {"messages": [{"role": "user", "content": message}]},
                config,
            ):
                step_count += 1
                log.debug("Stream step #%d keys: %s", step_count, list(step.keys()))

                if "__interrupt__" in step:
                    interrupts = step["__interrupt__"]
                    log.info("INTERRUPT received — %d interrupt(s)", len(interrupts))
                    for interrupt_ in interrupts:
                        hitl_store.set(interrupt_.id, thread_id)
                        payload = {
                            "type": "interrupt",
                            "id": interrupt_.id,
                            "tool": interrupt_.value.get("tool", "unknown"),
                            "args": interrupt_.value.get("args", {}),
                        }
                        log.info("Sending interrupt payload: %s", payload)
                        yield {"data": json.dumps(payload)}
                    return

                for _, update in step.items():
                    if not isinstance(update, dict):
                        continue
                    msgs = update.get("messages", [])
                    for msg in msgs:
                        if _is_final_ai_message(msg):
                            log.info("Streaming AI response (%d chars)", len(msg.content))
                            yield {"data": json.dumps({"type": "token", "data": msg.content})}

        except Exception as e:
            err_str = str(e)
            log.error("Exception in chat stream: %s\n%s", e, traceback.format_exc())
            if "tool_call_ids did not have response messages" in err_str:
                new_tid = str(uuid.uuid4())
                log.warning("Broken thread state — issuing new thread_id=%s", new_tid)
                yield {"data": json.dumps({
                    "type": "reset",
                    "new_thread_id": new_tid,
                    "message": "The previous conversation had a state error and was reset. Please resend your message.",
                })}
            else:
                yield {"data": json.dumps({"type": "error", "data": err_str})}

        log.info("Stream complete for thread=%s", thread_id)
        yield {"data": json.dumps({"type": "done"})}

    return EventSourceResponse(event_generator())


@app.post("/chat/resume")
async def resume(
    body: ResumeRequest,
    current_user: User = Depends(require_google_connected),
):
    log.info(
        "POST /chat/resume | interrupt_id=%s | decision=%s | thread=%s",
        body.interrupt_id, body.decision, body.thread_id,
    )
    thread_id = hitl_store.pop(body.interrupt_id)
    if thread_id is None:
        return JSONResponse({"error": "Unknown interrupt_id"}, status_code=404)

    if body.decision == "approve":
        resume_val = "approve"
    elif body.decision == "edit":
        resume_val = {"type": "edit", "args": body.edited_args or {}}
        log.info("Edit args: %s", body.edited_args)
    elif body.decision == "reject":
        resume_val = "reject"
    else:
        return JSONResponse({"error": "Invalid decision"}, status_code=400)

    log.info("Resuming graph | thread=%s | resume_val=%s", thread_id, resume_val)

    async def event_generator():
        current_user_id_var.set(current_user.id)
        config = {"configurable": {"thread_id": thread_id}}
        try:
            step_count = 0
            for step in supervisor_agent.stream(
                Command(resume={body.interrupt_id: resume_val}),
                config,
            ):
                step_count += 1
                log.debug("Resume stream step #%d keys: %s", step_count, list(step.keys()))

                if "__interrupt__" in step:
                    interrupts = step["__interrupt__"]
                    log.info("Follow-up INTERRUPT in resume — %d interrupt(s)", len(interrupts))
                    for interrupt_ in interrupts:
                        hitl_store.set(interrupt_.id, thread_id)
                        payload = {
                            "type": "interrupt",
                            "id": interrupt_.id,
                            "tool": interrupt_.value.get("tool", "unknown"),
                            "args": interrupt_.value.get("args", {}),
                        }
                        yield {"data": json.dumps(payload)}
                    return

                for _, update in step.items():
                    if not isinstance(update, dict):
                        continue
                    msgs = update.get("messages", [])
                    for msg in msgs:
                        if _is_final_ai_message(msg):
                            log.info("Streaming resumed AI response (%d chars)", len(msg.content))
                            yield {"data": json.dumps({"type": "token", "data": msg.content})}

        except Exception as e:
            err_str = str(e)
            log.error("Exception in resume stream: %s\n%s", e, traceback.format_exc())
            if "tool_call_ids did not have response messages" in err_str:
                new_tid = str(uuid.uuid4())
                yield {"data": json.dumps({
                    "type": "reset",
                    "new_thread_id": new_tid,
                    "message": "Conversation was reset due to a state error. Please resend your message.",
                })}
            else:
                yield {"data": json.dumps({"type": "error", "data": err_str})}

        log.info("Resume stream complete for thread=%s", thread_id)
        yield {"data": json.dumps({"type": "done"})}

    return EventSourceResponse(event_generator())
