"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
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
  const hasActiveFilters = Boolean(activeTag || searchParams.get("q"));

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
      <summary className="mx-auto max-w-[1200px] cursor-pointer select-none px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted outline-none sm:px-8">
        Filtros de segmentación
      </summary>
      <div className="mx-auto flex max-w-[1200px] flex-col gap-3 px-4 pb-5 sm:px-8">
        <FilterRow label="Perfil del estudiante" tags={clientes} activeTag={activeTag} onToggle={toggleTag} />
        <FilterRow
          label="Objeciones frecuentes"
          tags={objeciones}
          activeTag={activeTag}
          onToggle={toggleTag}
          trailing={
            hasActiveFilters ? (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-[11px] font-medium text-danger underline-offset-2 hover:underline"
              >
                Quitar filtros
              </button>
            ) : undefined
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
  onToggle,
  trailing,
}: {
  label: string;
  tags: Tag[];
  activeTag: string;
  onToggle: (label: string) => void;
  trailing?: React.ReactNode;
}) {
  if (tags.length === 0 && !trailing) return null;

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="w-[160px] text-[11px] font-semibold uppercase tracking-wide text-ink-muted">
        {label}
      </div>
      <div className="flex flex-wrap items-center gap-1.5">
        {tags.map((tag) => (
          <button
            key={tag.id}
            type="button"
            onClick={() => onToggle(tag.label)}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium transition ${
              activeTag === tag.label.toLowerCase()
                ? "border-accent bg-accent text-white"
                : "border-line bg-surface text-ink-muted hover:border-accent hover:text-ink"
            }`}
          >
            {tag.label}
          </button>
        ))}
      </div>
      {trailing}
    </div>
  );
}
