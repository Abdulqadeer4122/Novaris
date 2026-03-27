"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

interface CalendarEvent {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  attendee_count: number;
  meet_link: string | null;
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtDateLabel(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === tomorrow.toDateString()) return "Tomorrow";
  return d.toLocaleDateString([], { weekday: "long", month: "short", day: "numeric" });
}

function groupByDate(events: CalendarEvent[]): [string, CalendarEvent[]][] {
  const map = new Map<string, CalendarEvent[]>();
  for (const e of events) {
    const key = new Date(e.start_time).toDateString();
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(e);
  }
  return Array.from(map.entries());
}

function EventCard({ event }: { event: CalendarEvent }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <div className="w-12 shrink-0 text-right">
        <p style={{ color: "#bbb", fontSize: "12px", fontWeight: 500 }}>{fmtTime(event.start_time)}</p>
        <p style={{ color: "#444", fontSize: "10px" }}>{fmtTime(event.end_time)}</p>
      </div>
      <div
        className="w-0.5 self-stretch rounded-full shrink-0"
        style={{ background: "#c9a84c", opacity: 0.4 }}
      />
      <div className="flex-1 min-w-0">
        <p style={{ color: "#e5e5e5", fontSize: "13px", fontWeight: 500 }}>{event.title}</p>
        {event.location && (
          <p style={{ color: "#555", fontSize: "11px" }} className="truncate mt-0.5">
            {event.location}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {event.attendee_count > 0 && (
            <span
              style={{ background: "#1a1a1a", color: "#555", fontSize: "11px" }}
              className="px-2 py-0.5 rounded-full"
            >
              {event.attendee_count} attendee{event.attendee_count !== 1 ? "s" : ""}
            </span>
          )}
          {event.meet_link && (
            <a
              href={event.meet_link}
              target="_blank"
              rel="noreferrer"
              style={{ color: "#c9a84c", fontSize: "11px" }}
              className="hover:opacity-70 transition-opacity"
            >
              Join meeting →
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function Skeleton() {
  return (
    <div
      className="rounded-2xl animate-pulse h-20"
      style={{ background: "#1a1a1a" }}
    />
  );
}

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API}/dashboard/calendar`, { headers: authHeaders() as HeadersInit })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then(setEvents)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const today = new Date().toDateString();
  const todayEvents = events.filter((e) => new Date(e.start_time).toDateString() === today);
  const upcomingEvents = events.filter((e) => new Date(e.start_time).toDateString() !== today);
  const grouped = groupByDate(upcomingEvents);

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0a0a0a" }}>
      <div className="min-h-full p-6 lg:p-8 max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold" style={{ color: "#e5e5e5" }}>Calendar</h1>
          <p className="text-[13px] mt-1" style={{ color: "#555" }}>Upcoming 7 days</p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Skeleton />
            <Skeleton />
            <Skeleton />
          </div>
        ) : (
          <>
            {/* ── Today ── */}
            <div className="mb-5">
              <p
                className="uppercase tracking-widest mb-3"
                style={{ fontSize: "10px", color: "#555", fontWeight: 500 }}
              >
                Today
              </p>
              <div
                className="rounded-2xl px-4 py-1"
                style={{ background: "#111111", border: "1px solid #1f1f1f" }}
              >
                {todayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v2M16 2v2"/>
                    </svg>
                    <p style={{ color: "#444", fontSize: "13px" }}>No events today</p>
                  </div>
                ) : (
                  <div>
                    {todayEvents.map((e, i) => (
                      <div
                        key={e.id}
                        style={i > 0 ? { borderTop: "1px solid #1f1f1f" } : {}}
                      >
                        <EventCard event={e} />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* ── Upcoming ── */}
            {grouped.length > 0 && (
              <div>
                <p
                  className="uppercase tracking-widest mb-3"
                  style={{ fontSize: "10px", color: "#555", fontWeight: 500 }}
                >
                  Upcoming
                </p>
                <div className="space-y-3">
                  {grouped.map(([dateKey, dayEvents]) => (
                    <div
                      key={dateKey}
                      className="rounded-2xl px-4 py-1"
                      style={{ background: "#111111", border: "1px solid #1f1f1f" }}
                    >
                      <div
                        className="pt-3 pb-2"
                        style={{ borderBottom: "1px solid #1f1f1f" }}
                      >
                        <p style={{ fontSize: "12px", color: "#888", fontWeight: 500 }}>
                          {fmtDateLabel(dayEvents[0].start_time)}
                        </p>
                      </div>
                      <div>
                        {dayEvents.map((e, i) => (
                          <div
                            key={e.id}
                            style={i > 0 ? { borderTop: "1px solid #1f1f1f" } : {}}
                          >
                            <EventCard event={e} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── All empty ── */}
            {todayEvents.length === 0 && grouped.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: "#111111", border: "1px solid #1f1f1f" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v2M16 2v2"/>
                  </svg>
                </div>
                <p style={{ color: "#444", fontSize: "14px" }}>No events in the next 7 days</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
