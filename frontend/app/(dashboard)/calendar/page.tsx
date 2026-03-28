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
        <p style={{ color: "#0A0E27", fontSize: 12, fontWeight: 500, fontFamily: "system-ui" }}>{fmtTime(event.start_time)}</p>
        <p style={{ color: "#9CA3AF", fontSize: 10, fontFamily: "system-ui" }}>{fmtTime(event.end_time)}</p>
      </div>
      <div
        className="w-0.5 self-stretch rounded-full shrink-0"
        style={{ background: "#C9A84C", opacity: 0.4 }}
      />
      <div className="flex-1 min-w-0">
        <p style={{ color: "#0A0E27", fontSize: 13, fontWeight: 500, fontFamily: "system-ui" }}>{event.title}</p>
        {event.location && (
          <p style={{ color: "#9CA3AF", fontSize: 11, fontFamily: "system-ui" }} className="truncate mt-0.5">
            {event.location}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1">
          {event.attendee_count > 0 && (
            <span
              style={{ background: "rgba(10,14,39,0.06)", color: "#6B7280", fontSize: 11, fontFamily: "system-ui" }}
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
              style={{ color: "#C9A84C", fontSize: 11, fontFamily: "system-ui" }}
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
      style={{ background: "#F0F2F8" }}
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
    <div className="h-full overflow-y-auto" style={{ background: "#F0F2F8" }}>
      <div className="min-h-full p-6 lg:p-8 max-w-3xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6">
          <h1
            style={{
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
              fontSize: 22,
              color: "#0A0E27",
              fontWeight: 400,
            }}
          >
            Calendar
          </h1>
          <p
            className="mt-1 uppercase tracking-widest"
            style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "system-ui" }}
          >
            Upcoming 7 days
          </p>
          <div style={{ width: 40, height: 1.5, background: "#C9A84C", marginTop: 6 }} />
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
                style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, fontFamily: "system-ui" }}
              >
                Today
              </p>
              <div
                className="rounded-xl px-4 py-1"
                style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
              >
                {todayEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 gap-2">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v2M16 2v2"/>
                    </svg>
                    <p style={{ color: "#6B7280", fontSize: 13, fontFamily: "system-ui" }}>No events today</p>
                  </div>
                ) : (
                  <div>
                    {todayEvents.map((e, i) => (
                      <div
                        key={e.id}
                        style={i > 0 ? { borderTop: "0.5px solid #F3F4F6" } : {}}
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
                  style={{ fontSize: 10, color: "#9CA3AF", fontWeight: 600, fontFamily: "system-ui" }}
                >
                  Upcoming
                </p>
                <div className="space-y-3">
                  {grouped.map(([dateKey, dayEvents]) => (
                    <div
                      key={dateKey}
                      className="rounded-xl px-4 py-1"
                      style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
                    >
                      <div
                        className="pt-3 pb-2"
                        style={{ borderBottom: "0.5px solid rgba(10,14,39,0.06)" }}
                      >
                        <p
                          style={{
                            fontSize: 12,
                            color: "#0A0E27",
                            fontFamily: "Georgia,serif",
                            fontWeight: 400,
                          }}
                        >
                          {fmtDateLabel(dayEvents[0].start_time)}
                        </p>
                      </div>
                      <div>
                        {dayEvents.map((e, i) => (
                          <div
                            key={e.id}
                            style={i > 0 ? { borderTop: "0.5px solid #F3F4F6" } : {}}
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
                  style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M3 10h18M8 2v2M16 2v2"/>
                  </svg>
                </div>
                <p style={{ color: "#6B7280", fontSize: 14, fontFamily: "system-ui" }}>No events in the next 7 days</p>
              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
