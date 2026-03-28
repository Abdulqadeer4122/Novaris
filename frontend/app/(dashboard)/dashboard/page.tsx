"use client";
import { useAuth } from "@/hooks/useAuth";
import { useDashboard, type BudgetHealth, type EventItem, type BillItem, type EmailItem } from "@/hooks/useDashboard";
import Link from "next/link";

// ── Helpers ──────────────────────────────────────────────────────────────────

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function fmtRelativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString([], { month: "short", day: "numeric" });
}

// ── Skeleton ──────────────────────────────────────────────────────────────────

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl ${className}`}
      style={{ background: "#F0F2F8" }}
    />
  );
}

// ── Stat Cards ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string;
  sub?: string;
  icon: React.ReactNode;
  iconBg: string;
  iconColor: string;
  trend?: { label: string; positive: boolean };
  topAccent?: boolean;
}

function StatCard({ label, value, sub, icon, iconBg, iconColor, trend, topAccent }: StatCardProps) {
  return (
    <div
      className="rounded-xl p-4 transition-shadow hover:shadow-sm"
      style={{
        background: "#FFFFFF",
        border: "0.5px solid rgba(10,14,39,0.08)",
        borderRadius: 10,
        borderTop: topAccent ? "2px solid #C9A84C" : undefined,
      }}
    >
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: iconBg, color: iconColor }}
        >
          {icon}
        </div>
        {trend && (
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded-full"
            style={
              trend.positive
                ? { background: "rgba(22,101,52,0.08)", color: "#166534" }
                : { background: "rgba(180,83,9,0.1)", color: "#B45309" }
            }
          >
            {trend.label}
          </span>
        )}
      </div>
      <p
        className="text-[24px] tracking-tight"
        style={{ color: "#0A0E27", fontFamily: "Georgia,serif", fontWeight: 400 }}
      >
        {value}
      </p>
      <p
        className="text-[10px] font-semibold mt-0.5 uppercase tracking-widest"
        style={{ color: "#9CA3AF", fontFamily: "system-ui" }}
      >
        {label}
      </p>
      {sub && (
        <p className="text-[10px] mt-1" style={{ color: "#9CA3AF", fontFamily: "system-ui" }}>{sub}</p>
      )}
    </div>
  );
}

// ── Budget Bar ────────────────────────────────────────────────────────────────

function BudgetBar({ item }: { item: BudgetHealth }) {
  const barColor =
    item.pct >= 80 ? "#C9A84C" :
    item.pct >= 50 ? "#6B7280" :
    "#0A0E27";

  const pctColor = item.pct >= 80 ? "#B45309" : "#9CA3AF";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium capitalize" style={{ color: "#0A0E27" }}>{item.category}</span>
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: "#6B7280" }}>{fmtCurrency(item.spent)}</span>
          <span className="text-[11px]" style={{ color: "#9CA3AF" }}>/</span>
          <span className="text-[12px]" style={{ color: "#6B7280" }}>{fmtCurrency(item.limit)}</span>
          <span className="text-[11px] font-semibold w-9 text-right" style={{ color: pctColor }}>{item.pct}%</span>
        </div>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "#F3F4F6" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(item.pct, 100)}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

// ── Event Row ─────────────────────────────────────────────────────────────────

function EventRow({ event, index }: { event: EventItem; index: number }) {
  const dotColors = ["#0A0E27", "#C9A84C", "#6B7280"];
  const dotColor = dotColors[index % dotColors.length];

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex flex-col items-end gap-1 w-12 shrink-0">
        <span className="text-[12px] font-semibold" style={{ color: "#0A0E27" }}>{fmtTime(event.start_time)}</span>
        <span className="text-[10px]" style={{ color: "#9CA3AF" }}>{fmtTime(event.end_time)}</span>
      </div>
      <div
        className="w-0.5 self-stretch rounded-full mt-1 shrink-0"
        style={{ background: dotColor, opacity: 0.5 }}
      />
      <div className="flex-1 min-w-0 pb-1">
        <p className="text-[13px] font-medium truncate" style={{ color: "#0A0E27" }}>{event.title}</p>
        {event.location && (
          <p className="text-[11px] truncate mt-0.5" style={{ color: "#9CA3AF" }}>{event.location}</p>
        )}
        {event.meet_link && (
          <a
            href={event.meet_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-0.5 hover:opacity-70 transition-opacity"
            style={{ color: "#C9A84C", fontSize: "11px" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M6.5 1H9v2.5M9 1 5.5 4.5M4 2H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            </svg>
            Join meeting
          </a>
        )}
        {event.attendee_count > 1 && (
          <span className="text-[11px] mt-0.5 block" style={{ color: "#9CA3AF" }}>{event.attendee_count} attendees</span>
        )}
      </div>
    </div>
  );
}

// ── Email Row ─────────────────────────────────────────────────────────────────

function EmailRow({ email }: { email: EmailItem }) {
  const displayName = email.sender_name ?? email.sender_email;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
        style={{ background: "rgba(10,14,39,0.07)", color: "#0A0E27" }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {email.is_unread && (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#C9A84C" }} />
            )}
            <span
              className="text-[12px] truncate"
              style={{
                color: "#0A0E27",
                fontWeight: email.is_unread ? 600 : 500,
              }}
            >
              {displayName}
            </span>
          </div>
          <span className="text-[10px] shrink-0" style={{ color: "#9CA3AF" }}>{fmtRelativeTime(email.received_at)}</span>
        </div>
        <p
          className="text-[11px] truncate mt-0.5"
          style={{ color: "#6B7280" }}
        >
          {email.subject}
        </p>
      </div>
    </div>
  );
}

// ── Bill Row ──────────────────────────────────────────────────────────────────

function BillRow({ bill }: { bill: BillItem }) {
  const urgency =
    bill.days_until <= 2
      ? { pillBg: "rgba(180,83,9,0.1)", pillColor: "#B45309" }
      : bill.days_until <= 7
      ? { pillBg: "rgba(180,83,9,0.08)", pillColor: "#B45309" }
      : { pillBg: "rgba(22,101,52,0.08)", pillColor: "#166534" };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <span className="text-[12px] font-medium" style={{ color: "#0A0E27" }}>{bill.name}</span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: urgency.pillBg, color: urgency.pillColor }}
        >
          {bill.days_until === 0 ? "Today" : bill.days_until === 1 ? "Tomorrow" : `${bill.days_until}d`}
        </span>
      </div>
      <span className="text-[12px] font-semibold" style={{ color: "#0A0E27" }}>{fmtCurrency(bill.amount)}</span>
    </div>
  );
}

// ── Card Shell ────────────────────────────────────────────────────────────────

function Card({ title, href, children, className = "" }: {
  title: string;
  href?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`${className}`}
      style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)", borderRadius: 12 }}
    >
      <div className="flex items-center gap-3 px-5 pt-5 pb-0">
        <h3
          className="text-[10px] font-bold uppercase tracking-widest shrink-0"
          style={{ color: "#9CA3AF", fontFamily: "system-ui" }}
        >
          {title}
        </h3>
        <div style={{ flex: 1, height: "0.5px", background: "rgba(201,168,76,0.3)" }} />
        {href && (
          <Link
            href={href}
            className="text-[12px] font-medium hover:opacity-70 transition-opacity shrink-0"
            style={{ color: "#C9A84C" }}
          >
            View all
          </Link>
        )}
      </div>
      <div className="px-5 pb-5">{children}</div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, reload } = useDashboard();

  const today = new Date().toLocaleDateString([], {
    weekday: "long", month: "long", day: "numeric",
  });

  const unreadCount = data?.emails.filter((e) => e.is_unread).length ?? 0;
  const spentPct = data
    ? Math.round((data.finance.total_spent / (data.finance.total_budget || 1)) * 100)
    : 0;

  if (error) {
    return (
      <div className="h-full overflow-y-auto flex flex-col items-center justify-center gap-3" style={{ background: "#F0F2F8" }}>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "rgba(153,27,27,0.08)" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#991B1B" strokeWidth="1.5">
            <circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14h.01"/>
          </svg>
        </div>
        <p className="text-[14px]" style={{ color: "#6B7280" }}>Failed to load dashboard</p>
        <button
          onClick={reload}
          className="text-[13px] font-medium hover:opacity-70 transition-opacity"
          style={{ color: "#C9A84C" }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#F0F2F8" }}>
      <div className="min-h-full p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1
              style={{
                fontFamily: "Georgia,serif",
                fontWeight: 400,
                fontSize: 22,
                color: "#0A0E27",
              }}
            >
              {greeting()}, {user?.full_name?.split(" ")[0] ?? "there"}
            </h1>
            <p
              className="mt-1 uppercase tracking-widest"
              style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "system-ui" }}
            >
              {today}
            </p>
            <div style={{ width: 40, height: 1.5, background: "#C9A84C", marginTop: 8 }} />
          </div>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-medium" style={{ color: "#6B7280" }}>Live</span>
          </div>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {loading ? (
            <>
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </>
          ) : (
            <>
              <StatCard
                label="Spent this month"
                value={fmtCurrency(data?.finance.total_spent ?? 0)}
                sub={`${spentPct}% of ${fmtCurrency(data?.finance.total_budget ?? 0)} budget`}
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="2" y="4" width="14" height="11" rx="2"/>
                    <path d="M2 8h14M6 2v2M12 2v2"/>
                  </svg>
                }
                iconBg="rgba(201,168,76,0.1)"
                iconColor="#C9A84C"
                trend={spentPct >= 100 ? { label: "Over budget", positive: false } : spentPct >= 80 ? { label: "Near limit", positive: false } : undefined}
                topAccent
              />
              <StatCard
                label="Unread emails"
                value={String(unreadCount)}
                sub="today"
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="2" y="3" width="14" height="12" rx="2"/>
                    <path d="M2 6l7 5 7-5"/>
                  </svg>
                }
                iconBg="rgba(10,14,39,0.06)"
                iconColor="#0A0E27"
                trend={unreadCount > 0 ? { label: `${unreadCount} new`, positive: true } : undefined}
              />
              <StatCard
                label="Events today"
                value={String(data?.events_today.length ?? 0)}
                sub={data?.events_today.length ? `Next: ${fmtTime(data.events_today[0].start_time)}` : "Free day"}
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <rect x="2" y="3" width="14" height="13" rx="2"/>
                    <path d="M2 8h14M6 1v3M12 1v3"/>
                  </svg>
                }
                iconBg="rgba(10,14,39,0.06)"
                iconColor="#0A0E27"
              />
              <StatCard
                label="Bills due soon"
                value={String(data?.bills_upcoming.length ?? 0)}
                sub="within 10 days"
                icon={
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6">
                    <path d="M9 2v4M9 12v4M4.2 4.2l2.8 2.8M11 11l2.8 2.8M2 9h4M12 9h4M4.2 13.8l2.8-2.8M11 7l2.8-2.8"/>
                  </svg>
                }
                iconBg="rgba(180,83,9,0.08)"
                iconColor="#B45309"
                trend={
                  (data?.bills_upcoming.some((b) => b.days_until <= 2))
                    ? { label: "Urgent", positive: false }
                    : undefined
                }
              />
            </>
          )}
        </div>

        {/* ── Middle Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Budget Health — spans 2 cols */}
          <Card title="Budget Health" href="/finance" className="lg:col-span-2">
            {loading ? (
              <div className="space-y-4 mt-4">
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
                <Skeleton className="h-6" />
              </div>
            ) : !data?.finance.budget_health.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: "#F0F2F8" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M2 7h12"/>
                  </svg>
                </div>
                <p className="text-[13px]" style={{ color: "#6B7280" }}>No budgets set yet</p>
                <p className="text-[12px] mt-1" style={{ color: "#9CA3AF" }}>Ask the assistant to set one</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {data.finance.budget_health.map((b) => (
                  <BudgetBar key={b.category} item={b} />
                ))}
                <div className="pt-2 flex items-center justify-between" style={{ borderTop: "0.5px solid #F3F4F6" }}>
                  <span className="text-[12px]" style={{ color: "#6B7280" }}>Total remaining</span>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: (data.finance.remaining ?? 0) < 0 ? "#991B1B" : "#166534" }}
                  >
                    {fmtCurrency(data.finance.remaining ?? 0)}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Today's Schedule */}
          <Card title="Today's Schedule" href="/calendar">
            {loading ? (
              <div className="space-y-3 mt-3">
                <Skeleton className="h-14" />
                <Skeleton className="h-14" />
              </div>
            ) : !data?.events_today.length ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: "#F0F2F8" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
                    <rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 7h12M5 1v2M11 1v2"/>
                  </svg>
                </div>
                <p className="text-[13px]" style={{ color: "#6B7280" }}>No events today</p>
              </div>
            ) : (
              <div className="mt-1">
                {data.events_today.map((e, i) => (
                  <div key={e.id} style={i > 0 ? { borderTop: "0.5px solid #F3F4F6" } : {}}>
                    <EventRow event={e} index={i} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

          {/* Recent Emails */}
          <Card title="Recent Emails" href="/inbox">
            {loading ? (
              <div className="space-y-3 mt-3">
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
                <Skeleton className="h-12" />
              </div>
            ) : !data?.emails.length ? (
              <p className="text-[13px] py-6 text-center" style={{ color: "#6B7280" }}>No emails today</p>
            ) : (
              <div className="mt-1">
                {data.emails.slice(0, 4).map((e, i) => (
                  <div key={e.id} style={i > 0 ? { borderTop: "0.5px solid #F3F4F6" } : {}}>
                    <EmailRow email={e} />
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Upcoming Bills */}
          <Card title="Upcoming Bills" href="/finance">
            {loading ? (
              <div className="space-y-3 mt-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : !data?.bills_upcoming.length ? (
              <p className="text-[13px] py-6 text-center" style={{ color: "#6B7280" }}>No bills due soon</p>
            ) : (
              <div className="mt-1">
                {data.bills_upcoming.map((b, i) => (
                  <div key={i} style={i > 0 ? { borderTop: "0.5px solid #F3F4F6" } : {}}>
                    <BillRow bill={b} />
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        </div>
      </div>
    </div>
  );
}
