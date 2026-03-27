"use client";
import { useEffect, useState } from "react";
import { authHeaders } from "@/lib/auth";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001";

export interface EmailItem {
  id: number;
  sender_name: string | null;
  sender_email: string;
  subject: string;
  snippet: string | null;
  is_unread: boolean;
  received_at: string;
}

export interface EventItem {
  id: number;
  title: string;
  start_time: string;
  end_time: string;
  location: string | null;
  attendee_count: number;
  meet_link: string | null;
}

export interface BillItem {
  name: string;
  amount: number;
  due_date: string;
  days_until: number;
}

export interface BudgetHealth {
  category: string;
  spent: number;
  limit: number;
  pct: number;
  status: "ok" | "warning" | "over";
}

export interface ExpenseItem {
  description: string;
  category: string;
  amount: number;
  date: string;
}

export interface FinanceData {
  total_spent: number;
  total_budget: number;
  remaining: number;
  month: string;
  budget_health: BudgetHealth[];
  recent_expenses: ExpenseItem[];
}

export interface DashboardData {
  finance: FinanceData;
  emails: EmailItem[];
  events_today: EventItem[];
  events_upcoming: EventItem[];
  bills_upcoming: BillItem[];
}

export function useDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    fetch(`${API}/dashboard`, { headers: authHeaders() as HeadersInit })
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d: DashboardData) => setData(d))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return { data, loading, error, reload: load };
}
