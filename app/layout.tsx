import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team KB App",
  description: "Team knowledge base Q&A and records manager",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <nav className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
            <Link href="/" className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors">
              Team KB
            </Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              Ask a question
            </Link>
            <Link href="/personas" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
              Personas
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
