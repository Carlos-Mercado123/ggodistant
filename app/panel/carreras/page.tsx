import { redirect } from "next/navigation";
import { getCareers } from "@/lib/data";

export default function CarrerasIndexPage() {
  const careers = getCareers();

  if (careers.length > 0) {
    redirect(`/panel/carreras/${careers[0].slug}`);
  }

  return (
    <div className="rounded-lg border border-line bg-surface p-10 text-center text-sm text-ink-muted shadow-sm">
      Crea o selecciona una carrera para empezar.
    </div>
  );
}
