import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team KB App",
  description: "Team knowledge base Q&A and records manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
