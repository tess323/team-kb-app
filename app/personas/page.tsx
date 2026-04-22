import { getAllPersonas } from "@/lib/db";
import PersonasGallery from "./PersonasGallery";

export default async function PersonasPage() {
  const personas = await getAllPersonas();

  return (
    <main className="max-w-6xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-ink">Teacher Personas</h1>
      </div>
      <PersonasGallery personas={personas} />
    </main>
  );
}
