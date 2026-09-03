"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Career } from "@/lib/types";

export default function CareersSidebar({ careers }: { careers: Career[] }) {
  const pathname = usePathname();
  const activeSlug = pathname.split("/").pop();

  return (
    <div className="flex h-[70vh] flex-col border border-line bg-surface p-4">
      <div className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-accent">
        Carreras (A–Z)
      </div>
      <div className="flex-1 overflow-y-auto">
        {careers.length === 0 && (
          <p className="px-1 text-xs text-ink-muted">Aún no hay carreras registradas.</p>
        )}
        {careers.map((career) => (
          <Link
            key={career.id}
            href={`/consulta/carreras/${career.slug}`}
            className={`block border-l-2 px-3 py-2.5 text-[13px] font-medium transition ${
              career.slug === activeSlug
                ? "border-accent bg-surface-subtle text-brand"
                : "border-transparent text-ink-muted hover:border-line hover:text-ink"
            }`}
          >
            {career.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
