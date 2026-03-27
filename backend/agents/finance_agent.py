from langchain.agents import create_agent
from langchain.chat_models import init_chat_model

from tools.finance_tools import (
    add_bill,
    add_expense,
    check_budget,
    get_expenses,
    get_monthly_summary,
    get_upcoming_bills,
    set_budget,
)

model = init_chat_model("gpt-4o")

FINANCE_AGENT_PROMPT = (
    "You are a specialist personal finance assistant. "
    "Help the user track expenses, manage budgets, and monitor bills. "
    "Use add_expense to log spending from natural language. "
    "Use check_budget to compare spending against monthly limits — "
    "proactively warn if any category is above 80%. "
    "Use get_upcoming_bills to alert about bills due soon. "
    "Use get_monthly_summary for full monthly overviews. "
    "Map vague categories to the closest of: "
    "food, transport, utilities, health, shopping, other. "
    "Always round money to 2 decimal places. "
    "Never expose database IDs in responses. "
    "Confirm every action taken in your final response."
)

finance_agent = create_agent(
    model,
    tools=[
        add_expense, get_expenses, check_budget,
        set_budget, get_upcoming_bills, add_bill, get_monthly_summary,
    ],
    system_prompt=FINANCE_AGENT_PROMPT,
    # No checkpointer — stateless sub-agent, no HITL needed.
)


def invoke_finance_agent(request: str) -> str:
    result = finance_agent.invoke({
        "messages": [{"role": "user", "content": request}]
    })
    return result["messages"][-1].text
