"use client";

import { useState } from "react";
import { deleteCareerAction, renameCareerAction } from "@/app/panel/actions";
import type { Career } from "@/lib/types";

export default function CareerHeader({ career }: { career: Career }) {
  const [name, setName] = useState(career.name);

  return (
    <div className="mb-4 flex items-center justify-between gap-3 border-b-2 border-brand pb-2">
      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        onBlur={() => {
          if (name.trim() && name.trim() !== career.name) {
            renameCareerAction(career.id, name.trim());
          }
        }}
        className="w-full bg-transparent text-lg font-semibold text-ink outline-none"
      />
      <button
        type="button"
        onClick={() => {
          if (confirm(`¿Seguro que deseas eliminar la carrera "${career.name}" por completo?`)) {
            deleteCareerAction(career.id);
          }
        }}
        className="shrink-0 rounded px-2 py-1 text-xs font-bold text-danger hover:bg-red-50"
      >
        ✕ Eliminar Carrera
      </button>
    </div>
  );
}
