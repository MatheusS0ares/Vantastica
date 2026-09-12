"use client";

import { useState } from "react";

type CheckinAction = (formData: FormData) => void;

type ConfirmKind = "embarque" | "entrega" | "ausente";

const CONFIRM_COPY: Record<ConfirmKind, { title: string; button: string }> = {
  embarque: { title: "Confirmar embarque", button: "Confirmar embarque" },
  entrega: { title: "Confirmar entrega", button: "Confirmar entrega" },
  ausente: { title: "Marcar como ausente", button: "Confirmar ausência" },
};

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function StudentCheckinCard({
  studentName,
  pickupAddress,
  photoUrl,
  statusBadge,
  embarcarAction,
  entregarAction,
  ausenteAction,
  showColetarButtons,
  showEntregarButton,
}: {
  studentName: string;
  pickupAddress: string | null;
  photoUrl: string | null;
  statusBadge: React.ReactNode;
  embarcarAction: CheckinAction;
  entregarAction: CheckinAction;
  ausenteAction: CheckinAction;
  showColetarButtons: boolean;
  showEntregarButton: boolean;
}) {
  const [confirming, setConfirming] = useState<ConfirmKind | null>(null);

  const actionFor: Record<ConfirmKind, CheckinAction> = {
    embarque: embarcarAction,
    entrega: entregarAction,
    ausente: ausenteAction,
  };

  return (
    <>
      <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="font-medium text-navy">{studentName}</span>
            {pickupAddress && (
              <span className="text-sm text-muted">{pickupAddress}</span>
            )}
          </div>
          {statusBadge}
        </div>

        {showColetarButtons && (
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setConfirming("embarque")}
              className="flex-1 rounded-pill bg-mint px-4 py-3 font-medium text-white transition hover:opacity-90"
            >
              Coletar
            </button>
            <button
              type="button"
              onClick={() => setConfirming("ausente")}
              className="flex-1 rounded-pill border border-coral px-4 py-3 font-medium text-coral transition hover:opacity-90"
            >
              Ausente
            </button>
          </div>
        )}

        {showEntregarButton && (
          <button
            type="button"
            onClick={() => setConfirming("entrega")}
            className="w-full rounded-pill bg-navy px-4 py-3 font-medium text-white transition hover:opacity-90"
          >
            Confirmar entrega
          </button>
        )}
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
                {CONFIRM_COPY[confirming].title}
              </span>
            </div>

            <form action={actionFor[confirming]} className="w-full">
              <button
                type="submit"
                onClick={() => setConfirming(null)}
                className="w-full rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
              >
                {CONFIRM_COPY[confirming].button}
              </button>
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
