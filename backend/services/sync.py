import logging
from datetime import date, datetime, timedelta, timezone
from email.utils import parsedate_to_datetime

from google.auth.transport.requests import Request
from googleapiclient.discovery import build
from sqlalchemy.orm import Session

from auth.google_auth import get_credentials_for_user
from models import CachedCalendarEvent, CachedEmail

log = logging.getLogger("assistant.sync")


def _is_cache_fresh(db: Session, model, user_id: int) -> bool:
    today = date.today().isoformat()
    row = db.query(model).filter(
        model.user_id == user_id,
        model.fetched_date == today,
    ).first()
    return row is not None


def sync_emails(user_id: int, db: Session, max_results: int = 20) -> None:
    """Fetch today's emails from Gmail and upsert into cached_emails."""
    if _is_cache_fresh(db, CachedEmail, user_id):
        return

    creds = get_credentials_for_user(user_id)
    if not creds:
        log.warning("sync_emails: no credentials for user_id=%s", user_id)
        return

    try:
        service = build("gmail", "v1", credentials=creds)
        today_query = f"after:{date.today().strftime('%Y/%m/%d')}"
        result = service.users().messages().list(
            userId="me", q=today_query, maxResults=max_results
        ).execute()

        messages = result.get("messages", [])
        today_str = date.today().isoformat()

        for msg_ref in messages:
            msg = service.users().messages().get(
                userId="me", id=msg_ref["id"], format="metadata",
                metadataHeaders=["From", "Subject", "Date"],
            ).execute()

            headers = {h["name"]: h["value"] for h in msg["payload"]["headers"]}
            is_unread = "UNREAD" in msg.get("labelIds", [])

            from_raw = headers.get("From", "")
            if "<" in from_raw:
                sender_name = from_raw.split("<")[0].strip().strip('"')
                sender_email = from_raw.split("<")[1].rstrip(">").strip()
            else:
                sender_name = None
                sender_email = from_raw.strip()

            try:
                received_at = parsedate_to_datetime(headers.get("Date", ""))
            except Exception:
                received_at = datetime.now(timezone.utc)

            existing = db.query(CachedEmail).filter(
                CachedEmail.user_id == user_id,
                CachedEmail.gmail_id == msg_ref["id"],
            ).first()

            if existing:
                existing.is_unread = is_unread
                existing.fetched_date = today_str
            else:
                db.add(CachedEmail(
                    user_id=user_id,
                    gmail_id=msg_ref["id"],
                    sender_name=sender_name,
                    sender_email=sender_email,
                    subject=headers.get("Subject", "(no subject)"),
                    snippet=msg.get("snippet", ""),
                    is_unread=is_unread,
                    received_at=received_at,
                    fetched_date=today_str,
                ))

        db.commit()
        log.info("sync_emails: synced %d emails for user_id=%s", len(messages), user_id)
    except Exception as e:
        log.error("sync_emails failed for user_id=%s: %s", user_id, e)
        db.rollback()


def sync_calendar(user_id: int, db: Session, days_ahead: int = 7) -> None:
    """Fetch upcoming calendar events and upsert into cached_calendar_events."""
    if _is_cache_fresh(db, CachedCalendarEvent, user_id):
        return

    creds = get_credentials_for_user(user_id)
    if not creds:
        log.warning("sync_calendar: no credentials for user_id=%s", user_id)
        return

    try:
        service = build("calendar", "v3", credentials=creds)
        now = datetime.now(timezone.utc)
        time_max = now + timedelta(days=days_ahead)

        events_result = service.events().list(
            calendarId="primary",
            timeMin=now.isoformat(),
            timeMax=time_max.isoformat(),
            maxResults=50,
            singleEvents=True,
            orderBy="startTime",
        ).execute()

        today_str = date.today().isoformat()
        events = events_result.get("items", [])

        def parse_dt(val: str) -> datetime:
            if not val:
                return datetime.now(timezone.utc)
            if "T" in val:
                dt = datetime.fromisoformat(val)
                if dt.tzinfo is None:
                    dt = dt.replace(tzinfo=timezone.utc)
                return dt
            return datetime.fromisoformat(val + "T00:00:00+00:00")

        for evt in events:
            start = evt.get("start", {})
            end = evt.get("end", {})
            start_dt = parse_dt(start.get("dateTime") or start.get("date", ""))
            end_dt = parse_dt(end.get("dateTime") or end.get("date", ""))

            attendees = evt.get("attendees", [])
            entry_points = evt.get("conferenceData", {}).get("entryPoints", [])
            meet_link = evt.get("hangoutLink") or (
                entry_points[0].get("uri") if entry_points else None
            )

            existing = db.query(CachedCalendarEvent).filter(
                CachedCalendarEvent.user_id == user_id,
                CachedCalendarEvent.google_event_id == evt["id"],
            ).first()

            if existing:
                existing.title = evt.get("summary", "Untitled")
                existing.start_time = start_dt
                existing.end_time = end_dt
                existing.attendee_count = len(attendees)
                existing.meet_link = meet_link
                existing.fetched_date = today_str
            else:
                db.add(CachedCalendarEvent(
                    user_id=user_id,
                    google_event_id=evt["id"],
                    title=evt.get("summary", "Untitled"),
                    start_time=start_dt,
                    end_time=end_dt,
                    location=evt.get("location"),
                    attendee_count=len(attendees),
                    meet_link=meet_link,
                    fetched_date=today_str,
                ))

        db.commit()
        log.info("sync_calendar: synced %d events for user_id=%s", len(events), user_id)
    except Exception as e:
        log.error("sync_calendar failed for user_id=%s: %s", user_id, e)
        db.rollback()
