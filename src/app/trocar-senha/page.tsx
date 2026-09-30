import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/supabase/user-context";
import { ToastFromParams } from "@/components/ToastFromParams";
import { updateOwnPassword } from "./actions";

export default async function TrocarSenhaPage() {
  const context = await getUserContext();
  if (context.role !== "responsavel") redirect("/login");

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <ToastFromParams />
      <div className="w-full max-w-sm rounded-card bg-surface p-6 shadow-card">
        <h1 className="font-heading text-xl font-bold text-navy">
          Criar sua senha
        </h1>
        <p className="mt-1 text-sm text-muted">
          Essa é sua primeira vez entrando — troque a senha inicial por uma
          só sua antes de continuar.
        </p>

        <form
          action={updateOwnPassword}
          className="mt-6 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Nova senha
            <input
              type="password"
              name="password"
              required
              minLength={6}
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Confirmar nova senha
            <input
              type="password"
              name="confirmPassword"
              required
              minLength={6}
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Salvar e continuar
          </button>
        </form>
      </div>
    </div>
  );
}
