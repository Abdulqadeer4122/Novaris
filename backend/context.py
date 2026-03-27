"""
Request-scoped context variables.

Set `current_user_id` in each request handler before invoking the agent.
Tools read it via get_credentials(), which routes to the right user's credentials.
"""
from contextvars import ContextVar

current_user_id: ContextVar[int] = ContextVar("current_user_id")
