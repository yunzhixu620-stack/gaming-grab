import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Gaming PM Agent",
  description: "Data-driven gaming product manager — mine unmet niche demands",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased bg-neutral-950 text-neutral-200 min-h-screen">
        {children}
      </body>
    </html>
  );
}
