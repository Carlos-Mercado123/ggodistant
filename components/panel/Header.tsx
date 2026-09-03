"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { logoutAction } from "@/app/panel/actions";

const TABS = [
  { href: "/panel/universidad", label: "🏛️ Universidad", match: "/panel/universidad" },
  { href: "/panel/modalidad", label: "💻 Modalidad Distancia", match: "/panel/modalidad" },
  { href: "/panel/carreras", label: "🎓 Carreras", match: "/panel/carreras" },
];

export default function Header({ username }: { username: string }) {
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
    <header className="sticky top-0 z-20 border-b border-line bg-surface-subtle shadow-sm">
      <div className="mx-auto flex max-w-[1500px] flex-col gap-3 px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between border-b border-line pb-2">
          <p className="text-sm font-bold tracking-wide text-ink">
            CGO Distancia <span className="text-brand">Huancayo (HYO)</span>
          </p>
          <div className="flex items-center gap-3">
            <Link
              href="/consulta/universidad"
              className="text-[11px] font-bold text-ink-muted underline-offset-2 hover:text-brand hover:underline"
            >
              👀 Ver como vendedor
            </Link>
            <a
              href="/panel/export"
              className="rounded-md bg-brand px-3 py-1.5 text-[11px] font-bold text-white transition hover:opacity-90"
            >
              📤 Exportar (.json)
            </a>
            <span className="text-xs text-ink-muted">{username}</span>
            <form action={logoutAction}>
              <button
                type="submit"
                className="rounded-md border border-line px-3 py-1.5 text-[11px] font-bold text-ink-muted transition hover:border-danger hover:text-danger"
              >
                Salir
              </button>
            </form>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <nav className="flex flex-wrap gap-2">
            {TABS.map((tab) => {
              const active = pathname.startsWith(tab.match);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                    active
                      ? "border-brand bg-brand text-white"
                      : "border-line bg-surface text-ink-muted hover:border-accent"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <div className="w-full max-w-[340px]">
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="🔍 Buscar palabra clave en tiempo real..."
              className="w-full rounded-full border border-line bg-surface px-3 py-1.5 text-xs text-ink outline-none focus:border-accent"
            />
          </div>
        </div>
      </div>
    </header>
  );
}
