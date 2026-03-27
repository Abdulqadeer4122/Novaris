from datetime import date

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model

from tools.gcal_tools import get_available_time_slots

model = init_chat_model("gpt-4o")

_today = date.today().isoformat()
CALENDAR_READ_PROMPT = (
    f"You are a calendar reading assistant. Today's date is {_today}. "
    f"Use get_available_time_slots to check availability. "
    f"Always pass the date as ISO format YYYY-MM-DD (e.g. {_today} for today). "
    f"When the user says 'today' use {_today}, 'tomorrow' use the next day, etc. "
    f"Present the available slots clearly."
)

calendar_agent = create_agent(
    model,
    tools=[get_available_time_slots],
    system_prompt=CALENDAR_READ_PROMPT,
)
