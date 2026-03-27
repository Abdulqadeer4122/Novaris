import json
import logging
from datetime import datetime
from typing import Optional

from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials

from context import current_user_id
from database import db_session
from models import GoogleCredential

log = logging.getLogger("assistant.auth")


def get_credentials() -> Optional[Credentials]:
    """
    Returns credentials for the current request's user (via ContextVar).
    Falls back to the first stored credential for backward compatibility.
    """
    try:
        uid = current_user_id.get()
        return get_credentials_for_user(uid)
    except LookupError:
        # No user context set (e.g. called outside a request) — fallback to first row
        log.warning("get_credentials: no current_user_id in context, falling back to first row")
        with db_session() as db:
            record = db.query(GoogleCredential).first()
        if record is None:
            return None
        return _creds_from_record(record)


def get_credentials_for_user(user_id: int) -> Optional[Credentials]:
    """
    Fetch credentials for a specific user. Refreshes the access token if
    expired and saves the new token back to the database.
    """
    with db_session() as db:
        record = db.query(GoogleCredential).filter(
            GoogleCredential.user_id == user_id
        ).first()
        if record is None:
            log.warning("get_credentials_for_user: no credentials for user_id=%s", user_id)
            return None

        creds = _creds_from_record(record)
        data = json.loads(record.creds_json)

        # Refresh if expired OR if no expiry was ever stored (legacy rows before this fix)
        needs_refresh = not creds.valid or data.get("expiry") is None
        if needs_refresh:
            log.info("Refreshing expired Google token for user_id=%s", user_id)
            try:
                creds.refresh(Request())
                # Persist the new access token and updated expiry
                record.creds_json = _creds_to_json(creds)
                db.commit()
                log.info("Token refreshed and saved for user_id=%s", user_id)
            except Exception as e:
                log.error("Failed to refresh token for user_id=%s: %s", user_id, e)
                return None

        return creds


def _creds_from_record(record: GoogleCredential) -> Credentials:
    data = json.loads(record.creds_json)
    expiry_str = data.get("expiry")
    expiry = datetime.fromisoformat(expiry_str) if expiry_str else None
    return Credentials(
        token=data.get("token"),
        refresh_token=data.get("refresh_token"),
        token_uri=data.get("token_uri"),
        client_id=data.get("client_id"),
        client_secret=data.get("client_secret"),
        scopes=data.get("scopes"),
        expiry=expiry,
    )


def _creds_to_json(creds: Credentials) -> str:
    return json.dumps({
        "token": creds.token,
        "refresh_token": creds.refresh_token,
        "token_uri": creds.token_uri,
        "client_id": creds.client_id,
        "client_secret": creds.client_secret,
        "scopes": list(creds.scopes or []),
        "expiry": creds.expiry.isoformat() if creds.expiry else None,
    })
