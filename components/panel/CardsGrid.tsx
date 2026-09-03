import CardItem from "@/components/panel/CardItem";
import type { Card, Tag } from "@/lib/types";

export default function CardsGrid({
  cards,
  allTags,
  labelPrefix,
  emptyMessage,
  deleteConfirmMessage,
}: {
  cards: Card[];
  allTags: Tag[];
  labelPrefix: string;
  emptyMessage: string;
  deleteConfirmMessage: string;
}) {
  if (cards.length === 0) {
    return <p className="text-sm text-ink-muted">{emptyMessage}</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 [grid-template-columns:repeat(auto-fit,minmax(360px,1fr))]">
      {cards.map((card, index) => (
        <CardItem
          key={card.id}
          card={card}
          allTags={allTags}
          label={`${labelPrefix} #${index + 1}`}
          onDeleteConfirm={deleteConfirmMessage}
        />
      ))}
    </div>
  );
}
