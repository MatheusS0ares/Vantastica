"use client";

import { useEffect, useState } from "react";

/**
 * Usado pra alternar entre Drawer (folha que sobe de baixo, melhor no
 * celular) e Dialog (modal centralizado, melhor com mouse) conforme o
 * tamanho da tela — o mesmo padrão que o shadcn/ui documenta pra esse
 * caso exato de modal responsivo.
 */
export function useMediaQuery(query: string): boolean {
  // Inicializa já com o valor certo (em vez de setState dentro do
  // efeito) — evita uma renderização extra e o aviso do lint de
  // "setState síncrono num efeito".
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia(query).matches,
  );

  useEffect(() => {
    // Só assina mudanças daqui em diante — o valor inicial já vem do
    // useState acima, então não precisa (nem deve) chamar setState de
    // forma síncrona aqui dentro.
    const mediaQueryList = window.matchMedia(query);
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches);
    mediaQueryList.addEventListener("change", listener);
    return () => mediaQueryList.removeEventListener("change", listener);
  }, [query]);

  return matches;
}
