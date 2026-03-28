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
        background: "#0A0E27",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
      }}
    >
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
            stroke="rgba(201,168,76,0.15)"
            strokeWidth="2"
          />
          <circle
            cx="48"
            cy="48"
            r="44"
            fill="none"
            stroke="#C9A84C"
            strokeOpacity="0.3"
            strokeWidth="2"
            strokeLinecap="round"
            strokeDasharray="60 217"
          />
        </svg>

        {/* Inner pulse ring */}
        <div
          style={{
            position: "absolute",
            inset: 10,
            borderRadius: "50%",
            border: "1px solid rgba(201,168,76,0.15)",
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
          <div style={{ filter: "drop-shadow(0 0 20px rgba(201,168,76,0.3))" }}>
            <div
              style={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                border: "2px solid #C9A84C",
                background: "rgba(201,168,76,0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontFamily: "Georgia,serif", fontStyle: "italic", color: "#C9A84C", fontSize: 28, lineHeight: 1 }}>N</span>
            </div>
          </div>
        </div>
      </div>

      {/* Brand name */}
      <div style={{ marginTop: 28, textAlign: "center" }}>
        <p
          style={{
            fontFamily: "Georgia,serif",
            fontStyle: "italic",
            fontSize: 20,
            color: "#F0F2F8",
            letterSpacing: "0.2em",
            animation: "novaris-fade 1.5s ease-in-out infinite alternate",
          }}
        >
          NOVARIS
        </p>
        <p
          style={{
            fontSize: 12,
            color: "rgba(240,242,248,0.4)",
            marginTop: 10,
            letterSpacing: "0.05em",
            fontFamily: "system-ui",
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
              background: "#C9A84C",
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
