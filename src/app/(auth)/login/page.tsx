import Link from "next/link";
import { ToastFromParams } from "@/components/ToastFromParams";
import { LoginSubmitButton } from "@/components/LoginSubmitButton";
import { signIn } from "../actions";

export default async function LoginPage({
  searchParams,
}: PageProps<"/login">) {
  // O toast (ToastFromParams) já cobre a maioria dos casos, mas depende
  // de JS carregar e a página hidratar — em navegador embutido de app
  // de mensagem (ex.: abrir o link direto dentro do WhatsApp) isso às
  // vezes não roda direito, e a pessoa só vê a tela de login "não fazer
  // nada". Esse banner aqui é renderizado direto pelo servidor, sem
  // depender de JS nenhum, como reforço.
  const { error, notice } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <ToastFromParams />
      {typeof error === "string" && (
        <div className="mb-4 w-full max-w-sm rounded-input bg-coral/10 px-4 py-3 text-sm text-coral">
          {error}
        </div>
      )}
      {typeof notice === "string" && (
        <div className="mb-4 w-full max-w-sm rounded-input bg-blue/10 px-4 py-3 text-sm text-blue">
          {notice}
        </div>
      )}
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
          <LoginSubmitButton />
        </form>

        <div className="mt-6 flex flex-col gap-1 text-center text-sm text-muted">
          <span>
            Dono de van?{" "}
            <Link href="/cadastro" className="font-medium text-blue">
              Criar conta
            </Link>
          </span>
          <span>
            Responsável? Use o e-mail e a senha que o motorista da van te
            passou.
          </span>
        </div>
      </div>
    </div>
  );
}
