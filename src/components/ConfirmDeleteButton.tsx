"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";

/**
 * Botão de excluir com confirmação antes de agir — evita que um toque
 * sem querer (bem comum no celular, listas roladas rápido) dispare uma
 * exclusão direto. O botão continua submetendo a mesma Server Action de
 * sempre, só que agora depois de um "tem certeza?" no meio do caminho.
 */
export function ConfirmDeleteButton({
  formAction,
  triggerLabel,
  title,
  description,
  confirmLabel = "Remover",
}: {
  formAction: (formData: FormData) => void;
  triggerLabel: string;
  title: string;
  description: string;
  confirmLabel?: string;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button type="button" className="text-sm text-coral">
          {triggerLabel}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle className="font-heading text-lg font-bold text-navy">
          {title}
        </AlertDialogTitle>
        <AlertDialogDescription className="text-sm text-muted">
          {description}
        </AlertDialogDescription>
        <form action={formAction} className="flex gap-3 pt-2">
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction>{confirmLabel}</AlertDialogAction>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
