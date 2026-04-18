import Link from "next/link";
import { notFound } from "next/navigation";
import { personas } from "@/src/data/personas";

export default async function PersonaDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const persona = personas.find((p) => p.id === Number(id));
  if (!persona) notFound();

  const {
    name, role, initials, gradeBand, relationshipStatus, motivationSpectrum,
    motivationScore, background, excited, nervous, feelLike, successLooks,
    failureLooks, channelsWithinControl, channelsOutsideControl, journey,
  } = persona;

  return (
    <main className="max-w-7xl mx-auto px-4 py-10">
      {/* Back link + header */}
      <Link
        href="/personas"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
      >
        <span>←</span> All personas
      </Link>

      <div className="flex items-center gap-4 mb-8">
        <div className="w-14 h-14 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold text-lg shrink-0">
          {initials}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{name}</h1>
          <p className="text-gray-500 text-sm mt-0.5">{role}</p>
          <div className="flex gap-2 mt-2">
            <Pill color="sky">{gradeBand}</Pill>
            <Pill color="green">{relationshipStatus}</Pill>
            <Pill color="violet">{motivationSpectrum}</Pill>
          </div>
        </div>
      </div>

      {/* Bento grid */}
      <div className="grid grid-cols-3 gap-4">

        {/* 1. Background + motivation bar — col-span-2 */}
        <div className="col-span-2 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <BoxLabel>Background</BoxLabel>
          <p className="text-gray-700 text-sm leading-relaxed mt-2">{background}</p>

          <div className="mt-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Voluntold</span>
              <span className="font-medium text-gray-700">{motivationSpectrum}</span>
              <span>Early adopter</span>
            </div>
            <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-indigo-500 rounded-full"
                style={{ width: `${motivationScore}%` }}
              />
            </div>
            <div className="flex justify-end mt-1">
              <span className="text-xs text-gray-400">{motivationScore}/100</span>
            </div>
          </div>
        </div>

        {/* 2. Widget placeholder — col-span-1 */}
        <div className="col-span-1 border-2 border-dashed border-gray-300 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-indigo-300 hover:text-indigo-400 transition-colors cursor-pointer">
          <span className="text-2xl">+</span>
          <BoxLabel>What they'll see this week</BoxLabel>
          <span className="text-xs">add widget</span>
        </div>

        {/* 3. What this should feel like — purple tint */}
        <div className="col-span-1 bg-purple-50 border border-purple-200 rounded-2xl p-5">
          <BoxLabel>What this should feel like</BoxLabel>
          <p className="text-purple-900 text-sm leading-relaxed mt-2">{feelLike}</p>
        </div>

        {/* 4. Excited about */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <BoxLabel>Excited about</BoxLabel>
          <p className="text-gray-700 text-sm leading-relaxed mt-2">{excited}</p>
        </div>

        {/* 5. Nervous about */}
        <div className="col-span-1 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <BoxLabel>Nervous about</BoxLabel>
          <p className="text-gray-700 text-sm leading-relaxed mt-2">{nervous}</p>
        </div>

        {/* 6. Success looks like — green tint */}
        <div className="col-span-1 bg-green-50 border border-green-200 rounded-2xl p-5">
          <BoxLabel>Success looks like</BoxLabel>
          <p className="text-green-900 text-sm leading-relaxed mt-2">{successLooks}</p>
        </div>

        {/* 7. Failure looks like — red tint */}
        <div className="col-span-1 bg-red-50 border border-red-200 rounded-2xl p-5">
          <BoxLabel>Failure looks like</BoxLabel>
          <p className="text-red-900 text-sm leading-relaxed mt-2">{failureLooks}</p>
        </div>

        {/* 8. Communication channels — col-span-3 */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <BoxLabel>Communication channels</BoxLabel>
          <div className="grid grid-cols-2 gap-6 mt-4">
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Within our control
              </p>
              <ul className="space-y-2">
                {channelsWithinControl.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">
                Outside our control
              </p>
              <ul className="space-y-2">
                {channelsOutsideControl.map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* 9. Journey by phase — col-span-3 */}
        <div className="col-span-3 bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <BoxLabel>Journey</BoxLabel>
          <div className="grid grid-cols-4 gap-5 mt-4">
            {(
              [
                { key: "preLaunch",    label: "Pre-launch",     border: "border-purple-500", text: "text-purple-700" },
                { key: "launch",       label: "Launch",         border: "border-green-500",  text: "text-green-700"  },
                { key: "summer",       label: "Summer",         border: "border-amber-500",  text: "text-amber-700"  },
                { key: "backToSchool", label: "Back to school", border: "border-blue-500",   text: "text-blue-700"   },
              ] as const
            ).map(({ key, label, border, text }) => (
              <div key={key} className={`border-t-4 ${border} pt-4`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-3 ${text}`}>
                  {label}
                </p>
                <ul className="space-y-3">
                  {journey[key].moments.map((m, i) => (
                    <li key={i} className="text-sm text-gray-700 leading-relaxed">
                      {m}
                    </li>
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
    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{children}</p>
  );
}

function Pill({ children, color }: { children: React.ReactNode; color: string }) {
  const variants: Record<string, string> = {
    sky:    "bg-sky-100 text-sky-800",
    green:  "bg-green-100 text-green-800",
    violet: "bg-violet-100 text-violet-800",
  };
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${variants[color] ?? "bg-gray-100 text-gray-700"}`}>
      {children}
    </span>
  );
}
