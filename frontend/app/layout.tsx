import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Novaris",
  description: "Novaris — AI-powered personal assistant with Gmail & Calendar",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen" style={{ background: "#F0F2F8", color: "#0A0E27" }}>
        {children}
      </body>
    </html>
  );
}
