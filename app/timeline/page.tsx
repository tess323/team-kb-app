import Link from "next/link";

export default function TimelinePage() {
  return (
    <main className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-hunter mb-6 transition-colors"
      >
        ← Dashboard
      </Link>
      <h1 className="text-3xl font-semibold text-ink mb-2">Campaign Timeline</h1>
      <p className="text-sm text-ink/50">Full campaign phase view coming soon.</p>
    </main>
  );
}
