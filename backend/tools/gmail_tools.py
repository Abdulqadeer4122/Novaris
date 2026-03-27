import base64
import logging
from email.mime.text import MIMEText

from googleapiclient.discovery import build
from langchain.tools import tool
from langgraph.types import interrupt

from auth.google_auth import get_credentials

log = logging.getLogger("tools.gmail")


@tool
def send_email(to: list[str], subject: str, body: str) -> str:
    """Compose and send an email. Requires human approval before sending.
    Provide final recipient list, subject line, and full email body."""
    log.info("send_email called → to=%s subject=%r", to, subject)

    log.info("Firing interrupt for send_email approval…")
    decision = interrupt({"tool": "send_email", "args": {"to": to, "subject": subject, "body": body}})
    log.info("send_email resumed with decision=%r", decision)

    if decision == "reject":
        log.info("User rejected email send")
        return "Email sending was cancelled by the user."

    if isinstance(decision, dict) and decision.get("type") == "edit":
        edited = decision.get("args", {})
        to = edited.get("to", to)
        subject = edited.get("subject", subject)
        body = edited.get("body", body)
        log.info("Using edited args → to=%s subject=%r", to, subject)

    creds = get_credentials()
    if not creds:
        log.error("send_email: no Google credentials found")
        return "Error: Google account not connected. Visit http://localhost:8001/auth/google first."

    log.info("Sending email via Gmail API…")
    try:
        service = build("gmail", "v1", credentials=creds)
        message = MIMEText(body)
        message["to"] = ", ".join(to)
        message["subject"] = subject
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        service.users().messages().send(userId="me", body={"raw": raw}).execute()
        log.info("Email sent successfully to %s", to)
        return f"Email sent to {', '.join(to)} — subject: {subject}"
    except Exception as e:
        log.error("Gmail API error during send: %s", e)
        return f"Failed to send email: {e}"


@tool
def list_emails(query: str = "", max_results: int = 10) -> str:
    """List emails from Gmail using a search query string.
    Supports Gmail search syntax, e.g.:
      after:2026/03/26           — emails received on or after this date
      before:2026/03/27          — emails received before this date
      after:2026/03/26 before:2026/03/27  — emails on a specific day
      from:someone@example.com   — from a specific sender
      subject:invoice            — subject contains a word
      is:unread                  — only unread emails
    Combine filters with spaces: 'is:unread after:2026/03/26'
    """
    log.info("list_emails called → query=%r max_results=%d", query, max_results)

    creds = get_credentials()
    if not creds:
        log.error("list_emails: no Google credentials found")
        return "Error: Google account not connected. Visit http://localhost:8001/auth/google first."

    try:
        service = build("gmail", "v1", credentials=creds)
        result = (
            service.users()
            .messages()
            .list(userId="me", maxResults=max_results, q=query, labelIds=["INBOX"])
            .execute()
        )
        messages = result.get("messages", [])
        log.info("list_emails: found %d messages", len(messages))

        if not messages:
            return f"No emails found matching '{query}'."

        output = []
        for msg in messages:
            detail = (
                service.users()
                .messages()
                .get(
                    userId="me",
                    id=msg["id"],
                    format="metadata",
                    metadataHeaders=["From", "Subject", "Date"],
                )
                .execute()
            )
            headers = {h["name"]: h["value"] for h in detail["payload"]["headers"]}
            output.append(
                f"From: {headers.get('From')} | Subject: {headers.get('Subject')} | Date: {headers.get('Date')}"
            )
        return "\n".join(output)
    except Exception as e:
        log.error("Gmail API error during list: %s", e)
        return f"Failed to list emails: {e}"
