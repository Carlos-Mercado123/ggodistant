import CardView from "@/components/consulta/CardView";
import type { Card } from "@/lib/types";

export default function CardsGrid({
  cards,
  labelPrefix,
  emptyMessage,
}: {
  cards: Card[];
  labelPrefix: string;
  emptyMessage: string;
}) {
  if (cards.length === 0) {
    return <p className="text-sm italic text-ink-muted">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-5 [grid-template-columns:repeat(auto-fit,minmax(380px,1fr))]">
      {cards.map((card, index) => (
        <CardView key={card.id} card={card} label={`${labelPrefix} #${index + 1}`} />
      ))}
    </div>
  );
}
