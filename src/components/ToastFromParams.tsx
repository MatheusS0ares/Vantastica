"use client";

import { Suspense, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

/**
 * As Server Actions confirmam sucesso/erro redirecionando com
 * ?error=/?success=/?notice= na URL. Em vez de cada página desenhar seu
 * próprio banner inline, esse componente lê esses parâmetros uma vez,
 * dispara o toast correspondente e limpa a URL — sem mexer no padrão de
 * redirect que as actions já usam.
 *
 * useSearchParams() exige um limite de Suspense pra não bloquear a
 * pré-renderização estática das páginas que não têm mais nenhum outro
 * dado dinâmico (ex.: /login, /cadastro) — embutido aqui pra quem usa o
 * componente não precisar lembrar disso.
 */
export function ToastFromParams() {
  return (
    <Suspense fallback={null}>
      <ToastFromParamsInner />
    </Suspense>
  );
}

function ToastFromParamsInner() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const error = searchParams.get("error");
    const success = searchParams.get("success");
    const notice = searchParams.get("notice");
    if (!error && !success && !notice) return;

    if (error) toast.error(error);
    if (success) toast.success(success);
    if (notice) toast.message(notice);

    const params = new URLSearchParams(searchParams);
    params.delete("error");
    params.delete("success");
    params.delete("notice");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, {
      scroll: false,
    });
    // Só na primeira renderização com esses parâmetros — não em toda
    // mudança de searchParams (senão re-dispararia o toast ao navegar).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
