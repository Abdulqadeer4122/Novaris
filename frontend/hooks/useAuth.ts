"use client";

import { useEffect, useState } from "react";
import { authHeaders, clearToken, getToken } from "@/lib/auth";

export interface AuthUser {
  id: number;
  email: string;
  full_name: string | null;
  google_connected: boolean;
}

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      headers: authHeaders() as HeadersInit,
    })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data: AuthUser) => setUser(data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  function logout(): void {
    clearToken();
    setUser(null);
    window.location.href = "/login";
  }

  return { user, loading, logout };
}
