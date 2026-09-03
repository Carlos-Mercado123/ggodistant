import { Suspense } from "react";
import { verifySession } from "@/lib/dal";
import { getFilterTags } from "@/lib/data";
import Header from "@/components/panel/Header";
import FilterBar from "@/components/panel/FilterBar";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await verifySession();
  const { clientes, objeciones } = getFilterTags();

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <Suspense fallback={<div className="h-[112px] border-b border-line bg-surface-subtle" />}>
        <Header username={session.username} />
      </Suspense>
      <Suspense fallback={null}>
        <FilterBar clientes={clientes} objeciones={objeciones} />
      </Suspense>
      <main className="mx-auto w-full max-w-[1500px] flex-1 px-4 py-5 sm:px-6">{children}</main>
    </div>
  );
}
