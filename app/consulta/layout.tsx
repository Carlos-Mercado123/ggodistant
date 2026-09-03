import { Suspense } from "react";
import { getFilterTags } from "@/lib/data";
import Header from "@/components/consulta/Header";
import FilterBar from "@/components/consulta/FilterBar";

export default async function ConsultaLayout({ children }: { children: React.ReactNode }) {
  const { clientes, objeciones } = getFilterTags();

  return (
    <div className="theme-academic flex min-h-full flex-1 flex-col bg-canvas text-ink">
      <Suspense fallback={<div className="h-[96px] border-b border-line bg-surface-subtle" />}>
        <Header />
      </Suspense>
      <Suspense fallback={null}>
        <FilterBar clientes={clientes} objeciones={objeciones} />
      </Suspense>
      <main className="mx-auto w-full max-w-[1200px] flex-1 px-4 py-8 sm:px-8">{children}</main>
    </div>
  );
}
