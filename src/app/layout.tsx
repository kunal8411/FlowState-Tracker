import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlowState Tracker",
  description:
    "A minimal focus timer and session logger to help you track deep work.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
