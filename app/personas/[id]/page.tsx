import Link from "next/link";
import { notFound } from "next/navigation";
import { personas } from "@/src/data/personas";
import { getPersonaById } from "@/lib/db";
import PersonaDocActions from "./PersonaDocActions";

export default async function PersonaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const numericId = Number(id);
  const persona = personas.find((p) => p.id === numericId);
  if (!persona) notFound();

  const dbRecord = await getPersonaById(numericId);

  const {
    name, role, initials, gradeBand, relationshipStatus, motivationSpectrum,
    motivationScore, background, excited, nervous, feelLike, successLooks,
    failureLooks, channelsWithinControl, channelsOutsideControl, journey,
  } = persona;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Back link */}
      <Link
        href="/personas"
        className="inline-flex items-center gap-1.5 text-sm text-ink/50 hover:text-hunter mb-6 transition-colors"
      >
        ← All personas
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-md bg-hunter flex items-center justify-center text-cream font-semibold text-lg shrink-0">
            {initials}
          </div>
          <div>
            <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink leading-tight">{name}</h1>
            <p className="text-sm text-ink/50 mt-1">{role}</p>
            <div className="flex gap-2 mt-2">
              <HeaderPill>{gradeBand}</HeaderPill>
              <HeaderPill>{relationshipStatus}</HeaderPill>
              <HeaderPill>{motivationSpectrum}</HeaderPill>
            </div>
          </div>
        </div>
        <PersonaDocActions
          personaId={numericId}
          initialDocId={dbRecord?.google_doc_id ?? null}
          initialDocUrl={dbRecord?.google_doc_id ? `https://docs.google.com/document/d/${dbRecord.google_doc_id}/edit` : null}
          initialLastSynced={dbRecord?.last_synced ?? null}
        />
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-3 gap-4">

        {/* 1. Background + motivation bar — parchment, col-span-2 */}
        <div className="col-span-2 bg-parchment border border-parchment-dark rounded-md p-6">
          <BoxLabel>Background</BoxLabel>
          <p className="text-sm text-ink leading-relaxed mt-2">{background}</p>
          <div className="mt-5">
            <div className="flex justify-between text-xs text-ink/50 mb-1.5">
              <span>Voluntold</span>
              <span className="font-medium text-ink/70">{motivationSpectrum}</span>
              <span>Early adopter</span>
            </div>
            <div className="relative h-1.5 bg-parchment-dark rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-hunter rounded-full"
                style={{ width: `${motivationScore}%` }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-xs text-ink/40">{motivationScore}/100</span>
            </div>
          </div>
        </div>

        {/* 2. This week widget — slate tint, dashed */}
        <div className="col-span-1 bg-slate-muted border-2 border-dashed border-slate-light rounded-md p-6 flex flex-col items-center justify-center gap-2 text-slate/60 hover:border-slate hover:text-slate transition-colors cursor-pointer">
          <span className="text-2xl leading-none">+</span>
          <BoxLabel>What they'll see this week</BoxLabel>
          <span className="text-xs">add widget</span>
        </div>

        {/* 3. Feel like — cream */}
        <div className="col-span-1 bg-cream border border-cream-dark rounded-md p-5">
          <BoxLabel>What this should feel like</BoxLabel>
          <p className="text-sm text-ink leading-relaxed mt-2">{feelLike}</p>
        </div>

        {/* 4. Excited — hunter tint */}
        <div className="col-span-1 bg-hunter-muted border border-hunter-light rounded-md p-5">
          <BoxLabel>Excited about</BoxLabel>
          <p className="text-sm text-ink leading-relaxed mt-2">{excited}</p>
        </div>

        {/* 5. Nervous — white/border, no tint */}
        <div className="col-span-1 bg-white border border-parchment-dark rounded-md p-5">
          <BoxLabel>Nervous about</BoxLabel>
          <p className="text-sm text-ink leading-relaxed mt-2">{nervous}</p>
        </div>

        {/* 6. Success — ochre tint */}
        <div className="col-span-1 bg-ochre-muted border border-ochre-light rounded-md p-5">
          <BoxLabel>Success looks like</BoxLabel>
          <p className="text-sm text-ink leading-relaxed mt-2">{successLooks}</p>
        </div>

        {/* 7. Failure — rose tint */}
        <div className="col-span-1 bg-rose-muted border border-rose-light rounded-md p-5">
          <BoxLabel>Failure looks like</BoxLabel>
          <p className="text-sm text-ink leading-relaxed mt-2">{failureLooks}</p>
        </div>

        {/* 8. Communication channels — col-span-3 */}
        <div className="col-span-3 bg-parchment border border-parchment-dark rounded-md p-6">
          <BoxLabel>Communication channels</BoxLabel>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div>
              <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide mb-3">
                Within our control
              </p>
              <ul className="space-y-2">
                {channelsWithinControl.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-hunter shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide mb-3">
                Outside our control
              </p>
              <ul className="space-y-2">
                {channelsOutsideControl.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-ink">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 9. Journey — col-span-3 */}
        <div className="col-span-3 bg-parchment border border-parchment-dark rounded-md p-6">
          <BoxLabel>Journey</BoxLabel>
          <div className="grid grid-cols-4 gap-5 mt-4">
            {(
              [
                { key: "preLaunch",    label: "Pre-launch",     border: "border-slate",  text: "text-slate"  },
                { key: "launch",       label: "Launch",         border: "border-hunter", text: "text-hunter" },
                { key: "summer",       label: "Summer",         border: "border-ochre",  text: "text-ochre"  },
                { key: "backToSchool", label: "Back to school", border: "border-rose",   text: "text-rose"   },
              ] as const
            ).map(({ key, label, border, text }) => (
              <div key={key} className={`border-t-4 ${border} pt-4`}>
                <p className={`text-2xs font-semibold uppercase tracking-wide mb-3 ${text}`}>
                  {label}
                </p>
                <ul className="space-y-3">
                  {journey[key].moments.map((m, i) => (
                    <li key={i} className="text-sm text-ink leading-relaxed">{m}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

      </div>
    </main>
  );
}

function BoxLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide">{children}</p>
  );
}

function HeaderPill({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-parchment-dark text-parchment-text">
      {children}
    </span>
  );
}
