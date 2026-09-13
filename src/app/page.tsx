import Link from "next/link";
import { RouteIcon, UsersIcon, WalletIcon } from "@/components/icons";

const FEATURES = [
  {
    icon: RouteIcon,
    title: "Rota do dia organizada",
    description:
      "Turnos, horários e check-in de cada aluno — tudo direto do celular, sem planilha.",
  },
  {
    icon: WalletIcon,
    title: "Cobrança sem esforço",
    description:
      "Gere as mensalidades do mês em lote e receba por Pix, com poucos toques.",
  },
  {
    icon: UsersIcon,
    title: "Pais sempre informados",
    description:
      "Notificação automática a cada embarque, chegada ou ausência — sem grupo de WhatsApp lotado.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <section className="relative overflow-hidden bg-gradient-to-br from-navy to-blue px-6 py-20 text-center text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 15% 20%, white 0, transparent 35%), radial-gradient(circle at 85% 75%, white 0, transparent 35%)",
          }}
        />
        <div className="relative flex flex-col items-center gap-6">
          <div className="flex items-center gap-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt=""
              aria-hidden
              className="h-14 w-14 rounded-2xl shadow-fab"
            />
            <span className="font-heading text-4xl font-bold">
              VanTástica
            </span>
          </div>

          <h1 className="max-w-sm text-4xl font-bold leading-tight sm:text-5xl">
            Uma van simplesmente fantástica.
          </h1>
          <p className="max-w-sm text-white/85">
            Gestão completa da sua van escolar: rotas, check-in dos alunos,
            cobrança e comunicação em tempo real com as famílias — tudo em um
            só lugar.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/cadastro"
              className="rounded-pill bg-white px-7 py-3 font-semibold text-navy shadow-fab transition hover:opacity-90"
            >
              Cadastrar minha van
            </Link>
            <Link
              href="/responsavel"
              className="rounded-pill border border-white/40 px-7 py-3 font-medium text-white transition hover:bg-white/10"
            >
              Sou responsável
            </Link>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-6 px-6 py-14">
        <div className="mx-auto grid w-full max-w-4xl gap-4 sm:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-3 rounded-card bg-surface p-5 text-left shadow-card"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-pill bg-blue/10 text-blue">
                <Icon size={20} />
              </div>
              <span className="font-heading font-semibold text-navy">
                {title}
              </span>
              <span className="text-sm text-muted">{description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col items-center gap-4 px-6 pb-16 text-center">
        <span className="font-heading text-lg font-semibold text-navy">
          Pronto pra simplificar sua van escolar?
        </span>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link
            href="/cadastro"
            className="rounded-pill bg-navy px-6 py-3 font-medium text-white shadow-card transition hover:opacity-90"
          >
            Sou motorista
          </Link>
          <Link
            href="/responsavel"
            className="rounded-pill border border-border bg-surface px-6 py-3 font-medium text-navy shadow-card transition hover:opacity-90"
          >
            Sou responsável
          </Link>
        </div>
      </section>
    </div>
  );
}
