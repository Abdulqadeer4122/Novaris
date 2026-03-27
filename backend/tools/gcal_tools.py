import logging
from datetime import datetime, timedelta, date as date_type

from googleapiclient.discovery import build
from langchain.tools import tool
from langgraph.types import interrupt

from auth.google_auth import get_credentials

log = logging.getLogger("tools.gcal")


@tool
def get_available_time_slots(date: str, duration_minutes: int) -> list[str]:
    """Return available time slots on a given date (ISO format: 2024-01-15)."""
    log.info("get_available_time_slots → date=%s duration=%d min", date, duration_minutes)

    creds = get_credentials()
    if not creds:
        log.error("get_available_time_slots: no Google credentials")
        return ["Error: Google account not connected. Visit http://localhost:8001/auth/google first."]

    try:
        service = build("calendar", "v3", credentials=creds)
        day = datetime.fromisoformat(date)
        time_min = day.isoformat() + "Z"
        time_max = (day + timedelta(days=1)).isoformat() + "Z"
        body = {"timeMin": time_min, "timeMax": time_max, "items": [{"id": "primary"}]}
        result = service.freebusy().query(body=body).execute()
        busy = result["calendars"]["primary"]["busy"]
        log.info("Busy slots on %s: %d busy block(s)", date, len(busy))

        # If checking today, start from the next 30-min boundary after now
        if day.date() == date_type.today():
            now = datetime.now()
            # Round up to the next 30-min slot
            if now.minute < 30:
                next_slot = now.replace(minute=30, second=0, microsecond=0)
            else:
                next_slot = (now + timedelta(hours=1)).replace(minute=0, second=0, microsecond=0)
            # Don't go before 9am
            earliest = day.replace(hour=9, minute=0, second=0, microsecond=0)
            current = max(next_slot, earliest)
            log.info("Today's slots start from %s (current time aware)", current.strftime("%H:%M"))
        else:
            current = day.replace(hour=9, minute=0, second=0, microsecond=0)

        end_of_day = day.replace(hour=18, minute=0, second=0, microsecond=0)
        slots = []
        while current + timedelta(minutes=duration_minutes) <= end_of_day:
            slot_end = current + timedelta(minutes=duration_minutes)
            overlap = any(
                datetime.fromisoformat(b["start"].replace("Z", "")) < slot_end
                and datetime.fromisoformat(b["end"].replace("Z", "")) > current
                for b in busy
            )
            if not overlap:
                slots.append(current.strftime("%H:%M"))
            current += timedelta(minutes=30)

        log.info("Available slots: %s", slots)
        return slots if slots else ["No available slots found for the requested duration."]
    except Exception as e:
        log.error("Calendar API error in get_available_time_slots: %s", e)
        return [f"Failed to check availability: {e}"]


@tool
def create_calendar_event(
    title: str,
    start_time: str,
    end_time: str,
    attendees: list[str] = [],
) -> str:
    """Create a Google Calendar event after human approval.
    Use ISO datetime: 2024-01-15T14:00:00."""
    log.info("create_calendar_event called → title=%r start=%s end=%s attendees=%s",
             title, start_time, end_time, attendees)

    log.info("Firing interrupt for create_calendar_event approval…")
    decision = interrupt({
        "tool": "create_calendar_event",
        "args": {"title": title, "start_time": start_time, "end_time": end_time, "attendees": attendees},
    })
    log.info("create_calendar_event resumed with decision=%r", decision)

    if decision == "reject":
        log.info("User rejected calendar event creation")
        return "Calendar event creation was cancelled by the user."

    if isinstance(decision, dict) and decision.get("type") == "edit":
        edited = decision.get("args", {})
        title = edited.get("title", title)
        start_time = edited.get("start_time", start_time)
        end_time = edited.get("end_time", end_time)
        attendees = edited.get("attendees", attendees)
        log.info("Using edited args → title=%r start=%s", title, start_time)

    creds = get_credentials()
    if not creds:
        log.error("create_calendar_event: no Google credentials")
        return "Error: Google account not connected. Visit http://localhost:8001/auth/google first."

    log.info("Creating calendar event via Google Calendar API…")
    try:
        service = build("calendar", "v3", credentials=creds)
        event = {
            "summary": title,
            "start": {"dateTime": start_time, "timeZone": "UTC"},
            "end": {"dateTime": end_time, "timeZone": "UTC"},
            "attendees": [{"email": a} for a in attendees],
        }
        created = service.events().insert(calendarId="primary", body=event).execute()
        log.info("Event created: %s", created.get("htmlLink"))
        return f"Event created: {title} from {start_time} to {end_time} — {created.get('htmlLink')}"
    except Exception as e:
        log.error("Calendar API error during create: %s", e)
        return f"Failed to create event: {e}"
