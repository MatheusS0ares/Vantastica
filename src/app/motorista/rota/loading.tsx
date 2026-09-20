import { Skeleton } from "@/components/ui/skeleton";

/**
 * Aparece automaticamente (Suspense do Next.js) enquanto o servidor
 * busca os dados do turno — inclusive ao trocar de aba, já que isso é
 * uma navegação (?turno=X) que precisa de um novo round-trip. Sem isso,
 * a tela ficava "presa" no conteúdo antigo por um instante e depois
 * pulava pro novo, sem nenhuma pista visual de que algo estava
 * carregando.
 */
export default function LoadingRota() {
  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-6">
      <div className="flex items-center justify-between">
        <Skeleton className="h-7 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>

      <div className="flex gap-2">
        <Skeleton className="h-9 flex-1 rounded-pill" />
        <Skeleton className="h-9 flex-1 rounded-pill" />
        <Skeleton className="h-9 flex-1 rounded-pill" />
      </div>

      <Skeleton className="h-14 w-full rounded-card" />

      <div className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-20" />
        </div>
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex gap-3">
            <Skeleton className="h-11 w-11 shrink-0 rounded-pill" />
            <div className="flex flex-1 flex-col gap-2 pt-0.5">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
