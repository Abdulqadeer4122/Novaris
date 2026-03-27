import logging
from typing import Optional

from sqlalchemy.dialects.postgresql import insert

from database import db_session
from models import HitlPending

log = logging.getLogger("assistant.hitl")


class PgHitlStore:
    """Postgres-backed store for pending HITL interrupts."""

    def set(self, interrupt_id: str, thread_id: str) -> None:
        with db_session() as db:
            stmt = (
                insert(HitlPending)
                .values(interrupt_id=interrupt_id, thread_id=thread_id)
                .on_conflict_do_update(
                    index_elements=["interrupt_id"],
                    set_={"thread_id": thread_id},
                )
            )
            db.execute(stmt)
            db.commit()
        log.debug("HITL set interrupt_id=%s thread_id=%s", interrupt_id, thread_id)

    def pop(self, interrupt_id: str) -> Optional[str]:
        """Delete the record and return its thread_id, or None if not found."""
        with db_session() as db:
            record = db.get(HitlPending, interrupt_id)
            if record is None:
                log.warning("HITL pop: unknown interrupt_id=%s", interrupt_id)
                return None
            thread_id = record.thread_id
            db.delete(record)
            db.commit()
        log.debug("HITL popped interrupt_id=%s", interrupt_id)
        return thread_id

    def keys(self) -> list[str]:
        with db_session() as db:
            return [r.interrupt_id for r in db.query(HitlPending).all()]
