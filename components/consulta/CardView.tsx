import CopyButton from "@/components/CopyButton";
import type { Card } from "@/lib/types";

export default function CardView({ card, label }: { card: Card; label: string }) {
  return (
    <article className="flex flex-col border border-line bg-surface p-6 shadow-[0_1px_2px_rgba(30,35,48,0.04)]">
      <span className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
        {label}
      </span>

      <h3 className="mb-2 whitespace-pre-wrap font-serif text-lg font-semibold leading-snug text-brand">
        {card.title}
      </h3>
      <p className="mb-5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-muted">
        {card.concept}
      </p>

      <div className="relative mb-4 border-l-2 border-bubble-border bg-bubble py-3 pl-4 pr-14">
        <p className="whitespace-pre-wrap font-serif text-[14px] italic leading-relaxed text-ink">
          {card.speech}
        </p>
        <CopyButton
          text={card.speech}
          positionClassName="absolute bottom-2.5 right-2.5"
          variant="outline"
        />
      </div>

      {card.links.trim() && (
        <details className="mb-3 border-t border-line pt-2 text-[11px]">
          <summary className="cursor-pointer font-medium text-ink-muted">
            Referencias documentales
          </summary>
          <div className="mt-1.5 whitespace-pre-wrap break-all text-link">{card.links}</div>
        </details>
      )}

      {card.tags.length > 0 && (
        <div className="mt-auto flex flex-wrap gap-1.5 border-t border-line pt-3">
          {card.tags.map((tag) => (
            <span
              key={tag.id}
              className="rounded-full border border-line px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-ink-muted"
            >
              {tag.label}
            </span>
          ))}
        </div>
      )}
    </article>
  );
}
