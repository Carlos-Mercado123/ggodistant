"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";

const TABS = [
  { href: "/consulta/universidad", label: "La Universidad", match: "/consulta/universidad" },
  { href: "/consulta/modalidad", label: "Modalidad a Distancia", match: "/consulta/modalidad" },
  { href: "/consulta/carreras", label: "Carreras", match: "/consulta/carreras" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const urlQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(urlQuery);
  const [syncedQuery, setSyncedQuery] = useState(urlQuery);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  if (urlQuery !== syncedQuery) {
    setSyncedQuery(urlQuery);
    setQuery(urlQuery);
  }

  function handleSearchChange(value: string) {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (value.trim()) {
        params.set("q", value.trim());
      } else {
        params.delete("q");
      }
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`);
      });
    }, 250);
  }

  return (
    <header className="sticky top-0 z-20 border-b border-line bg-surface">
      <div className="mx-auto flex max-w-[1200px] flex-col gap-5 px-4 pb-5 pt-6 sm:px-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.25em] text-accent">
              Universidad Continental · Sede Huancayo
            </p>
            <h1 className="mt-1 font-serif text-2xl font-semibold text-brand">
              Propuesta de Valor Académica
            </h1>
            <p className="mt-1 text-xs text-ink-muted">
              Argumentario oficial del equipo de admisión a distancia
            </p>
          </div>
          <Link
            href="/login"
            className="whitespace-nowrap text-[11px] font-medium text-ink-muted underline-offset-4 hover:text-brand hover:underline"
          >
            Acceso administrador
          </Link>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-4">
          <nav className="flex flex-wrap gap-6">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.match);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`border-b-2 pb-1 text-[13px] font-medium transition ${
                    active
                      ? "border-accent text-brand"
                      : "border-transparent text-ink-muted hover:text-brand"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="w-full max-w-[300px]">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por palabra clave…"
              className="w-full rounded-sm border border-line bg-surface px-3 py-1.5 text-xs text-ink outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
