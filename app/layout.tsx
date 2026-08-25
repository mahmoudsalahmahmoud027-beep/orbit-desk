import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Orbit Desk", template: "%s — Orbit Desk" },
  description: "A calm, local-first workspace for tasks, projects, notes, and focus.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body>{children}</body></html>;
}
