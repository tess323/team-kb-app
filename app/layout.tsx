import type { Metadata } from "next";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "Rebrand User Experience",
  description: "Rebrand user experience research and knowledge base",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${jakarta.variable} bg-cream min-h-screen`} suppressHydrationWarning>
        <nav className="bg-parchment border-b border-parchment-dark">
          <div className="max-w-7xl mx-auto px-4 h-14 flex items-center gap-6">
            <Link href="/" className="font-semibold text-ink hover:text-hunter transition-colors">
              Rebrand UX
            </Link>
            <Link href="/" className="text-sm text-ink/60 hover:text-hunter transition-colors">
              Ask a question
            </Link>
            <Link href="/personas" className="text-sm text-ink/60 hover:text-hunter transition-colors">
              Personas
            </Link>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
