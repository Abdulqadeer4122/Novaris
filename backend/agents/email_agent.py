from datetime import date, timedelta

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model

from tools.gmail_tools import list_emails

model = init_chat_model("gpt-4o")

_today = date.today()
_today_str = _today.isoformat()                          # 2026-03-26
_today_gmail = _today.strftime("%Y/%m/%d")               # 2026/03/26  (Gmail query format)
_yesterday_gmail = (_today - timedelta(days=1)).strftime("%Y/%m/%d")
_tomorrow_gmail = (_today + timedelta(days=1)).strftime("%Y/%m/%d")

EMAIL_READ_PROMPT = (
    f"You are an email reading assistant. Today's date is {_today_str}. "
    f"Use list_emails with proper Gmail search query syntax to filter emails by date or topic. "
    f"\n\nGmail query examples:"
    f"\n  Today's emails      → query='after:{_today_gmail}'"
    f"\n  Yesterday's emails  → query='after:{_yesterday_gmail} before:{_today_gmail}'"
    f"\n  From a person       → query='from:name@example.com after:{_today_gmail}'"
    f"\n  About a topic today → query='subject:invoice after:{_today_gmail}'"
    f"\n  Unread today        → query='is:unread after:{_today_gmail}'"
    f"\n\nAlways apply a date filter when the user asks about 'today', 'yesterday', "
    f"'this week', or any specific period. "
    f"Present results clearly with sender, subject, and date."
)

email_agent = create_agent(
    model,
    tools=[list_emails],
    system_prompt=EMAIL_READ_PROMPT,
)
