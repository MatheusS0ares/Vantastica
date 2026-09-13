"use client";

import { useState } from "react";

export function CopyInviteLink({
  token,
  path = "/convite",
}: {
  token: string;
  path?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const url = `${window.location.origin}${path}/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard indisponível (ex.: navegador antigo) — nada a fazer,
      // o link continua acessível se o motorista digitar manualmente.
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-pill border border-blue px-4 py-2 text-sm font-medium text-blue transition hover:opacity-80"
    >
      {copied ? "Link copiado!" : "Copiar link de convite"}
    </button>
  );
}
