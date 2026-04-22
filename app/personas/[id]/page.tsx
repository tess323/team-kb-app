import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPersonas, getPersonaById } from "@/lib/db";
import PersonaDocActions from "./PersonaDocActions";
import MarkdownContent from "./MarkdownContent";

export async function generateStaticParams() {
  const personas = await getAllPersonas();
  return personas.map((p) => ({ id: String(p.persona_id) }));
}

export default async function PersonaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const persona = await getPersonaById(Number(id));
  if (!persona || !persona.name) notFound();

  const initials = persona.name
    .split(" ")
    .filter((_, i, a) => i === 0 || i === a.length - 1)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
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
            <h1 className="text-4xl font-sans font-semibold tracking-tight text-ink leading-tight">
              {persona.name}
            </h1>
            {persona.role && <p className="text-sm text-ink/50 mt-1">{persona.role}</p>}
            <div className="flex flex-wrap gap-2 mt-2">
              {persona.grade_band && <HeaderPill>{persona.grade_band}</HeaderPill>}
              {persona.relationship && <HeaderPill>{persona.relationship}</HeaderPill>}
              {persona.motivation && <HeaderPill>{persona.motivation}</HeaderPill>}
              {persona.current_course && (
                <HeaderPill variant="muted">{persona.current_course}</HeaderPill>
              )}
            </div>
          </div>
        </div>
        <PersonaDocActions
          personaId={persona.persona_id}
          initialDocId={persona.google_doc_id ?? null}
          initialDocUrl={
            persona.google_doc_id
              ? `https://docs.google.com/document/d/${persona.google_doc_id}/edit`
              : null
          }
          initialLastSynced={persona.last_synced ?? null}
        />
      </div>

      <div className="grid grid-cols-3 gap-4">

        {/* Quote */}
        {persona.quote && (
          <div className="col-span-3 border-l-4 border-hunter pl-5 py-1">
            <p className="text-base italic text-ink/70 leading-relaxed">"{persona.quote}"</p>
          </div>
        )}

        {/* Background */}
        {persona.background && (
          <div className="col-span-3 bg-parchment border border-parchment-dark rounded-md p-6">
            <BoxLabel>Background</BoxLabel>
            <p className="text-sm text-ink leading-relaxed mt-2">{persona.background}</p>
          </div>
        )}

        {/* Goals | Pain Points | Needs */}
        {(persona.goals || persona.pain_points || persona.needs) && (
          <>
            <BulletCard label="Goals" items={persona.goals} accent="hunter" />
            <BulletCard label="Pain Points" items={persona.pain_points} accent="rose" />
            <BulletCard label="Needs" items={persona.needs} accent="ochre" />
          </>
        )}

        {/* Excited | Nervous */}
        {persona.excited_about && (
          <div className="col-span-1 bg-hunter-muted border border-hunter-light rounded-md p-5">
            <BoxLabel>Excited about</BoxLabel>
            <p className="text-sm text-ink leading-relaxed mt-2">{persona.excited_about}</p>
          </div>
        )}
        {persona.nervous_about && (
          <div className="col-span-1 bg-white border border-parchment-dark rounded-md p-5">
            <BoxLabel>Nervous about</BoxLabel>
            <p className="text-sm text-ink leading-relaxed mt-2">{persona.nervous_about}</p>
          </div>
        )}
        {persona.aim_feeling && (
          <div className="col-span-1 bg-cream border border-cream-dark rounded-md p-5">
            <BoxLabel>How we want them to feel</BoxLabel>
            <p className="text-sm text-ink leading-relaxed mt-2">{persona.aim_feeling}</p>
          </div>
        )}

        {/* Success | Failure */}
        {persona.success_looks_like && (
          <div className="col-span-1 bg-ochre-muted border border-ochre-light rounded-md p-5">
            <BoxLabel>Success looks like</BoxLabel>
            <p className="text-sm text-ink leading-relaxed mt-2">{persona.success_looks_like}</p>
          </div>
        )}
        {persona.failure_looks_like && (
          <div className="col-span-1 bg-rose-muted border border-rose-light rounded-md p-5">
            <BoxLabel>Failure looks like</BoxLabel>
            <p className="text-sm text-ink leading-relaxed mt-2">{persona.failure_looks_like}</p>
          </div>
        )}

        {/* Comms channels */}
        {(persona.comms_in_control || persona.comms_out_of_control) && (
          <div className="col-span-3 bg-parchment border border-parchment-dark rounded-md p-6">
            <BoxLabel>Communication channels</BoxLabel>
            <div className="grid grid-cols-2 gap-6 mt-4">
              {persona.comms_in_control && (
                <div>
                  <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide mb-3">
                    Within our control
                  </p>
                  <ul className="space-y-2">
                    {persona.comms_in_control.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-hunter shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {persona.comms_out_of_control && (
                <div>
                  <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide mb-3">
                    Outside our control
                  </p>
                  <ul className="space-y-2">
                    {persona.comms_out_of_control.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-ink">
                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-rose shrink-0" />
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI Relationship | Rebrand Risk */}
        {(persona.ai_relationship || persona.rebrand_risk) && (
          <>
            {persona.ai_relationship && (
              <div className="col-span-1 bg-slate-muted border border-slate-light rounded-md p-5">
                <BoxLabel>AI relationship</BoxLabel>
                <p className="text-sm text-ink leading-relaxed mt-2">{persona.ai_relationship}</p>
              </div>
            )}
            {persona.rebrand_risk && (
              <div className="col-span-1 bg-rose-muted border border-rose-light rounded-md p-5">
                <BoxLabel>Rebrand risk</BoxLabel>
                <p className="text-sm text-ink leading-relaxed mt-2">{persona.rebrand_risk}</p>
              </div>
            )}
          </>
        )}

        {/* Full narrative */}
        {persona.content && (
          <div className="col-span-3 bg-parchment border border-parchment-dark rounded-md p-6">
            <BoxLabel>Full narrative</BoxLabel>
            <div className="mt-4 prose prose-sm max-w-none text-ink">
              <MarkdownContent content={persona.content} />
            </div>
          </div>
        )}

      </div>
    </main>
  );
}

function BoxLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-2xs font-semibold text-ink/50 uppercase tracking-wide">{children}</p>
  );
}

function HeaderPill({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "muted";
}) {
  return (
    <span
      className={`text-xs font-medium px-2 py-0.5 rounded-full ${
        variant === "muted"
          ? "bg-cream-dark text-cream-text"
          : "bg-parchment-dark text-parchment-text"
      }`}
    >
      {children}
    </span>
  );
}

function BulletCard({
  label,
  items,
  accent,
}: {
  label: string;
  items: string[] | null;
  accent: "hunter" | "rose" | "ochre";
}) {
  if (!items || items.length === 0) return null;
  const dotColor = accent === "hunter" ? "bg-hunter" : accent === "rose" ? "bg-rose" : "bg-ochre";
  const bg =
    accent === "hunter"
      ? "bg-hunter-muted border-hunter-light"
      : accent === "rose"
      ? "bg-rose-muted border-rose-light"
      : "bg-ochre-muted border-ochre-light";
  return (
    <div className={`col-span-1 border rounded-md p-5 ${bg}`}>
      <BoxLabel>{label}</BoxLabel>
      <ul className="mt-3 space-y-2">
        {items.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-sm text-ink">
            <span className={`mt-1.5 w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
