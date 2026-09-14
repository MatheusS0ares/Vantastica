"use client";

import { useState } from "react";
import { compressFileInput } from "@/lib/compressImage";

/**
 * Mesmo princípio da foto do aluno: comprime a imagem no navegador antes
 * do envio, já que fotos de logo/van vindas de apps de edição ou geração
 * de imagem costumam vir em vários MB — sem isso, o upload esbarra no
 * limite de tamanho da Server Action e a Vercel devolve um erro genérico
 * de servidor em vez do formulário simplesmente funcionar.
 */
export function CompressedUploadForm({
  action,
  fieldName,
  label,
}: {
  action: (formData: FormData) => void;
  fieldName: string;
  label: string;
}) {
  const [compressing, setCompressing] = useState(false);

  return (
    <form action={action} className="flex flex-1 flex-col gap-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <input
        type="file"
        name={fieldName}
        accept="image/*"
        className="text-sm"
        onChange={async (event) => {
          setCompressing(true);
          await compressFileInput(event.currentTarget);
          setCompressing(false);
        }}
      />
      <button
        type="submit"
        disabled={compressing}
        className="w-fit rounded-pill border border-blue px-4 py-1.5 text-xs font-medium text-blue transition hover:opacity-80 disabled:opacity-50"
      >
        {compressing ? "Preparando..." : "Enviar"}
      </button>
    </form>
  );
}
