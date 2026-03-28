"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: "grid" },
  { href: "/assistant", label: "Assistant", icon: "sparkle" },
];
const TOOLS = [
  { href: "/inbox", label: "Inbox", icon: "mail" },
  { href: "/finance", label: "Finance", icon: "wallet" },
  { href: "/calendar", label: "Calendar", icon: "calendar" },
];

function Icon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    grid: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="2" width="5" height="5" rx="1"/>
        <rect x="9" y="2" width="5" height="5" rx="1"/>
        <rect x="2" y="9" width="5" height="5" rx="1"/>
        <rect x="9" y="9" width="5" height="5" rx="1"/>
      </svg>
    ),
    sparkle: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M8 2v3M8 11v3M2 8h3M11 8h3M4.2 4.2l2.1 2.1M9.7 9.7l2.1 2.1M4.2 11.8l2.1-2.1M9.7 6.3l2.1-2.1"/>
      </svg>
    ),
    mail: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="12" height="10" rx="1.5"/>
        <path d="M2 5l6 4 6-4"/>
      </svg>
    ),
    wallet: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="12" height="9" rx="1.5"/>
        <path d="M2 7h12"/>
        <circle cx="11.5" cy="10" r="1" fill="currentColor" stroke="none"/>
      </svg>
    ),
    calendar: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="3" width="12" height="11" rx="1.5"/>
        <path d="M2 7h12M5 2v2M11 2v2"/>
      </svg>
    ),
  };
  return (
    <span style={{ width: 16, height: 16, display: "flex", alignItems: "center" }}>
      {icons[name]}
    </span>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const navItemStyle = (href: string): React.CSSProperties =>
    pathname === href
      ? {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 12px",
          borderRadius: "0 8px 8px 0",
          fontSize: 13,
          transition: "all 0.15s",
          background: "rgba(201,168,76,0.12)",
          color: "#C9A84C",
          borderLeft: "2px solid #C9A84C",
          fontWeight: 500,
        }
      : {
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "8px 12px",
          borderRadius: "0 8px 8px 0",
          fontSize: 13,
          transition: "all 0.15s",
          color: "rgba(240,242,248,0.55)",
          borderLeft: "2px solid transparent",
        };

  return (
    <aside
      style={{
        width: 232,
        minWidth: 232,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        background: "#0A0E27",
        borderRight: "1px solid rgba(201,168,76,0.15)",
      }}
    >
      {/* Brand */}
      <div style={{ padding: "24px 20px 16px" }}>
        <Link href="/dashboard" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px solid #C9A84C",
              background: "rgba(201,168,76,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#C9A84C", fontSize: 16, lineHeight: 1 }}>N</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontFamily: "Georgia,serif",
                fontStyle: "italic",
                color: "#F0F2F8",
                letterSpacing: "0.04em",
                fontSize: 15,
                fontWeight: 400,
                lineHeight: 1.2,
              }}
            >
              Novaris
            </span>
            <span
              style={{
                color: "rgba(201,168,76,0.5)",
                fontSize: 9,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                lineHeight: 1.4,
                marginTop: 2,
              }}
            >
              AI Assistant
            </span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div style={{ margin: "0 16px 16px", height: 1, background: "rgba(201,168,76,0.15)" }} />

      {/* Nav */}
      <div style={{ padding: "0 0", flex: 1, overflowY: "auto" }}>
        <p
          style={{
            color: "rgba(201,168,76,0.5)",
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 12px",
            marginBottom: 8,
          }}
        >
          Main
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 20 }}>
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={navItemStyle(item.href)}
              onMouseEnter={(e) => {
                if (pathname !== item.href) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#F0F2F8";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,242,248,0.55)";
                }
              }}
            >
              <span style={{ color: pathname === item.href ? "#C9A84C" : "rgba(240,242,248,0.55)" }}>
                <Icon name={item.icon} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>

        <p
          style={{
            color: "rgba(201,168,76,0.5)",
            fontSize: 9,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            padding: "0 12px",
            marginBottom: 8,
          }}
        >
          Tools
        </p>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {TOOLS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              style={navItemStyle(item.href)}
              onMouseEnter={(e) => {
                if (pathname !== item.href) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)";
                  (e.currentTarget as HTMLAnchorElement).style.color = "#F0F2F8";
                }
              }}
              onMouseLeave={(e) => {
                if (pathname !== item.href) {
                  (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  (e.currentTarget as HTMLAnchorElement).style.color = "rgba(240,242,248,0.55)";
                }
              }}
            >
              <span style={{ color: pathname === item.href ? "#C9A84C" : "rgba(240,242,248,0.55)" }}>
                <Icon name={item.icon} />
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* User footer */}
      <div style={{ margin: "0 16px", height: 1, background: "rgba(201,168,76,0.15)", marginBottom: 12 }} />
      <div style={{ padding: "0 12px 16px" }}>
        <Link
          href="/profile"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "8px 12px",
            borderRadius: 8,
            textDecoration: "none",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.06)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLAnchorElement).style.background = "transparent"; }}
        >
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              border: "1.5px solid #C9A84C",
              background: "rgba(201,168,76,0.1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Georgia,serif",
              fontStyle: "italic",
              color: "#C9A84C",
              fontSize: 13,
              flexShrink: 0,
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 12, color: "#F0F2F8", fontFamily: "system-ui", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", lineHeight: 1.3 }}>
              {user?.full_name ?? "User"}
            </p>
            <p style={{ fontSize: 10, color: "rgba(240,242,248,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.email}</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="rgba(240,242,248,0.3)" strokeWidth="1.5" style={{ flexShrink: 0 }}>
            <path d="M5 3l3 3-3 3"/>
          </svg>
        </Link>
        <button
          onClick={logout}
          style={{
            width: "100%",
            marginTop: 4,
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 12px",
            borderRadius: 8,
            fontSize: 12,
            color: "rgba(201,168,76,0.5)",
            background: "transparent",
            border: "none",
            cursor: "pointer",
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#C9A84C"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(201,168,76,0.5)"; }}
        >
          <svg width="13" height="13" viewBox="0 0 13 13" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M5 2H2a1 1 0 0 0-1 1v7a1 1 0 0 0 1 1h3M9 9.5l3-3-3-3M12 6.5H5"/>
          </svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
