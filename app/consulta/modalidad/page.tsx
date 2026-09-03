import { getCardsBySection, filterCards } from "@/lib/data";
import CardsGrid from "@/components/consulta/CardsGrid";

export default async function ConsultaModalidadPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const cards = filterCards(getCardsBySection("modalidad"), { q, tag });

  return (
    <CardsGrid cards={cards} labelPrefix="Ficha" emptyMessage="No hay elementos registrados." />
  );
}
