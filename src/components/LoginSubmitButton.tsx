"use client";

import { useFormStatus } from "react-dom";
import { LoadingSplash } from "./LoadingSplash";

export function LoginSubmitButton() {
  const { pending } = useFormStatus();

  return (
    <>
      {pending && <LoadingSplash />}
      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90 disabled:opacity-70"
      >
        {pending ? "Entrando…" : "Entrar"}
      </button>
    </>
  );
}
