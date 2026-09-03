import { notFound } from "next/navigation";
import { getCareerBySlug, getCardsByCareer, filterCards } from "@/lib/data";
import CardsGrid from "@/components/consulta/CardsGrid";

export default async function ConsultaCareerDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { slug } = await params;
  const { q, tag } = await searchParams;

  const career = getCareerBySlug(slug);
  if (!career) notFound();

  const cards = filterCards(getCardsByCareer(career.id), { q, tag });

  return (
    <div className="border border-line bg-surface p-6">
      <h2 className="mb-5 border-b border-line pb-3 font-serif text-xl font-semibold text-brand">
        {career.name}
      </h2>
      <CardsGrid
        cards={cards}
        labelPrefix="Argumento de Venta"
        emptyMessage="No hay argumentos registrados para esta carrera."
      />
    </div>
  );
}
