import { signInResponsavel, signUpResponsavel } from "@/app/(auth)/actions";
import { ToastFromParams } from "@/components/ToastFromParams";

export default async function ConvitePage({
  params,
}: PageProps<"/convite/[token]">) {
  const { token } = await params;

  const signUpAction = signUpResponsavel.bind(null, token);
  const signInAction = signInResponsavel.bind(null, token);

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
      <ToastFromParams />
      <div className="w-full max-w-sm rounded-card bg-surface p-6 shadow-card">
        <h1 className="font-heading text-xl font-bold text-navy">
          Você foi convidado pro VanTástica
        </h1>
        <p className="mt-1 text-sm text-muted">
          Crie sua conta pra acompanhar seu filho em tempo real.
        </p>

        <form action={signUpAction} className="mt-6 flex flex-col gap-4">
          <span className="text-sm font-semibold text-navy">
            Criar minha conta
          </span>
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
            className="rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Criar conta e vincular
          </button>
        </form>

        <div className="my-6 flex items-center gap-3 text-xs text-muted">
          <div className="h-px flex-1 bg-border" />
          ou já tenho conta
          <div className="h-px flex-1 bg-border" />
        </div>

        <form action={signInAction} className="flex flex-col gap-4">
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
            className="rounded-pill border border-border bg-surface px-6 py-3 font-medium text-navy transition hover:opacity-90"
          >
            Entrar e vincular
          </button>
        </form>
      </div>
    </div>
  );
}
