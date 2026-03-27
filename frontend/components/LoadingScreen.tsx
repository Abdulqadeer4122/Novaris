"use client";

interface Props {
  message?: string;
}

export default function LoadingScreen({ message = "Signing in…" }: Props) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#050505",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
      {/* Ambient radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "radial-gradient(ellipse 60% 40% at 50% 50%, #c9a84c0e 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Spinning ring + logo */}
      <div style={{ position: "relative", width: 96, height: 96 }}>
        {/* Outer spinning arc */}
        <svg
          width="96"
          height="96"
          viewBox="0 0 96 96"
          style={{
            position: "absolute",
            inset: 0,
            animation: "novaris-spin 1.6s linear infinite",
          }}
        >
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="#1f1f1f"
            strokeWidth="2"
          />
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="url(#spinGrad)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="60 217"
          />
          <defs>
            <linearGradient id="spinGrad" x1="0" y1="0" x2="96" y2="96" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#f0d060" />
              <stop offset="100%" stopColor="#c9a84c" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Inner pulse ring */}
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            border: "1px solid #c9a84c20",
            animation: "novaris-pulse 2s ease-in-out infinite",
          }}
        />

        {/* Logo mark — centered */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ filter: "drop-shadow(0 0 16px #c9a84c50)" }}>
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <rect width="48" height="48" rx="14" fill="url(#lCardGrad)" />
              <path d="M13 9L11 11L11 37L13 39" stroke="url(#lNGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M35 9L37 11L37 37L35 39" stroke="url(#lNGrad)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M14 35L14 13L34 35L34 13" stroke="url(#lNGrad)" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M24 13L22 7Q24 4 26 7Z" fill="url(#lNGrad)" opacity="0.9"/>
              <defs>
                <linearGradient id="lCardGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#1a1400"/>
                  <stop offset="100%" stopColor="#0d0d00"/>
                </linearGradient>
                <linearGradient id="lNGrad" x1="11" y1="4" x2="37" y2="44" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#f0d060"/>
                  <stop offset="100%" stopColor="#c9a84c"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>
      </div>

      {/* Brand name */}
      <div style={{ marginTop: 28, textAlign: "center" }}>
        <p
          style={{
            fontSize: "20px",
            fontWeight: 700,
            letterSpacing: "0.25em",
            background: "linear-gradient(135deg, #f0d060 0%, #c9a84c 50%, #e8c060 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "novaris-fade 1.5s ease-in-out infinite alternate",
          }}
        >
          NOVARIS
        </p>
        <p
          style={{
            fontSize: "12px",
            color: "#555",
            marginTop: 10,
            letterSpacing: "0.05em",
            animation: "novaris-fade 1.5s ease-in-out infinite alternate",
          }}
        >
          {message}
        </p>
      </div>

      {/* Animated dots */}
      <div style={{ display: "flex", gap: 6, marginTop: 24 }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: "#c9a84c",
              animation: `novaris-dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              opacity: 0.3,
            }}
          />
        ))}
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes novaris-spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes novaris-pulse {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50%       { opacity: 0.8; transform: scale(1.06); }
        }
        @keyframes novaris-fade {
          from { opacity: 0.5; }
          to   { opacity: 1; }
        }
        @keyframes novaris-dot {
          0%, 80%, 100% { opacity: 0.2; transform: scale(0.8); }
          40%           { opacity: 1;   transform: scale(1.2); }
        }
      `}</style>
    </div>
  );
}
