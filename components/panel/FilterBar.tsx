"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import {
  createFilterTagAction,
  deleteFilterTagAction,
} from "@/app/panel/actions";
import type { Tag } from "@/lib/types";

export default function FilterBar({
  clientes,
  objeciones,
}: {
  clientes: Tag[];
  objeciones: Tag[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const activeTag = (searchParams.get("tag") ?? "").toLowerCase();

  function toggleTag(label: string) {
    const normalized = label.toLowerCase();
    const params = new URLSearchParams(searchParams.toString());
    if (activeTag === normalized) {
      params.delete("tag");
    } else {
      params.set("tag", normalized);
    }
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  function clearFilters() {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    params.delete("q");
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`);
    });
  }

  return (
    <details className="border-b border-line bg-surface-subtle">
      <summary className="mx-auto max-w-[1500px] cursor-pointer select-none px-4 py-3 text-xs font-bold uppercase tracking-wide text-brand outline-none sm:px-6">
        🎯 Panel de Filtros Comerciales (Click para expandir / contraer)
      </summary>
      <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-4 pb-4 sm:px-6">
        <FilterRow
          label="🎯 Tipo Cliente:"
          tags={clientes}
          activeTag={activeTag}
          icon="👤"
          category="cliente"
          onToggle={toggleTag}
        />
        <FilterRow
          label="🛡️ Objeciones:"
          tags={objeciones}
          activeTag={activeTag}
          icon="🛡️"
          category="objecion"
          onToggle={toggleTag}
          trailing={
            <button
              type="button"
              onClick={clearFilters}
              className="ml-auto rounded-md border border-danger bg-red-50 px-3 py-1 text-[11px] font-bold text-danger transition hover:bg-danger hover:text-white"
            >
              ❌ Quitar Filtros
            </button>
          }
        />
      </div>
    </details>
  );
}

function FilterRow({
  label,
  tags,
  activeTag,
  icon,
  category,
  onToggle,
  trailing,
}: {
  label: string;
  tags: Tag[];
  activeTag: string;
  icon: string;
  category: "cliente" | "objecion";
  onToggle: (label: string) => void;
  trailing?: React.ReactNode;
}) {
  const [adding, setAdding] = useState(false);
  const [value, setValue] = useState("");

  async function handleAdd() {
    if (!value.trim()) {
      setAdding(false);
      return;
    }
    await createFilterTagAction(category, value.trim());
    setValue("");
    setAdding(false);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="w-[120px] text-[11px] font-bold uppercase text-ink-muted">{label}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <div
            key={tag.id}
            onClick={() => onToggle(tag.label)}
            className={`flex cursor-pointer items-center gap-1.5 rounded border px-2.5 py-1 text-[11px] transition ${
              activeTag === tag.label.toLowerCase()
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink hover:border-accent"
            }`}
          >
            {icon} {tag.label}
            <span
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`¿Eliminar el criterio "${tag.label}"?`)) {
                  deleteFilterTagAction(tag.id);
                }
              }}
              className="font-bold text-danger"
            >
              ✕
            </span>
          </div>
        ))}
        {adding ? (
          <input
            autoFocus
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleAdd}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAdd();
              if (e.key === "Escape") setAdding(false);
            }}
            className="w-32 rounded border border-accent bg-surface px-2 py-1 text-[11px] outline-none"
          />
        ) : (
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="rounded border border-dashed border-accent px-2 py-1 text-[11px] font-bold text-brand hover:bg-accent/5"
          >
            ➕ Agregar
          </button>
        )}
      </div>
      {trailing}
    </div>
  );
}
