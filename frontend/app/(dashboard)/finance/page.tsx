"use client";
import { useDashboard } from "@/hooks/useDashboard";

function fmtCurrency(n: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg ${className}`}
      style={{ background: "#F0F2F8" }}
    />
  );
}

const CATEGORY_BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  food:       { bg: "rgba(180,83,9,0.08)", color: "#B45309" },
  transport:  { bg: "rgba(10,14,39,0.06)", color: "#0A0E27" },
  utilities:  { bg: "rgba(201,168,76,0.1)", color: "#C9A84C" },
  health:     { bg: "rgba(22,101,52,0.08)", color: "#166534" },
  shopping:   { bg: "rgba(10,14,39,0.06)", color: "#6B7280" },
  other:      { bg: "#F0F2F8", color: "#6B7280" },
};

function categoryBadgeStyle(cat: string): { bg: string; color: string } {
  return CATEGORY_BADGE_STYLES[cat.toLowerCase()] ?? CATEGORY_BADGE_STYLES.other;
}

export default function FinancePage() {
  const { data, loading, error, reload } = useDashboard();

  const overBudget = data?.finance.budget_health.filter((b) => b.status === "over").length ?? 0;

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
        <p className="text-[14px]" style={{ color: "#6B7280" }}>{error}</p>
        <button
          onClick={reload}
          className="text-[13px] font-medium hover:opacity-70 transition-opacity"
          style={{ color: "#C9A84C" }}
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto" style={{ background: "#F0F2F8" }}>
      <div className="min-h-full p-6 lg:p-8 max-w-4xl mx-auto">

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
            Finance
          </h1>
          <p
            className="mt-1 uppercase tracking-widest"
            style={{ fontSize: 11, color: "#9CA3AF", fontFamily: "system-ui" }}
          >
            {data?.finance.month ?? "This month"}
          </p>
          <div style={{ width: 40, height: 1.5, background: "#C9A84C", marginTop: 6 }} />
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
                className="rounded-xl p-4"
                style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)", borderTop: "2px solid #C9A84C" }}
              >
                <p
                  className="uppercase tracking-widest font-semibold"
                  style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui" }}
                >
                  Total Spent
                </p>
                <p
                  className="mt-1.5"
                  style={{ fontSize: 24, color: "#0A0E27", fontFamily: "Georgia,serif", fontWeight: 400 }}
                >
                  {fmtCurrency(data?.finance.total_spent ?? 0)}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
              >
                <p
                  className="uppercase tracking-widest font-semibold"
                  style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui" }}
                >
                  Total Budget
                </p>
                <p
                  className="mt-1.5"
                  style={{ fontSize: 24, color: "#0A0E27", fontFamily: "Georgia,serif", fontWeight: 400 }}
                >
                  {fmtCurrency(data?.finance.total_budget ?? 0)}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
              >
                <p
                  className="uppercase tracking-widest font-semibold"
                  style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui" }}
                >
                  Remaining
                </p>
                <p
                  className="mt-1.5"
                  style={{
                    fontSize: 24,
                    fontFamily: "Georgia,serif",
                    fontWeight: 400,
                    color: (data?.finance.remaining ?? 0) < 0 ? "#991B1B" : "#0A0E27",
                  }}
                >
                  {fmtCurrency(data?.finance.remaining ?? 0)}
                </p>
              </div>
              <div
                className="rounded-xl p-4"
                style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
              >
                <p
                  className="uppercase tracking-widest font-semibold"
                  style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui" }}
                >
                  Over Budget
                </p>
                <p
                  className="mt-1.5"
                  style={{
                    fontSize: 24,
                    fontFamily: "Georgia,serif",
                    fontWeight: 400,
                    color: overBudget > 0 ? "#991B1B" : "#0A0E27",
                  }}
                >
                  {overBudget}
                </p>
                <p className="text-[11px] mt-1" style={{ color: "#9CA3AF", fontFamily: "system-ui" }}>categories</p>
              </div>
            </>
          )}
        </div>

        {/* ── Row 2 ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">

          {/* Category Breakdown */}
          <div
            className="rounded-xl p-5"
            style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
          >
            <p
              className="uppercase tracking-widest font-bold mb-4"
              style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui" }}
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
              <p className="text-[13px]" style={{ color: "#6B7280" }}>
                No budgets set. Ask the assistant to set one.
              </p>
            ) : (
              <div className="space-y-4">
                {data?.finance.budget_health.map((b) => {
                  const barColor =
                    b.pct >= 80 ? "#C9A84C" :
                    b.pct >= 50 ? "#6B7280" :
                    "#0A0E27";
                  return (
                    <div key={b.category}>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[12px] capitalize" style={{ color: "#0A0E27", fontFamily: "system-ui" }}>{b.category}</span>
                        <span className="text-[12px]" style={{ color: "#6B7280", fontFamily: "system-ui" }}>
                          {fmtCurrency(b.spent)} / {fmtCurrency(b.limit)}
                        </span>
                      </div>
                      <div
                        className="h-1 rounded-full overflow-hidden"
                        style={{ background: "#F3F4F6" }}
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
            className="rounded-xl p-5"
            style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
          >
            <p
              className="uppercase tracking-widest font-bold mb-4"
              style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui" }}
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
              <p className="text-[13px]" style={{ color: "#6B7280" }}>No expenses logged this month.</p>
            ) : (
              <ul>
                {data?.finance.recent_expenses.map((e, i) => {
                  const badge = categoryBadgeStyle(e.category);
                  return (
                    <li
                      key={i}
                      className="flex items-center justify-between py-2.5"
                      style={i > 0 ? { borderTop: "0.5px solid #F3F4F6" } : {}}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0"
                          style={{ background: badge.bg, color: badge.color }}
                        >
                          {e.category}
                        </span>
                        <span className="text-[12px] truncate" style={{ color: "#6B7280", fontFamily: "system-ui" }}>
                          {e.description}
                        </span>
                      </div>
                      <div className="text-right shrink-0 ml-3">
                        <p className="text-[13px] font-medium" style={{ color: "#0A0E27", fontFamily: "system-ui" }}>
                          {fmtCurrency(e.amount)}
                        </p>
                        <p className="text-[10px]" style={{ color: "#9CA3AF", fontFamily: "system-ui" }}>{e.date}</p>
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
            className="rounded-xl p-5"
            style={{ background: "#FFFFFF", border: "0.5px solid rgba(10,14,39,0.08)" }}
          >
            <p
              className="uppercase tracking-widest font-bold mb-4"
              style={{ fontSize: 10, color: "#9CA3AF", fontFamily: "system-ui" }}
            >
              Upcoming Bills
            </p>
            <div>
              {data?.bills_upcoming.map((b, i) => {
                const urgency =
                  b.days_until <= 2
                    ? { bg: "rgba(180,83,9,0.1)", color: "#B45309" }
                    : b.days_until <= 7
                    ? { bg: "rgba(180,83,9,0.08)", color: "#B45309" }
                    : { bg: "rgba(22,101,52,0.08)", color: "#166534" };
                return (
                  <div
                    key={i}
                    className="flex items-center justify-between py-3"
                    style={i > 0 ? { borderTop: "0.5px solid #F3F4F6" } : {}}
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: urgency.bg, color: urgency.color }}
                      >
                        {b.days_until === 0 ? "Today" : b.days_until === 1 ? "Tomorrow" : `${b.days_until}d`}
                      </span>
                      <span className="text-[12px] font-medium" style={{ color: "#0A0E27", fontFamily: "system-ui" }}>{b.name}</span>
                      <span className="text-[10px]" style={{ color: "#9CA3AF", fontFamily: "system-ui" }}>{b.due_date}</span>
                    </div>
                    <span className="text-[12px] font-semibold" style={{ color: "#0A0E27", fontFamily: "system-ui" }}>
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
