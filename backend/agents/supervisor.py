from datetime import date

from langchain.agents import create_agent
from langchain.chat_models import init_chat_model
from langchain.tools import tool

from agents.calendar_agent import calendar_agent
from agents.email_agent import email_agent
from agents.finance_agent import invoke_finance_agent

# Destructive tools — interrupt() lives inside these, so they MUST be direct supervisor tools
from tools.gcal_tools import create_calendar_event
from tools.gmail_tools import send_email

# Disable parallel tool calls — prevents two tools interrupting at the same time,
# which leaves the message history in an irrecoverable invalid state.
model = init_chat_model("gpt-3.5-turbo").bind(parallel_tool_calls=False)


@tool
def read_emails(request: str) -> str:
    """Read, search, or list emails. Use for any read-only email operation."""
    result = email_agent.invoke({
        "messages": [{"role": "user", "content": request}]
    })
    return result["messages"][-1].text


@tool
def check_calendar(request: str) -> str:
    """Check calendar availability or list time slots on a date."""
    result = calendar_agent.invoke({
        "messages": [{"role": "user", "content": request}]
    })
    return result["messages"][-1].text


@tool
def manage_finance(request: str) -> str:
    """Handle all personal finance tasks: log expenses, check budgets,
    view spending summaries, track upcoming bills, set budget limits.
    Use for any request about money, spending, expenses, or bills.
    Input: natural language finance request.
    """
    return invoke_finance_agent(request)


def _build_supervisor_prompt() -> str:
    today = date.today().isoformat()
    return (
        f"You are a helpful personal assistant. "
        f"Today's date is {today}. Always use this date when the user says 'today', 'tomorrow', etc. "
        f"Use read_emails to read or search the inbox. "
        f"Use send_email to compose and send an email — it requires human approval before sending. "
        f"Use check_calendar to check calendar availability — always pass the date as ISO format (YYYY-MM-DD). "
        f"Use create_calendar_event to schedule a meeting — it requires human approval. "
        f"For requests involving both email and calendar, use both tools. "
        f"Always compose the full email (to, subject, body) before calling send_email. "
        f"Always provide title, start_time, and end_time in ISO 8601 format (e.g. {today}T14:00:00) "
        f"before calling create_calendar_event. "
        f"Use manage_finance for anything about money, expenses, budgets, bills, or financial summaries."
    )


def build_supervisor(checkpointer):
    """
    Build and return the supervisor agent wired to the given checkpointer.
    Call this once at startup after the Postgres checkpointer is ready.
    """
    return create_agent(
        model,
        tools=[read_emails, check_calendar, send_email, create_calendar_event, manage_finance],
        system_prompt=_build_supervisor_prompt(),
        checkpointer=checkpointer,
    )
