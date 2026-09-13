"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

type CheckinAction = (formData: FormData) => void;

export type PrimaryAction = {
  kind: "embarque" | "entrega";
  label: string;
  confirmTitle: string;
  confirmButton: string;
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function ConfirmSubmitButton({ label }: { label: string }) {
  // useFormStatus só enxerga o form quando usado num componente FILHO
  // dele — por isso esse botão é extraído em vez de ficar direto no
  // StudentCheckinCard.
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
    >
      {pending ? "Enviando..." : label}
    </button>
  );
}

export function StudentCheckinCard({
  studentName,
  pickupAddress,
  photoUrl,
  statusBadge,
  stage,
  ringClassName,
  primaryAction,
  showAusenteButton,
  embarcarAction,
  entregarAction,
  ausenteAction,
}: {
  studentName: string;
  pickupAddress: string | null;
  photoUrl: string | null;
  statusBadge: React.ReactNode;
  // Chave opaca que muda a cada etapa do turno (ida → escola → volta →
  // casa) — só serve pra fechar o modal quando o servidor confirmar o
  // avanço; o conteúdo em si vem de `stage` na página, não daqui.
  stage: string;
  // Cor da borda do avatar (ex.: "border-amber") — reflete a etapa
  // atual do aluno na linha do tempo da rota.
  ringClassName: string;
  primaryAction: PrimaryAction | null;
  showAusenteButton: boolean;
  embarcarAction: CheckinAction;
  entregarAction: CheckinAction;
  ausenteAction: CheckinAction;
}) {
  const [confirming, setConfirming] = useState<"primary" | "ausente" | null>(
    null,
  );

  // Fecha o modal só quando o servidor de fato confirmar a mudança de
  // etapa (essa prop só muda depois que a Server Action + revalidatePath
  // trazem o novo status) — nunca no clique em si. Fechar no clique
  // desmontava o <form> na mesma hora que o navegador tentava enviá-lo,
  // então às vezes o check-in nunca chegava a ser registrado.
  const isFirstRender = useRef(true);
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    setConfirming(null);
  }, [stage]);

  const primaryFormAction =
    primaryAction?.kind === "embarque" ? embarcarAction : entregarAction;

  return (
    <>
      <div className="flex flex-1 gap-3">
        <div
          className={`relative z-10 h-11 w-11 shrink-0 overflow-hidden rounded-pill border-2 bg-blue/10 ${ringClassName}`}
        >
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={studentName}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-heading text-sm font-semibold text-blue">
              {initials(studentName)}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col gap-1 pt-0.5">
          <span className="font-medium text-navy">{studentName}</span>
          {pickupAddress && (
            <span className="text-xs text-muted">{pickupAddress}</span>
          )}
          {statusBadge}

          {(primaryAction || showAusenteButton) && (
            <div className="mt-1 flex gap-2">
              {primaryAction && (
                <button
                  type="button"
                  onClick={() => setConfirming("primary")}
                  className={`rounded-pill px-3 py-1.5 text-xs font-semibold text-white transition hover:opacity-90 ${
                    primaryAction.kind === "embarque" ? "bg-mint" : "bg-navy"
                  }`}
                >
                  {primaryAction.label}
                </button>
              )}
              {showAusenteButton && (
                <button
                  type="button"
                  onClick={() => setConfirming("ausente")}
                  className="rounded-pill border border-coral px-3 py-1.5 text-xs font-semibold text-coral transition hover:opacity-90"
                >
                  Ausente
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {confirming && (
        <div className="fixed inset-0 z-30 flex items-end justify-center bg-navy/40 px-4 pb-6 sm:items-center">
          <div className="flex w-full max-w-sm flex-col items-center gap-4 rounded-card bg-surface p-6 shadow-card">
            <div className="h-24 w-24 overflow-hidden rounded-pill bg-blue/10">
              {photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photoUrl}
                  alt={studentName}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center font-heading text-2xl font-semibold text-blue">
                  {initials(studentName)}
                </div>
              )}
            </div>

            <div className="flex flex-col items-center gap-1 text-center">
              <span className="font-heading text-lg font-bold text-navy">
                {studentName}
              </span>
              <span className="text-sm text-muted">
                {confirming === "ausente"
                  ? "Marcar como ausente"
                  : primaryAction?.confirmTitle}
              </span>
            </div>

            <form
              action={
                confirming === "ausente" ? ausenteAction : primaryFormAction
              }
              className="flex w-full flex-col gap-3"
            >
              <label className="flex flex-col gap-1 text-left text-sm text-text">
                Alguma ocorrência? (opcional)
                <textarea
                  name="occurrence"
                  rows={2}
                  placeholder="Ex.: esqueceu a mochila, chegou chorando..."
                  className="rounded-input border border-border bg-bg px-3 py-2 text-sm outline-none focus:border-blue"
                />
              </label>
              <ConfirmSubmitButton
                label={
                  confirming === "ausente"
                    ? "Confirmar ausência"
                    : (primaryAction?.confirmButton ?? "Confirmar")
                }
              />
            </form>
            <button
              type="button"
              onClick={() => setConfirming(null)}
              className="text-sm text-muted"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </>
  );
}
