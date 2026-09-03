import { notFound } from "next/navigation";
import { getCareerBySlug, getCardsByCareer, getFilterTags, filterCards } from "@/lib/data";
import CardsGrid from "@/components/panel/CardsGrid";
import ActionButton from "@/components/panel/ActionButton";
import CareerHeader from "@/components/panel/CareerHeader";
import { createCareerSubcardAction } from "@/app/panel/actions";

export default async function CareerDetailPage({
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
  const { clientes, objeciones } = getFilterTags();
  const allTags = [...clientes, ...objeciones];

  return (
    <div className="rounded-lg border border-line bg-surface p-5 shadow-sm">
      <CareerHeader career={career} />
      <ActionButton
        action={createCareerSubcardAction.bind(null, career.id)}
        label="➕ Agregar Ficha / Argumento Especial"
      />
      <CardsGrid
        cards={cards}
        allTags={allTags}
        labelPrefix="Argumento de Venta"
        emptyMessage="No hay argumentos registrados para esta carrera."
        deleteConfirmMessage="¿Eliminar este argumento de la carrera?"
      />
    </div>
  );
}
