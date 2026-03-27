# tools/finance_tools.py
from datetime import datetime
from langchain.tools import tool
from database import db_session
from models import Bill, Budget, Expense
from context import current_user_id  # ← import the context var


def _uid() -> int:
    """Get the current user's ID from the request context."""
    uid = current_user_id.get(None)
    if uid is None:
        raise RuntimeError("No user_id in context — finance tools require authentication.")
    return uid


@tool
def add_expense(amount: float, category: str, description: str, date: str = "") -> str:
    """Log a new expense. Category: food, transport, utilities, health,
    shopping, or other. Date is ISO format (2024-01-15); defaults to today."""
    expense_date = date if date else datetime.today().strftime("%Y-%m-%d")
    with db_session() as db:
        row = Expense(
            user_id=_uid(),  # ← scoped to user
            date=expense_date,
            amount=round(amount, 2),
            category=category.lower().strip(),
            description=description,
        )
        db.add(row)
        db.commit()
    return f"Logged: {description} — {category} — ${amount:.2f} on {expense_date}"


@tool
def get_expenses(month: str = "", category: str = "") -> str:
    """Fetch expenses filtered by month (YYYY-MM) and/or category."""
    uid = _uid()
    with db_session() as db:
        query = db.query(Expense).filter(Expense.user_id == uid)  # ← scoped
        if month:
            query = query.filter(Expense.date.startswith(month))
        if category:
            query = query.filter(Expense.category == category.lower().strip())
        rows = query.order_by(Expense.date.desc()).all()
    if not rows:
        return "No expenses found."
    total = sum(r.amount for r in rows)
    by_cat: dict = {}
    for r in rows:
        by_cat[r.category] = by_cat.get(r.category, 0) + r.amount
    breakdown = "\n".join(f"  {k}: ${v:.2f}" for k, v in by_cat.items())
    return f"Total: ${total:.2f}\nBy category:\n{breakdown}"


@tool
def check_budget(month: str = "") -> str:
    """Compare this month's spending against budget limits per category."""
    uid = _uid()
    target = month if month else datetime.today().strftime("%Y-%m")
    with db_session() as db:
        budgets = db.query(Budget).filter(Budget.user_id == uid).all()  # ← scoped
        if not budgets:
            return "No budgets set. Use set_budget to define limits."
        lines = []
        for b in budgets:
            spent = sum(
                e.amount for e in db.query(Expense).filter(
                    Expense.user_id == uid,        # ← scoped
                    Expense.category == b.category,
                    Expense.date.startswith(target),
                ).all()
            )
            pct = (spent / b.monthly_limit * 100) if b.monthly_limit else 0
            status = "OVER BUDGET" if spent > b.monthly_limit else (
                "WARNING" if pct >= 80 else "OK"
            )
            lines.append(
                f"{b.category}: ${spent:.2f} / ${b.monthly_limit:.2f} "
                f"({pct:.0f}%) — {status}"
            )
    return "\n".join(lines)


@tool
def set_budget(category: str, monthly_limit: float) -> str:
    """Set or update the monthly spending limit for a category."""
    uid = _uid()
    cat = category.lower().strip()
    with db_session() as db:
        existing = db.query(Budget).filter(
            Budget.user_id == uid,   # ← scoped
            Budget.category == cat,
        ).first()
        if existing:
            existing.monthly_limit = monthly_limit
        else:
            db.add(Budget(user_id=uid, category=cat, monthly_limit=monthly_limit))
        db.commit()
    return f"Budget set: {cat} → ${monthly_limit:.2f}/month"


@tool
def get_upcoming_bills(days_ahead: int = 7) -> str:
    """List bills due within the next N days."""
    uid = _uid()
    with db_session() as db:
        bills = db.query(Bill).filter(Bill.user_id == uid).all()  # ← scoped
    if not bills:
        return "No bills configured."
    today = datetime.today()
    upcoming = []
    for b in bills:
        try:
            due = today.replace(day=b.due_day)
        except ValueError:
            continue
        if due < today:
            if today.month == 12:
                due = due.replace(year=today.year + 1, month=1)
            else:
                due = due.replace(month=today.month + 1)
        days_until = (due.date() - today.date()).days
        if days_until <= days_ahead:
            upcoming.append(
                f"{b.name}: due {due.strftime('%b %d')} "
                f"(in {days_until} day{'s' if days_until != 1 else ''}) "
                f"— ${b.amount:.2f}"
            )
    return "\n".join(upcoming) if upcoming else f"No bills due in the next {days_ahead} days."


@tool
def add_bill(name: str, due_day: int, amount: float) -> str:
    """Add a recurring monthly bill. due_day is the day of month (1–28)."""
    uid = _uid()
    with db_session() as db:
        db.add(Bill(user_id=uid, name=name, due_day=due_day, amount=amount, is_recurring=True))
        db.commit()
    return f"Bill added: {name} — ${amount:.2f} due on the {due_day} of each month"


@tool
def get_monthly_summary(month: str = "") -> str:
    """Full financial summary for a month."""
    uid = _uid()
    target = month if month else datetime.today().strftime("%Y-%m")
    with db_session() as db:
        rows = db.query(Expense).filter(
            Expense.user_id == uid,   # ← scoped
            Expense.date.startswith(target),
        ).all()
    if not rows:
        return f"No expenses recorded for {target}."
    total = sum(r.amount for r in rows)
    by_cat: dict = {}
    for r in rows:
        by_cat.setdefault(r.category, [])
        by_cat[r.category].append(r.amount)
    lines = [f"Summary for {target}", f"Total: ${total:.2f}", ""]
    for cat, amounts in sorted(by_cat.items(), key=lambda x: -sum(x[1])):
        lines.append(f"  {cat}: ${sum(amounts):.2f} ({len(amounts)} items)")
    top3 = sorted(rows, key=lambda r: -r.amount)[:3]
    lines.append("\nTop 3 expenses:")
    for r in top3:
        lines.append(f"  {r.description} — ${r.amount:.2f} ({r.date})")
    return "\n".join(lines)