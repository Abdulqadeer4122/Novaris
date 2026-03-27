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
      style={{ background: "#1a1a1a" }}
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
}

function StatCard({ label, value, sub, icon, iconBg, iconColor, trend }: StatCardProps) {
  return (
    <div
      className="rounded-2xl p-5 transition-shadow hover:shadow-lg"
      style={{ background: "#111111", border: "1px solid #1f1f1f" }}
    >
      <div className="flex items-start justify-between mb-4">
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
                ? { background: "#22c55e15", color: "#22c55e" }
                : { background: "#ef444415", color: "#ef4444" }
            }
          >
            {trend.label}
          </span>
        )}
      </div>
      <p className="text-[26px] font-semibold tracking-tight" style={{ color: "#e5e5e5" }}>{value}</p>
      <p className="text-[13px] font-medium mt-0.5" style={{ color: "#888" }}>{label}</p>
      {sub && <p className="text-[11px] mt-1" style={{ color: "#4a4a4a" }}>{sub}</p>}
    </div>
  );
}

// ── Budget Bar ────────────────────────────────────────────────────────────────

function BudgetBar({ item }: { item: BudgetHealth }) {
  const barColor =
    item.status === "over" ? "#ef4444" :
    item.status === "warning" ? "#f59e0b" :
    "#22c55e";

  const pctColor =
    item.status === "over" ? "#ef4444" :
    item.status === "warning" ? "#f59e0b" :
    "#22c55e";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium capitalize" style={{ color: "#bbb" }}>{item.category}</span>
        <div className="flex items-center gap-2">
          <span className="text-[12px]" style={{ color: "#555" }}>{fmtCurrency(item.spent)}</span>
          <span className="text-[11px]" style={{ color: "#333" }}>/</span>
          <span className="text-[12px]" style={{ color: "#555" }}>{fmtCurrency(item.limit)}</span>
          <span className="text-[11px] font-semibold w-9 text-right" style={{ color: pctColor }}>{item.pct}%</span>
        </div>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "#1f1f1f" }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${Math.min(item.pct, 100)}%`, background: barColor }}
        />
      </div>
    </div>
  );
}

// ── Event Row ─────────────────────────────────────────────────────────────────

const EVENT_DOT_COLORS = ["#a78bfa", "#60a5fa", "#4ade80", "#fbbf24", "#f472b6"];

function EventRow({ event, index }: { event: EventItem; index: number }) {
  const dotColor = EVENT_DOT_COLORS[index % EVENT_DOT_COLORS.length];

  return (
    <div className="flex items-start gap-3 py-3">
      <div className="flex flex-col items-end gap-1 w-12 shrink-0">
        <span className="text-[12px] font-semibold" style={{ color: "#bbb" }}>{fmtTime(event.start_time)}</span>
        <span className="text-[10px]" style={{ color: "#444" }}>{fmtTime(event.end_time)}</span>
      </div>
      <div
        className="w-0.5 self-stretch rounded-full mt-1 shrink-0"
        style={{ background: dotColor, opacity: 0.4 }}
      />
      <div className="flex-1 min-w-0 pb-1">
        <p className="text-[13px] font-medium truncate" style={{ color: "#e5e5e5" }}>{event.title}</p>
        {event.location && (
          <p className="text-[11px] truncate mt-0.5" style={{ color: "#555" }}>{event.location}</p>
        )}
        {event.meet_link && (
          <a
            href={event.meet_link}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 mt-0.5 hover:opacity-70 transition-opacity"
            style={{ color: "#c9a84c", fontSize: "11px" }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
              <path d="M6.5 1H9v2.5M9 1 5.5 4.5M4 2H2a1 1 0 0 0-1 1v5a1 1 0 0 0 1 1h5a1 1 0 0 0 1-1V6" stroke="currentColor" strokeWidth="1.2" fill="none" strokeLinecap="round"/>
            </svg>
            Join meeting
          </a>
        )}
        {event.attendee_count > 1 && (
          <span className="text-[11px] mt-0.5 block" style={{ color: "#555" }}>{event.attendee_count} attendees</span>
        )}
      </div>
    </div>
  );
}

// ── Email Row ─────────────────────────────────────────────────────────────────

const AVATAR_PALETTES = [
  { bg: "#1a1040", color: "#a78bfa" },
  { bg: "#0d1f3c", color: "#60a5fa" },
  { bg: "#0d2818", color: "#4ade80" },
  { bg: "#1f1500", color: "#fbbf24" },
  { bg: "#1f0d1a", color: "#f472b6" },
  { bg: "#0d1f1f", color: "#22d3ee" },
];

function avatarPalette(name: string) {
  return AVATAR_PALETTES[name.charCodeAt(0) % AVATAR_PALETTES.length];
}

function EmailRow({ email }: { email: EmailItem }) {
  const displayName = email.sender_name ?? email.sender_email;
  const initials = displayName.slice(0, 2).toUpperCase();
  const palette = avatarPalette(displayName);

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold shrink-0"
        style={{ background: palette.bg, color: palette.color }}
      >
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {email.is_unread && (
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: "#c9a84c" }} />
            )}
            <span
              className="text-[13px] truncate"
              style={{
                color: email.is_unread ? "#e5e5e5" : "#666",
                fontWeight: email.is_unread ? 600 : 500,
              }}
            >
              {displayName}
            </span>
          </div>
          <span className="text-[11px] shrink-0" style={{ color: "#444" }}>{fmtRelativeTime(email.received_at)}</span>
        </div>
        <p
          className="text-[12px] truncate mt-0.5"
          style={{ color: email.is_unread ? "#bbb" : "#555" }}
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
      ? { pillBg: "#ef444415", pillColor: "#ef4444", dotColor: "#ef4444" }
      : bill.days_until <= 7
      ? { pillBg: "#f59e0b15", pillColor: "#f59e0b", dotColor: "#f59e0b" }
      : { pillBg: "#22c55e15", pillColor: "#22c55e", dotColor: "#22c55e" };

  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: urgency.dotColor }} />
        <span className="text-[13px] font-medium" style={{ color: "#e5e5e5" }}>{bill.name}</span>
        <span
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
          style={{ background: urgency.pillBg, color: urgency.pillColor }}
        >
          {bill.days_until === 0 ? "Today" : bill.days_until === 1 ? "Tomorrow" : `${bill.days_until}d`}
        </span>
      </div>
      <span className="text-[14px] font-semibold" style={{ color: "#e5e5e5" }}>{fmtCurrency(bill.amount)}</span>
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
      className={`rounded-2xl ${className}`}
      style={{ background: "#111111", border: "1px solid #1f1f1f" }}
    >
      <div className="flex items-center justify-between px-5 pt-5 pb-0">
        <h3 className="text-[13px] font-semibold" style={{ color: "#888" }}>{title}</h3>
        {href && (
          <Link
            href={href}
            className="text-[12px] font-medium hover:opacity-70 transition-opacity"
            style={{ color: "#c9a84c" }}
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
      <div className="h-full overflow-y-auto flex flex-col items-center justify-center gap-3" style={{ background: "#0a0a0a" }}>
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: "#ef444415" }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="#ef4444" strokeWidth="1.5">
            <circle cx="10" cy="10" r="8"/><path d="M10 6v4M10 14h.01"/>
          </svg>
        </div>
        <p className="text-[14px]" style={{ color: "#888" }}>Failed to load dashboard</p>
        <button
          onClick={reload}
          className="text-[13px] font-medium hover:opacity-70 transition-opacity"
          style={{ color: "#c9a84c" }}
        >
          Try again
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0a0a0a" }}>
      <div className="min-h-full p-6 lg:p-8">
        <div className="max-w-6xl mx-auto space-y-6">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-[22px] font-bold tracking-tight" style={{ color: "#e5e5e5" }}>
              {greeting()}, {user?.full_name?.split(" ")[0] ?? "there"} 👋
            </h1>
            <p className="text-[14px] mt-1" style={{ color: "#555" }}>{today}</p>
          </div>
          <div
            className="flex items-center gap-2 rounded-xl px-3 py-2"
            style={{ background: "#111111", border: "1px solid #1f1f1f" }}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[12px] font-medium" style={{ color: "#888" }}>Live</span>
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
                iconBg="#7c3aed20"
                iconColor="#a78bfa"
                trend={spentPct >= 100 ? { label: "Over budget", positive: false } : spentPct >= 80 ? { label: "Near limit", positive: false } : undefined}
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
                iconBg="#1e3a5f"
                iconColor="#60a5fa"
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
                iconBg="#14532d20"
                iconColor="#4ade80"
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
                iconBg="#78350f20"
                iconColor="#fbbf24"
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
                  style={{ background: "#1a1a1a" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#555" strokeWidth="1.5">
                    <rect x="2" y="4" width="12" height="9" rx="1.5"/><path d="M2 7h12"/>
                  </svg>
                </div>
                <p className="text-[13px]" style={{ color: "#555" }}>No budgets set yet</p>
                <p className="text-[12px] mt-1" style={{ color: "#3a3a3a" }}>Ask the assistant to set one</p>
              </div>
            ) : (
              <div className="space-y-4 mt-4">
                {data.finance.budget_health.map((b) => (
                  <BudgetBar key={b.category} item={b} />
                ))}
                <div className="pt-2 flex items-center justify-between" style={{ borderTop: "1px solid #1f1f1f" }}>
                  <span className="text-[12px]" style={{ color: "#555" }}>Total remaining</span>
                  <span
                    className="text-[14px] font-semibold"
                    style={{ color: (data.finance.remaining ?? 0) < 0 ? "#ef4444" : "#22c55e" }}
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
                  style={{ background: "#1a1a1a" }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="#555" strokeWidth="1.5">
                    <rect x="2" y="3" width="12" height="11" rx="1.5"/><path d="M2 7h12M5 1v2M11 1v2"/>
                  </svg>
                </div>
                <p className="text-[13px]" style={{ color: "#555" }}>No events today</p>
              </div>
            ) : (
              <div className="mt-1" style={{ borderColor: "#1f1f1f" }}>
                {data.events_today.map((e, i) => (
                  <div key={e.id} style={i > 0 ? { borderTop: "1px solid #1f1f1f" } : {}}>
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
              <p className="text-[13px] py-6 text-center" style={{ color: "#555" }}>No emails today</p>
            ) : (
              <div className="mt-1">
                {data.emails.slice(0, 4).map((e, i) => (
                  <div key={e.id} style={i > 0 ? { borderTop: "1px solid #1f1f1f" } : {}}>
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
              <p className="text-[13px] py-6 text-center" style={{ color: "#555" }}>No bills due soon</p>
            ) : (
              <div className="mt-1">
                {data.bills_upcoming.map((b, i) => (
                  <div key={i} style={i > 0 ? { borderTop: "1px solid #1f1f1f" } : {}}>
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
