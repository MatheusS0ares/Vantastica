import Link from "next/link";
import { ToastFromParams } from "@/components/ToastFromParams";
import { signIn } from "../actions";

export default function LoginPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <ToastFromParams />
      <div className="w-full max-w-sm rounded-card bg-surface p-6 shadow-card">
        <h1 className="font-heading text-xl font-bold text-navy">Entrar</h1>
        <p className="mt-1 text-sm text-muted">
          Motorista ou responsável — o app te leva pro lugar certo.
        </p>

        <form action={signIn} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            E-mail
            <input
              type="email"
              name="email"
              required
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Senha
            <input
              type="password"
              name="password"
              required
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Entrar
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-1 text-center text-sm text-muted">
          <span>
            Dono de van?{" "}
            <Link href="/cadastro" className="font-medium text-blue">
              Criar conta
            </Link>
          </span>
          <span>
            Responsável? Peça o link de convite ao motorista da van.
          </span>
        </div>
      </div>
    </div>
  );
}
