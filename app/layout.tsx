import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zentra Dashboard",
  description: "Användningsöversikt för journalassistenter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className="bg-[#f5f5f5] text-[#1a1a1a] antialiased">{children}</body>
    </html>
  );
}
