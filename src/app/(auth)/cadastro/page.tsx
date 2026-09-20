import Link from "next/link";
import { ToastFromParams } from "@/components/ToastFromParams";
import { signUpMotorista } from "../actions";

export default async function CadastroMotoristaPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <ToastFromParams />
      <div className="w-full max-w-sm rounded-card bg-surface p-6 shadow-card">
        <h1 className="font-heading text-xl font-bold text-navy">
          Criar conta de motorista
        </h1>
        <p className="mt-1 text-sm text-muted">
          Sua organização é criada junto com a conta.
        </p>

        <form action={signUpMotorista} className="mt-6 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Nome da van/empresa
            <input
              type="text"
              name="orgName"
              required
              placeholder="Van da Tia Márcia"
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Telefone (opcional)
            <input
              type="tel"
              name="phone"
              placeholder="(31) 99999-0000"
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
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
              minLength={6}
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <button
            type="submit"
            className="mt-2 rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Criar conta
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted">
          Ao criar sua conta, você concorda com os{" "}
          <Link href="/termos" className="font-medium text-blue">
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link href="/privacidade" className="font-medium text-blue">
            Política de Privacidade
          </Link>
          .
        </p>

        <div className="mt-6 text-center text-sm text-muted">
          Já tem conta?{" "}
          <Link href="/login" className="font-medium text-blue">
            Entrar
          </Link>
        </div>
      </div>
    </div>
  );
}
