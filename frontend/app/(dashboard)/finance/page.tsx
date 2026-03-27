"use client";
import { useDashboard } from "@/hooks/useDashboard";

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: "#1a1a1a" }}
    />
  );
}

const CATEGORY_BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  food:       { bg: "#1f0800", color: "#f97316" },
  transport:  { bg: "#0d1f3c", color: "#60a5fa" },
  utilities:  { bg: "#1a1040", color: "#a78bfa" },
  health:     { bg: "#0d2818", color: "#4ade80" },
  shopping:   { bg: "#1f0d1a", color: "#f472b6" },
  other:      { bg: "#1a1a1a", color: "#888" },
};

function categoryBadgeStyle(cat: string): { bg: string; color: string } {
  return CATEGORY_BADGE_STYLES[cat.toLowerCase()] ?? CATEGORY_BADGE_STYLES.other;
}

export default function FinancePage() {
  const { data, loading, error, reload } = useDashboard();

  const overBudget = data?.finance.budget_health.filter((b) => b.status === "over").length ?? 0;

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
        <p className="text-[14px]" style={{ color: "#888" }}>{error}</p>
        <button
          onClick={reload}
          className="text-[13px] font-medium hover:opacity-70 transition-opacity"
          style={{ color: "#c9a84c" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#0a0a0a" }}>
      <div className="min-h-full p-6 lg:p-8 max-w-4xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-6">
          <h1 className="text-[20px] font-semibold" style={{ color: "#e5e5e5" }}>Finance</h1>
          <p className="text-[13px] mt-1" style={{ color: "#555" }}>
            {data?.finance.month ?? "This month"}
          </p>
        </div>

        {/* ── Stat Row ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          {loading ? (
            <>
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
              <Skeleton className="h-24" />
            </>
          ) : (
            <>
              <div
                className="rounded-2xl p-5"
                style={{ background: "#111111", border: "1px solid #1f1f1f" }}
              >
                <p
                  className="uppercase tracking-widest font-medium"
                  style={{ fontSize: "10px", color: "#555" }}
                >
                  Total Spent
                </p>
                <p className="text-[24px] font-semibold mt-1.5" style={{ color: "#e5e5e5" }}>
                  {fmtCurrency(data?.finance.total_spent ?? 0)}
                </p>
              </div>
              <div
                className="rounded-2xl p-5"
                style={{ background: "#111111", border: "1px solid #1f1f1f" }}
              >
                <p
                  className="uppercase tracking-widest font-medium"
                  style={{ fontSize: "10px", color: "#555" }}
                >
                  Total Budget
                </p>
                <p className="text-[24px] font-semibold mt-1.5" style={{ color: "#e5e5e5" }}>
                  {fmtCurrency(data?.finance.total_budget ?? 0)}
                </p>
              </div>
              <div
                className="rounded-2xl p-5"
                style={{ background: "#111111", border: "1px solid #1f1f1f" }}
              >
                <p
                  className="uppercase tracking-widest font-medium"
                  style={{ fontSize: "10px", color: "#555" }}
                >
                  Remaining
                </p>
                <p
                  className="text-[24px] font-semibold mt-1.5"
                  style={{
                    color: (data?.finance.remaining ?? 0) < 0 ? "#ef4444" : "#e5e5e5",
                  }}
                >
                  {fmtCurrency(data?.finance.remaining ?? 0)}
                </p>
              </div>
              <div
                className="rounded-2xl p-5"
                style={{ background: "#111111", border: "1px solid #1f1f1f" }}
              >
                <p
                  className="uppercase tracking-widest font-medium"
                  style={{ fontSize: "10px", color: "#555" }}
                >
                  Over Budget
                </p>
                <p
                  className="text-[24px] font-semibold mt-1.5"
                  style={{ color: overBudget > 0 ? "#ef4444" : "#e5e5e5" }}
                >
                  {overBudget}
                </p>
                <p className="text-[11px] mt-1" style={{ color: "#444" }}>categories</p>
              </div>
            </>
          )}
        </div>

        {/* ── Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* Category Breakdown */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "#111111", border: "1px solid #1f1f1f" }}
          >
            <p
              className="uppercase tracking-widest font-medium mb-4"
              style={{ fontSize: "11px", color: "#555" }}
            >
              Category Breakdown
            </p>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
                <Skeleton className="h-4" />
              </div>
            ) : (data?.finance.budget_health.length ?? 0) === 0 ? (
              <p className="text-[13px]" style={{ color: "#444" }}>
                No budgets set. Ask the assistant to set one.
              </p>
            ) : (
              <div className="space-y-4">
                {data?.finance.budget_health.map((b) => {
                  const barColor =
                    b.status === "over" ? "#ef4444" :
                    b.status === "warning" ? "#f59e0b" :
                    "#22c55e";
                  return (
                    <div key={b.category}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[12px] capitalize" style={{ color: "#bbb" }}>{b.category}</span>
                        <span className="text-[12px]" style={{ color: "#555" }}>
                          {fmtCurrency(b.spent)} / {fmtCurrency(b.limit)}
                        </span>
                      </div>
                      <div
                        className="h-[5px] rounded-full overflow-hidden"
                        style={{ background: "#1f1f1f" }}
                      >
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min(b.pct, 100)}%`, background: barColor }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recent Expenses */}
          <div
            className="rounded-2xl p-5"
            style={{ background: "#111111", border: "1px solid #1f1f1f" }}
          >
            <p
              className="uppercase tracking-widest font-medium mb-4"
              style={{ fontSize: "11px", color: "#555" }}
            >
              Recent Expenses
            </p>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
                <Skeleton className="h-10" />
              </div>
            ) : (data?.finance.recent_expenses.length ?? 0) === 0 ? (
              <p className="text-[13px]" style={{ color: "#444" }}>No expenses logged this month.</p>
            ) : (
              <ul>
                {data?.finance.recent_expenses.map((e, i) => {
                  const badge = categoryBadgeStyle(e.category);
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between py-2.5"
                      style={i > 0 ? { borderTop: "1px solid #1f1f1f" } : {}}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {e.category}
                        </span>
                        <span className="text-[12px] truncate" style={{ color: "#bbb" }}>
                          {e.description}
                        </span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-[13px] font-medium" style={{ color: "#e5e5e5" }}>
                          {fmtCurrency(e.amount)}
                        </p>
                        <p className="text-[10px]" style={{ color: "#444" }}>{e.date}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

        {/* ── Upcoming Bills ── */}
        {(data?.bills_upcoming.length ?? 0) > 0 && (
          <div
            className="rounded-2xl p-5"
            style={{ background: "#111111", border: "1px solid #1f1f1f" }}
          >
            <p
              className="uppercase tracking-widest font-medium mb-4"
              style={{ fontSize: "11px", color: "#555" }}
            >
              Upcoming Bills
            </p>
            <div>
              {data?.bills_upcoming.map((b, i) => {
                const urgency =
                  b.days_until <= 2
                    ? { bg: "#ef444415", color: "#ef4444" }
                    : b.days_until <= 7
                    ? { bg: "#f59e0b15", color: "#f59e0b" }
                    : { bg: "#22c55e15", color: "#22c55e" };
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3"
                    style={i > 0 ? { borderTop: "1px solid #1f1f1f" } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: urgency.bg, color: urgency.color }}
                      >
                        {b.days_until === 0 ? "Today" : b.days_until === 1 ? "Tomorrow" : `${b.days_until}d`}
                      </span>
                      <span className="text-[13px] font-medium" style={{ color: "#e5e5e5" }}>{b.name}</span>
                      <span className="text-[11px]" style={{ color: "#444" }}>{b.due_date}</span>
                    </div>
                    <span className="text-[13px] font-semibold" style={{ color: "#c9a84c" }}>
                      {fmtCurrency(b.amount)}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
