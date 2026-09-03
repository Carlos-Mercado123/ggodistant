"use client";

import { useState } from "react";
import {
  addTagToCardAction,
  deleteCardAction,
  moveCardAction,
  removeTagFromCardAction,
  updateCardFieldAction,
} from "@/app/panel/actions";
import CopyButton from "@/components/CopyButton";
import type { Card, Tag } from "@/lib/types";

function EditableField({
  cardId,
  field,
  value,
  className,
  rows,
  placeholder,
}: {
  cardId: number;
  field: "title" | "concept" | "speech" | "links";
  value: string;
  className: string;
  rows: number;
  placeholder?: string;
}) {
  const [text, setText] = useState(value);

  return (
    <textarea
      value={text}
      rows={rows}
      placeholder={placeholder}
      onChange={(e) => setText(e.target.value)}
      onBlur={() => {
        if (text.trim() !== value.trim()) {
          updateCardFieldAction(cardId, field, text);
        }
      }}
      className={`w-full resize-none whitespace-pre-wrap bg-transparent outline-none placeholder:text-ink-muted/60 ${className}`}
    />
  );
}

function TagSelector({ card, allTags }: { card: Card; allTags: Tag[] }) {
  const assignedIds = new Set(card.tags.map((t) => t.id));
  const available = allTags.filter((t) => !assignedIds.has(t.id));
  const clientes = available.filter((t) => t.category === "cliente");
  const objeciones = available.filter((t) => t.category === "objecion");

  return (
    <details className="mt-auto rounded-md border border-line bg-surface-subtle px-2 py-1.5">
      <summary className="cursor-pointer text-[11px] font-bold text-ink-muted">
        🏷️ Vincular Filtros / Etiquetas
      </summary>
      <div className="mt-1.5 border-t border-dashed border-line pt-1.5">
        <div className="mb-1.5 flex min-h-[16px] flex-wrap gap-1">
          {card.tags.length === 0 ? (
            <span className="text-[10px] text-ink-muted">Sin filtros vinculados</span>
          ) : (
            card.tags.map((tag) => (
              <span
                key={tag.id}
                className="inline-flex items-center gap-1 rounded border border-line bg-surface px-1.5 py-0.5 text-[10px] text-ink-muted"
              >
                {tag.label}
                <span
                  onClick={() => removeTagFromCardAction(card.id, tag.id)}
                  className="cursor-pointer font-bold text-danger"
                >
                  ✕
                </span>
              </span>
            ))
          )}
        </div>
        <select
          value=""
          onChange={(e) => {
            const tagId = Number(e.target.value);
            if (tagId) addTagToCardAction(card.id, tagId);
          }}
          className="w-full rounded border border-line bg-surface px-1.5 py-1 text-[11px] text-ink outline-none"
        >
          <option value="" disabled>
            🏷️ Categorizar (Asignar Tipo/Objeción)
          </option>
          {clientes.length > 0 && (
            <optgroup label="👤 Tipos de Cliente">
              {clientes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          )}
          {objeciones.length > 0 && (
            <optgroup label="🛡️ Objeciones">
              {objeciones.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.label}
                </option>
              ))}
            </optgroup>
          )}
        </select>
      </div>
    </details>
  );
}

export default function CardItem({
  card,
  allTags,
  label,
  onDeleteConfirm,
}: {
  card: Card;
  allTags: Tag[];
  label: string;
  onDeleteConfirm: string;
}) {
  return (
    <div className="flex flex-col rounded-lg border border-line bg-surface p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between border-b border-line pb-1.5">
        <span className="text-[10px] font-bold text-ink-muted">{label}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => moveCardAction(card.id, -1)}
            className="rounded bg-surface-subtle px-2 py-0.5 text-[11px] text-ink-muted hover:bg-brand hover:text-white"
          >
            ◀
          </button>
          <button
            type="button"
            onClick={() => moveCardAction(card.id, 1)}
            className="rounded bg-surface-subtle px-2 py-0.5 text-[11px] text-ink-muted hover:bg-brand hover:text-white"
          >
            ▶
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(onDeleteConfirm)) deleteCardAction(card.id);
            }}
            className="rounded bg-surface-subtle px-2 py-0.5 text-[11px] font-bold text-danger hover:bg-danger hover:text-white"
          >
            ✕
          </button>
        </div>
      </div>

      <EditableField
        cardId={card.id}
        field="title"
        value={card.title}
        rows={1}
        className="mb-1.5 text-sm font-bold text-brand"
      />
      <EditableField
        cardId={card.id}
        field="concept"
        value={card.concept}
        rows={3}
        className="mb-3 min-h-[35px] text-[12.5px] text-ink"
      />

      <div className="relative mb-3 rounded-md border-l-4 border-bubble-border bg-bubble p-3 shadow-sm">
        <div className="mb-1 text-[10.5px] font-bold uppercase text-brand">💬 Speech Comercial</div>
        <EditableField
          cardId={card.id}
          field="speech"
          value={card.speech}
          rows={5}
          className="pr-12 text-[13px] text-ink"
        />
        <CopyButton text={card.speech} />
      </div>

      <details className="mb-2.5 rounded-md border border-line bg-surface-subtle p-1.5">
        <summary className="cursor-pointer text-[11px] font-bold text-ink-muted">
          🔗 Páginas Web de Referencia
        </summary>
        <div className="mt-1.5 border-t border-dashed border-line pt-1.5">
          <EditableField
            cardId={card.id}
            field="links"
            value={card.links}
            rows={2}
            placeholder="Clic para añadir enlaces de referencia..."
            className="text-[11px] break-all text-link"
          />
        </div>
      </details>

      <TagSelector card={card} allTags={allTags} />
    </div>
  );
}
