import { redirect } from "next/navigation";
import { getCareers } from "@/lib/data";

export default function ConsultaCarrerasIndexPage() {
  const careers = getCareers();

  if (careers.length > 0) {
    redirect(`/consulta/carreras/${careers[0].slug}`);
  }

  return (
    <div className="border border-line bg-surface p-10 text-center text-sm italic text-ink-muted">
      Aún no hay carreras registradas.
    </div>
  );
}
