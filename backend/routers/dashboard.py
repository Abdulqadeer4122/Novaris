import logging
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from auth.utils import require_google_connected, get_current_user
from database import get_db
from models import Bill, Budget, CachedCalendarEvent, CachedEmail, Expense, User
from services.sync import sync_calendar, sync_emails

log = logging.getLogger("assistant.dashboard")

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


class DashboardResponse(BaseModel):
    finance: dict
    emails: list[dict]
    events_today: list[dict]
    events_upcoming: list[dict]
    bills_upcoming: list[dict]


@router.get("", response_model=DashboardResponse)
def get_dashboard(
    current_user: User = Depends(require_google_connected),
    db: Session = Depends(get_db),
):
    sync_emails(current_user.id, db)
    sync_calendar(current_user.id, db)

    today = date.today()
    today_str = today.isoformat()
    month_str = today.strftime("%Y-%m")

    # ── Finance ──────────────────────────────────────────────────────────────
    expenses = db.query(Expense).filter(
        Expense.date.startswith(month_str)
    ).all()
    # Filter by user_id where available (user_id column nullable for old rows)
    expenses = [e for e in expenses if e.user_id is None or e.user_id == current_user.id]

    total_spent = sum(e.amount for e in expenses)

    budgets = db.query(Budget).all()
    budgets = [b for b in budgets if b.user_id is None or b.user_id == current_user.id]
    total_budget = sum(b.monthly_limit for b in budgets)

    budget_map = {b.category: b.monthly_limit for b in budgets}
    spent_map: dict = {}
    for e in expenses:
        spent_map[e.category] = spent_map.get(e.category, 0) + e.amount

    budget_health = []
    for cat, limit in budget_map.items():
        spent = spent_map.get(cat, 0)
        pct = round((spent / limit * 100) if limit else 0, 1)
        budget_health.append({
            "category": cat,
            "spent": round(spent, 2),
            "limit": round(limit, 2),
            "pct": pct,
            "status": "over" if pct > 100 else ("warning" if pct >= 80 else "ok"),
        })

    # ── Bills ─────────────────────────────────────────────────────────────────
    bills = db.query(Bill).all()
    upcoming_bills = []
    for b in bills:
        try:
            due = today.replace(day=b.due_day)
        except ValueError:
            continue
        if due < today:
            m = today.month + 1 if today.month < 12 else 1
            y = today.year if today.month < 12 else today.year + 1
            try:
                due = due.replace(year=y, month=m)
            except ValueError:
                continue
        days_until = (due - today).days
        if days_until <= 10:
            upcoming_bills.append({
                "name": b.name,
                "amount": b.amount,
                "due_date": due.isoformat(),
                "days_until": days_until,
            })
    upcoming_bills.sort(key=lambda x: x["days_until"])

    # ── Emails ────────────────────────────────────────────────────────────────
    emails = (
        db.query(CachedEmail)
        .filter(CachedEmail.user_id == current_user.id, CachedEmail.fetched_date == today_str)
        .order_by(CachedEmail.received_at.desc())
        .limit(20)
        .all()
    )

    # ── Calendar ──────────────────────────────────────────────────────────────
    today_start = datetime.combine(today, datetime.min.time()).replace(tzinfo=timezone.utc)
    today_end = datetime.combine(today, datetime.max.time()).replace(tzinfo=timezone.utc)

    events_today = (
        db.query(CachedCalendarEvent)
        .filter(
            CachedCalendarEvent.user_id == current_user.id,
            CachedCalendarEvent.start_time >= today_start,
            CachedCalendarEvent.start_time <= today_end,
        )
        .order_by(CachedCalendarEvent.start_time)
        .all()
    )

    events_upcoming = (
        db.query(CachedCalendarEvent)
        .filter(
            CachedCalendarEvent.user_id == current_user.id,
            CachedCalendarEvent.start_time > today_end,
        )
        .order_by(CachedCalendarEvent.start_time)
        .limit(10)
        .all()
    )

    def fmt_event(e: CachedCalendarEvent) -> dict:
        return {
            "id": e.id,
            "title": e.title,
            "start_time": e.start_time.isoformat(),
            "end_time": e.end_time.isoformat(),
            "location": e.location,
            "attendee_count": e.attendee_count,
            "meet_link": e.meet_link,
        }

    return DashboardResponse(
        finance={
            "total_spent": round(total_spent, 2),
            "total_budget": round(total_budget, 2),
            "remaining": round(total_budget - total_spent, 2),
            "month": month_str,
            "budget_health": budget_health,
            "recent_expenses": [
                {
                    "description": e.description,
                    "category": e.category,
                    "amount": e.amount,
                    "date": e.date,
                }
                for e in sorted(expenses, key=lambda x: x.date, reverse=True)[:5]
            ],
        },
        emails=[
            {
                "id": e.id,
                "sender_name": e.sender_name,
                "sender_email": e.sender_email,
                "subject": e.subject,
                "snippet": e.snippet,
                "is_unread": e.is_unread,
                "received_at": e.received_at.isoformat(),
            }
            for e in emails
        ],
        events_today=[fmt_event(e) for e in events_today],
        events_upcoming=[fmt_event(e) for e in events_upcoming],
        bills_upcoming=upcoming_bills,
    )


@router.get("/emails")
def get_emails(
    current_user: User = Depends(require_google_connected),
    db: Session = Depends(get_db),
):
    sync_emails(current_user.id, db)
    today_str = date.today().isoformat()
    emails = (
        db.query(CachedEmail)
        .filter(CachedEmail.user_id == current_user.id, CachedEmail.fetched_date == today_str)
        .order_by(CachedEmail.received_at.desc())
        .all()
    )
    return [
        {
            "id": e.id,
            "sender_name": e.sender_name,
            "sender_email": e.sender_email,
            "subject": e.subject,
            "snippet": e.snippet,
            "is_unread": e.is_unread,
            "received_at": e.received_at.isoformat(),
        }
        for e in emails
    ]


@router.get("/calendar")
def get_calendar(
    current_user: User = Depends(require_google_connected),
    db: Session = Depends(get_db),
):
    sync_calendar(current_user.id, db)
    events = (
        db.query(CachedCalendarEvent)
        .filter(CachedCalendarEvent.user_id == current_user.id)
        .order_by(CachedCalendarEvent.start_time)
        .all()
    )
    return [
        {
            "id": e.id,
            "title": e.title,
            "start_time": e.start_time.isoformat(),
            "end_time": e.end_time.isoformat(),
            "location": e.location,
            "attendee_count": e.attendee_count,
            "meet_link": e.meet_link,
        }
        for e in events
    ]
