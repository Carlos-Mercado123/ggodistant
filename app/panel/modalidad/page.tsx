import { getCardsBySection, getFilterTags, filterCards } from "@/lib/data";
import CardsGrid from "@/components/panel/CardsGrid";
import ActionButton from "@/components/panel/ActionButton";
import { createGenericCardAction } from "@/app/panel/actions";

export default async function ModalidadPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; tag?: string }>;
}) {
  const { q, tag } = await searchParams;
  const cards = filterCards(getCardsBySection("modalidad"), { q, tag });
  const { clientes, objeciones } = getFilterTags();
  const allTags = [...clientes, ...objeciones];

  return (
    <div>
      <ActionButton
        action={createGenericCardAction.bind(null, "modalidad")}
        label="➕ Agregar Nueva Propuesta"
      />
      <CardsGrid
        cards={cards}
        allTags={allTags}
        labelPrefix="Ficha"
        emptyMessage="No hay elementos registrados."
        deleteConfirmMessage="¿Eliminar este argumento permanentemente?"
      />
    </div>
  );
}
