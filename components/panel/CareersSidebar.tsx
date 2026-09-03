"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createCareerAction } from "@/app/panel/actions";
import type { Career } from "@/lib/types";

export default function CareersSidebar({ careers }: { careers: Career[] }) {
  const pathname = usePathname();
  const activeSlug = pathname.split("/").pop();
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState("");
  const [pending, setPending] = useState(false);

  async function handleCreate() {
    if (!name.trim()) {
      setCreating(false);
      return;
    }
    setPending(true);
    await createCareerAction(name.trim());
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-lg border border-line bg-surface p-2.5 shadow-sm">
      <div className="mb-2 pl-1 text-[11px] font-bold uppercase text-accent">Índice (A-Z)</div>
      <div className="mb-2.5 flex-1 overflow-y-auto">
        {careers.length === 0 && (
          <p className="px-2 text-xs text-ink-muted">Aún no hay carreras registradas.</p>
        )}
        {careers.map((career) => (
          <Link
            key={career.id}
            href={`/panel/carreras/${career.slug}`}
            className={`mb-0.5 block rounded px-2.5 py-2 text-xs font-medium ${
              career.slug === activeSlug
                ? "border-l-4 border-brand bg-[#e1f3ef] text-brand"
                : "text-ink hover:bg-surface-subtle"
            }`}
          >
            🎓 {career.name}
          </Link>
        ))}
      </div>

      {creating ? (
        <div className="flex flex-col gap-1.5">
          <input
            autoFocus
            value={name}
            disabled={pending}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleCreate();
              if (e.key === "Escape") setCreating(false);
            }}
            placeholder="Nombre de la carrera..."
            className="rounded-md border border-accent bg-surface px-2 py-1.5 text-xs outline-none"
          />
          <button
            type="button"
            disabled={pending}
            onClick={handleCreate}
            className="rounded-md bg-brand px-3 py-1.5 text-xs font-bold text-white hover:bg-accent disabled:opacity-60"
          >
            {pending ? "Creando..." : "Confirmar"}
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setCreating(true)}
          className="w-full rounded-md bg-brand px-4 py-2 text-xs font-bold text-white hover:bg-accent"
        >
          ➕ Crear Nueva Carrera
        </button>
      )}
    </div>
  );
}
