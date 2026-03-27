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

/** Gold "N" lettermark matching the Novaris logo */
function NovarisMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Hexagonal / diamond frame — two bracket lines */}
      <path
        d="M8 6 L6 8 L6 24 L8 26"
        stroke="url(#gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      <path
        d="M24 6 L26 8 L26 24 L24 26"
        stroke="url(#gold)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* N letterform */}
      <path
        d="M9 23 L9 9 L23 23 L23 9"
        stroke="url(#gold)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" fill="none"
      />
      {/* Flame tip above N */}
      <path
        d="M16 9 L14.5 4.5 Q16 2 17.5 4.5 Z"
        fill="url(#gold)"
        opacity="0.9"
      />
      <defs>
        <linearGradient id="gold" x1="6" y1="2" x2="26" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f0d060"/>
          <stop offset="40%" stopColor="#c9a84c"/>
          <stop offset="100%" stopColor="#8a6820"/>
        </linearGradient>
      </defs>
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const initials = user?.full_name
    ? user.full_name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? "?";

  const navItemClass = (href: string) =>
    `flex items-center gap-2.5 px-3 py-2 rounded-xl text-[13px] transition-all duration-150 ${
      pathname === href
        ? "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 font-semibold shadow-sm"
        : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/60 hover:text-gray-800 dark:hover:text-gray-200"
    }`;

  return (
    <aside className="w-[232px] min-w-[232px] h-screen flex flex-col bg-white dark:bg-gray-950 border-r border-gray-100 dark:border-gray-800/60">

      {/* Brand */}
      <div className="px-5 pt-6 pb-4">
        <Link href="/dashboard" className="flex items-center gap-3 group">
          {/* Logo mark on dark pill */}
          <div className="w-9 h-9 rounded-xl bg-gray-950 dark:bg-gray-800 flex items-center justify-center shadow-md group-hover:shadow-amber-500/20 transition-shadow">
            <NovarisMark size={26} />
          </div>
          <div className="flex flex-col">
            <span
              className="text-[16px] font-bold tracking-wide leading-none"
              style={{
                background: "linear-gradient(135deg, #c9a84c 0%, #f0d060 50%, #c9a84c 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              NOVARIS
            </span>
            <span className="text-[10px] text-gray-400 dark:text-gray-500 tracking-widest uppercase leading-tight mt-0.5">
              AI Assistant
            </span>
          </div>
        </Link>
      </div>

      {/* Divider */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mb-4" />

      {/* Nav */}
      <div className="px-3 flex-1 overflow-y-auto">
        <p className="text-[10px] font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">
          Main
        </p>
        <nav className="flex flex-col gap-0.5 mb-5">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} className={navItemClass(item.href)}>
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>

        <p className="text-[10px] font-semibold text-gray-300 dark:text-gray-600 uppercase tracking-widest px-3 mb-2">
          Tools
        </p>
        <nav className="flex flex-col gap-0.5">
          {TOOLS.map((item) => (
            <Link key={item.href} href={item.href} className={navItemClass(item.href)}>
              <Icon name={item.icon} />
              {item.label}
            </Link>
          ))}
        </nav>
      </div>

      {/* User footer */}
      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-800 to-transparent mb-3" />
      <div className="px-3 pb-4">
        <Link
          href="/profile"
          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/60 transition-colors group"
        >
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 shadow-sm"
            style={{
              background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
              color: "#c9a84c",
              border: "1px solid #c9a84c40",
            }}
          >
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[12px] font-semibold text-gray-800 dark:text-gray-200 truncate leading-tight">
              {user?.full_name ?? "User"}
            </p>
            <p className="text-[11px] text-gray-400 truncate">{user?.email}</p>
          </div>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-gray-300 dark:text-gray-600 shrink-0">
            <path d="M5 3l3 3-3 3"/>
          </svg>
        </Link>
        <button
          onClick={logout}
          className="w-full mt-1 flex items-center gap-2 px-3 py-1.5 rounded-xl text-[12px] text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors"
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
