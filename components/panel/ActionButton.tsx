"use client";

import { useTransition } from "react";

export default function ActionButton({
  action,
  label,
  className,
}: {
  action: () => Promise<void>;
  label: string;
  className?: string;
}) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(() => action())}
      className={
        className ??
        "mb-4 rounded-md bg-brand px-4 py-2 text-xs font-bold text-white transition hover:bg-accent disabled:opacity-60"
      }
    >
      {pending ? "…" : label}
    </button>
  );
}
