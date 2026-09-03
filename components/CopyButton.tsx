"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  positionClassName = "absolute bottom-2 right-2",
  variant = "solid",
}: {
  text: string;
  positionClassName?: string;
  variant?: "solid" | "outline";
}) {
  const [copied, setCopied] = useState(false);

  const variantClassName =
    variant === "outline"
      ? copied
        ? "border border-success text-success"
        : "border border-brand/40 text-brand hover:border-brand hover:bg-brand hover:text-white"
      : `text-white ${copied ? "bg-success" : "bg-brand hover:bg-accent"}`;

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 1000);
      }}
      className={`${positionClassName} rounded px-2 py-1 text-[10px] font-bold transition ${variantClassName}`}
    >
      {copied ? "✓" : "Copiar"}
    </button>
  );
}
