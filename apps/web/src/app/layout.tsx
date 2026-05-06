import type { Metadata } from "next";
import "./globals.css";
import { MiBottomNav } from "@/components/MiLayout";

export const metadata: Metadata = {
  title: "Gaming PM Agent | Data-Driven Game Discovery",
  description: "Mine unmet niche game demands from social forums → Structured GDD",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <div className="mi-container">
          {children}
          <MiBottomNav />
        </div>
      </body>
    </html>
  );
}
