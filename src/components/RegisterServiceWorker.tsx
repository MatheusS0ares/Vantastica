"use client";

import { useEffect } from "react";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (
      process.env.NODE_ENV === "production" &&
      "serviceWorker" in navigator
    ) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // Registro falhou (ex.: navegador sem suporte) — a app segue
        // funcionando normalmente, só sem o modo offline/instalável.
      });
    }
  }, []);

  return null;
}
