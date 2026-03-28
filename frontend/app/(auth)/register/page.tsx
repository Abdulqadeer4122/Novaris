"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveToken } from "@/lib/auth";
import LoadingScreen from "@/components/LoadingScreen";

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, full_name: fullName }),
    });

    setLoading(false);
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError((data as { detail?: string }).detail ?? "Registration failed");
      return;
    }

    const data = await res.json();
    saveToken(data.access_token);
    router.replace("/onboarding");
  }

  const inputStyle = (field: string): React.CSSProperties => ({
    width: "100%",
    background: "rgba(255,255,255,0.06)",
    border: `0.5px solid ${focused === field ? "#C9A84C" : "rgba(240,242,248,0.15)"}`,
    borderRadius: 8,
    padding: "10px 14px",
    fontSize: 14,
    color: "#F0F2F8",
    outline: "none",
    fontFamily: "system-ui",
    caretColor: "#C9A84C",
    transition: "border-color 0.15s",
    boxShadow: focused === field ? "0 0 0 2px rgba(201,168,76,0.3)" : "none",
  });

  if (loading) return <LoadingScreen message="Creating your account…" />;

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: "#0A0E27" }}
    >
      {/* Card */}
      <div
        className="relative w-full max-w-[420px] mx-4 my-8"
        style={{
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(201,168,76,0.2)",
          borderRadius: 14,
          padding: "36px",
        }}
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: "50%",
              border: "1.5px solid #C9A84C",
              background: "rgba(201,168,76,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#C9A84C", fontSize: 20, lineHeight: 1 }}>N</span>
          </div>
          <h1
            style={{
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
              fontSize: 22,
              color: "#F0F2F8",
              letterSpacing: "0.04em",
              fontWeight: 400,
              marginBottom: 4,
            }}
          >
            Novaris
          </h1>
          <p
            style={{
              fontSize: 10,
              color: "rgba(201,168,76,0.5)",
              textTransform: "uppercase",
              letterSpacing: "0.15em",
            }}
          >
            AI ASSISTANT
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label
              style={{
                fontSize: 11,
                color: "#F0F2F8",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: 6,
                fontFamily: "system-ui",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onFocus={() => setFocused("name")}
              onBlur={() => setFocused(null)}
              style={inputStyle("name")}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                color: "#F0F2F8",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: 6,
                fontFamily: "system-ui",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setFocused("email")}
              onBlur={() => setFocused(null)}
              required
              style={inputStyle("email")}
            />
          </div>

          <div>
            <label
              style={{
                fontSize: 11,
                color: "#F0F2F8",
                letterSpacing: "0.06em",
                display: "block",
                marginBottom: 6,
                fontFamily: "system-ui",
                fontWeight: 600,
                textTransform: "uppercase",
              }}
            >
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setFocused("password")}
              onBlur={() => setFocused(null)}
              required
              style={inputStyle("password")}
            />
          </div>

          {error && (
            <p style={{ fontSize: 12, color: "#F87171", fontFamily: "system-ui" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "11px",
              borderRadius: 8,
              background: loading ? "rgba(255,255,255,0.1)" : "#C9A84C",
              color: loading ? "rgba(240,242,248,0.4)" : "#0A0E27",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              border: "none",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background 0.15s",
              fontFamily: "system-ui",
              marginTop: 4,
            }}
            onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#D4B86A"; }}
            onMouseLeave={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.background = "#C9A84C"; }}
          >
            {loading ? "Creating account…" : "Create Account"}
          </button>
        </form>

        <p style={{ marginTop: 24, fontSize: 12, color: "rgba(240,242,248,0.4)", textAlign: "center", fontFamily: "system-ui" }}>
          Already have an account?{" "}
          <a
            href="/login"
            style={{ color: "#C9A84C", textDecoration: "none", fontWeight: 600 }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "underline"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.textDecoration = "none"; }}
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
