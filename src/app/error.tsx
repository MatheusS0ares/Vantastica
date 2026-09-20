"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt=""
        aria-hidden
        className="h-14 w-14 rounded-2xl"
      />
      <div className="flex flex-col gap-1">
        <h1 className="font-heading text-xl font-semibold text-navy">
          Algo deu errado
        </h1>
        <p className="max-w-xs text-sm text-muted">
          Não conseguimos carregar essa tela agora. Tenta de novo — se
          continuar, avisa a gente.
        </p>
      </div>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-pill bg-navy px-6 py-3 font-medium text-white shadow-card transition hover:opacity-90"
        >
          Tentar de novo
        </button>
      </div>
    </div>
  );
}
