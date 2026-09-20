"use client";

import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog";

export const AlertDialog = AlertDialogPrimitive.Root;
export const AlertDialogTrigger = AlertDialogPrimitive.Trigger;
export const AlertDialogTitle = AlertDialogPrimitive.Title;
export const AlertDialogDescription = AlertDialogPrimitive.Description;

export function AlertDialogContent({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AlertDialogPrimitive.Portal>
      <AlertDialogPrimitive.Overlay className="dialog-overlay fixed inset-0 z-30 bg-navy/40" />
      <AlertDialogPrimitive.Content className="dialog-content fixed left-1/2 top-1/2 z-30 flex w-full max-w-sm flex-col gap-4 rounded-card bg-surface p-6 shadow-card outline-none">
        {children}
      </AlertDialogPrimitive.Content>
    </AlertDialogPrimitive.Portal>
  );
}

export function AlertDialogCancel({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AlertDialogPrimitive.Cancel
      type="button"
      className="flex-1 rounded-pill border border-border px-6 py-3 font-medium text-navy transition hover:opacity-90"
    >
      {children}
    </AlertDialogPrimitive.Cancel>
  );
}

export function AlertDialogAction({
  children,
  className = "bg-coral text-white",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  // type="submit" por padrão: o uso desse componente no projeto é
  // sempre "confirmar e enviar o form da Server Action por trás" —
  // nunca uma ação só no cliente.
  return (
    <AlertDialogPrimitive.Action
      type="submit"
      className={`flex-1 rounded-pill px-6 py-3 font-medium transition hover:opacity-90 ${className}`}
    >
      {children}
    </AlertDialogPrimitive.Action>
  );
}
