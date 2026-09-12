"use client";

import { useState } from "react";

export function CopyText({
  text,
  label = "Copiar",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponível — sem problema, o valor já está visível
      // na tela pra copiar manualmente.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-pill border border-blue px-4 py-2 text-sm font-medium text-blue transition hover:opacity-80"
    >
      {copied ? "Copiado!" : label}
    </button>
  );
}
