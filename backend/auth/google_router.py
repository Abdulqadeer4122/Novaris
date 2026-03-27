import logging
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from google_auth_oauthlib.flow import Flow
from sqlalchemy.orm import Session

from config import settings
from database import get_db
from models import GoogleCredential, User
from auth.utils import decode_token, get_current_user
from auth.google_auth import _creds_to_json

log = logging.getLogger("assistant.auth.google")
router = APIRouter(prefix="/auth/google", tags=["google-oauth"])

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
]

# DEV ONLY: In-memory store to keep flow objects between /connect and /callback
flow_store = {}

def _build_flow() -> Flow:
    return Flow.from_client_config(
        {
            "web": {
                "client_id": settings.google_client_id,
                "client_secret": settings.google_client_secret,
                "redirect_uris": [settings.google_redirect_uri],
                "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                "token_uri": "https://oauth2.googleapis.com/token",
            }
        },
        scopes=SCOPES,
        redirect_uri=settings.google_redirect_uri,
    )


@router.get("/connect")
def connect_google(token: str, db: Session = Depends(get_db)):
    """Step 1: Redirect authenticated user to Google consent screen"""
    user_id = decode_token(token)
    user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    flow = _build_flow()
    auth_url, state = flow.authorization_url(
        access_type="offline",
        include_granted_scopes="true",
        prompt="consent",
        state=str(user_id),  # carry user_id through OAuth round-trip
    )

    # Store flow object for this user_id (state) temporarily
    flow_store[state] = flow

    log.info("Redirecting user_id=%s to Google consent screen", user_id)
    return RedirectResponse(auth_url)


@router.get("/callback")
def google_callback(
    code: str,
    state: str,  # user_id passed through OAuth state
    db: Session = Depends(get_db),
):
    """Step 2: Exchange code for credentials and store them"""
    user_id = int(state)

    # Retrieve the same flow instance
    flow = flow_store.pop(state, None)
    if not flow:
        raise HTTPException(status_code=400, detail="OAuth flow not found for this state")

    try:
        flow.fetch_token(code=code)
    except Exception as e:
        log.error("Failed to fetch token for user_id=%s: %s", user_id, e)
        raise HTTPException(status_code=400, detail="Failed to fetch token from Google")

    creds = flow.credentials
    creds_json = _creds_to_json(creds)

    existing = db.query(GoogleCredential).filter(GoogleCredential.user_id == user_id).first()
    if existing:
        existing.creds_json = creds_json
    else:
        db.add(GoogleCredential(user_id=user_id, creds_json=creds_json))

    user = db.query(User).filter(User.id == user_id).first()
    if user:
        user.google_connected = True

    db.commit()
    log.info("Google credentials stored for user_id=%s ✅", user_id)
    return RedirectResponse(f"{settings.frontend_url}/chat?connected=true")


@router.get("/status")
def google_status(current_user: User = Depends(get_current_user)):
    return {"google_connected": current_user.google_connected}