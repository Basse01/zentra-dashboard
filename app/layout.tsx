import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Zentra Dashboard",
  description: "Användningsöversikt för journalassistenter",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sv">
      <body className={`${inter.className} bg-[#07070f] text-white antialiased`}>{children}</body>
    </html>
  );
}
