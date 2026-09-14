import Link from "next/link";
import {
  BellIcon,
  RouteIcon,
  ShieldCheckIcon,
  SmartphoneIcon,
  UsersIcon,
  WalletIcon,
} from "@/components/icons";
const TRUST_BADGES = [
  "📍 GPS ao vivo",
  "💳 Pix integrado",
  "🔔 Avisos automáticos",
];

const BENTO_FEATURES = [
  {
    icon: RouteIcon,
    title: "Rota do dia organizada",
    description:
      "Turnos, horários e check-in de cada aluno — tudo direto do celular, sem planilha.",
    span: "sm:col-span-2",
  },
  {
    icon: WalletIcon,
    title: "Cobrança sem esforço",
    description: "Mensalidades em lote e recebimento por Pix, em poucos toques.",
    span: "",
  },
  {
    icon: BellIcon,
    title: "Pais sempre informados",
    description:
      "Notificação automática a cada embarque, chegada ou ausência.",
    span: "",
  },
  {
    icon: UsersIcon,
    title: "Múltiplos motoristas",
    description: "Convide outros motoristas da mesma van pra dividir a rota.",
    span: "",
  },
  {
    icon: SmartphoneIcon,
    title: "Funciona como app",
    description:
      "Instala na tela de início do celular, sem loja de aplicativos.",
    span: "",
  },
];

const FAQS = [
  {
    question: "Preciso pagar pra usar?",
    answer:
      "Por enquanto, o cadastro é gratuito. O dinheiro das mensalidades vai direto dos pais pra sua chave Pix, sem intermediário — a VanTástica não fica com nenhuma parte disso.",
  },
  {
    question: "Funciona pra quem tem mais de uma van (frota)?",
    answer:
      "Sim. Hoje cada van tem sua própria conta, com seus motoristas e alunos organizados separadamente — se você tem uma frota, é só criar uma conta pra cada van. Estamos trabalhando pra unificar isso num painel só em breve.",
  },
  {
    question: "Os responsáveis precisam baixar um app na loja?",
    answer:
      "Não. O app abre direto do navegador e pode ser adicionado à tela de início do celular em um toque, sem passar pela App Store ou Play Store.",
  },
  {
    question: "Como funciona a localização em tempo real?",
    answer:
      "O motorista ativa o compartilhamento na tela da rota do dia, e os responsáveis acompanham a van num mapa enquanto ela estiver a caminho.",
  },
  {
    question: "Os dados dos alunos ficam seguros?",
    answer:
      "Sim. Cada van só enxerga seus próprios alunos e responsáveis — os dados de organizações diferentes ficam completamente isolados entre si.",
  },
  {
    question: "Posso ter mais de um motorista na mesma van?",
    answer:
      "Pode sim, sem custo extra. Convide quantos motoristas quiser pra dividir a rota — todos veem os mesmos alunos e a mesma agenda.",
  },
];

const STEPS = [
  {
    title: "Cadastre sua van",
    description: "Nome, foto e informações da van em menos de 2 minutos.",
  },
  {
    title: "Configure os alunos",
    description: "Endereços, turnos e responsáveis de cada criança.",
  },
  {
    title: "Comece a rodar",
    description: "Check-in a cada parada, com os pais avisados em tempo real.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col overflow-x-clip">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-navy/70 px-6 py-3 backdrop-blur-lg">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/icons/icon-192.png"
              alt=""
              aria-hidden
              className="h-8 w-8 rounded-lg"
            />
            <span className="font-heading text-lg font-bold text-white">
              VanTástica
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="#faq"
              className="hidden text-sm font-medium text-white/80 transition hover:text-white sm:block"
            >
              FAQ
            </Link>
            <Link
              href="/login"
              className="hidden text-sm font-medium text-white/80 transition hover:text-white sm:block"
            >
              Entrar
            </Link>
            <Link
              href="/cadastro"
              className="rounded-pill bg-white px-4 py-2 text-sm font-semibold text-navy shadow-fab transition hover:opacity-90"
            >
              Cadastrar minha van
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden bg-gradient-to-br from-navy via-navy to-blue px-6 pb-20 pt-16 text-center text-white">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.15]"
          style={{
            backgroundImage:
              "radial-gradient(circle, white 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-blue/40 blur-3xl" />
        <div className="pointer-events-none absolute -right-16 top-40 h-72 w-72 rounded-full bg-mint/30 blur-3xl" />

        <div className="relative mx-auto flex max-w-lg flex-col items-center gap-6">
          <span className="rounded-pill border border-white/25 bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90 backdrop-blur">
            🚐 Novo: localização da van em tempo real
          </span>

          <h1 className="text-4xl font-bold leading-tight sm:text-6xl">
            Uma van{" "}
            <span className="bg-gradient-to-r from-mint to-emerald-300 bg-clip-text text-transparent">
              simplesmente fantástica
            </span>
            .
          </h1>
          <p className="max-w-sm text-white/85 sm:text-lg">
            Gestão completa da sua van escolar: rotas, check-in dos alunos,
            cobrança e comunicação em tempo real com as famílias — tudo em um
            só lugar.
          </p>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <Link
              href="/cadastro"
              className="rounded-pill bg-white px-7 py-3 font-semibold text-navy shadow-fab transition hover:-translate-y-0.5 hover:opacity-90"
            >
              Cadastrar minha van
            </Link>
            <Link
              href="/responsavel"
              className="rounded-pill border border-white/40 px-7 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10"
            >
              Sou responsável
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
            {TRUST_BADGES.map((badge) => (
              <span
                key={badge}
                className="rounded-pill border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/75 backdrop-blur"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="animate-fade-in-up mx-auto max-w-4xl">
          <div className="mb-10 flex flex-col items-center gap-2 text-center">
            <span className="text-sm font-semibold uppercase tracking-wide text-blue">
              Como funciona
            </span>
            <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
              Do cadastro à primeira rota em minutos
            </h2>
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3">
          {STEPS.map((step, index) => (
            <div
              key={step.title}
              className="animate-fade-in-up relative flex flex-col items-center gap-2 text-center"
              style={{ animationDelay: `${index * 120}ms` }}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-pill bg-navy font-heading text-lg font-bold text-white shadow-fab">
                {index + 1}
              </div>
              {index < STEPS.length - 1 && (
                <div className="absolute left-1/2 top-5 hidden h-px w-full -translate-x-0 bg-border sm:block sm:left-[calc(50%+22px)] sm:w-[calc(100%-44px)]" />
              )}
              <span className="font-heading font-semibold text-navy">
                {step.title}
              </span>
              <span className="text-sm text-muted">{step.description}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-surface px-6 py-16">
        <div className="animate-fade-in-up mx-auto mb-10 flex max-w-4xl flex-col items-center gap-2 text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-blue">
            Tudo em um só app
          </span>
          <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
            De uma van só até uma frota inteira
          </h2>
        </div>

        <div className="mx-auto grid max-w-4xl gap-4 sm:grid-cols-3">
          {BENTO_FEATURES.map(({ icon: Icon, title, description, span }, index) => (
            <div
              key={title}
              className={`animate-fade-in-up ${span}`}
              style={{ animationDelay: `${index * 80}ms` }}
            >
              <div className="flex h-full flex-col gap-3 rounded-card bg-bg p-6 text-left shadow-card transition hover:-translate-y-1 hover:shadow-modal">
                <div className="flex h-11 w-11 items-center justify-center rounded-pill bg-blue/10 text-blue">
                  <Icon size={22} />
                </div>
                <span className="font-heading font-semibold text-navy">
                  {title}
                </span>
                <span className="text-sm text-muted">{description}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="scroll-mt-16 px-6 py-16">
        <div className="animate-fade-in-up mx-auto mb-10 flex max-w-2xl flex-col items-center gap-2 text-center">
          <span className="text-sm font-semibold uppercase tracking-wide text-blue">
            Perguntas frequentes
          </span>
          <h2 className="font-heading text-2xl font-bold text-navy sm:text-3xl">
            Ainda com dúvidas?
          </h2>
        </div>

        <div className="mx-auto flex max-w-2xl flex-col gap-3">
          {FAQS.map((faq, index) => (
            <div
              key={faq.question}
              className="animate-fade-in-up"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <details className="group rounded-card bg-surface px-5 py-4 shadow-card">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-heading font-semibold text-navy">
                  {faq.question}
                  <span className="shrink-0 text-blue transition group-open:rotate-180">
                    ▾
                  </span>
                </summary>
                <p className="mt-3 text-sm text-muted">{faq.answer}</p>
              </details>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16">
        <div className="animate-fade-in-up mx-auto max-w-4xl">
          <div className="relative overflow-hidden rounded-card bg-gradient-to-br from-navy to-blue px-6 py-14 text-center text-white shadow-fab">
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-56 w-56 rounded-full bg-mint/30 blur-3xl" />
            <div className="pointer-events-none absolute -left-10 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
            <div className="relative flex flex-col items-center gap-4">
              <ShieldCheckIcon size={32} />
              <span className="font-heading text-xl font-bold sm:text-2xl">
                Pronto pra simplificar sua van escolar?
              </span>
              <p className="max-w-sm text-sm text-white/80">
                Cadastro gratuito, sem cartão de crédito. Comece a usar hoje
                mesmo.
              </p>
              <div className="flex flex-col gap-3 pt-2 sm:flex-row">
                <Link
                  href="/cadastro"
                  className="rounded-pill bg-white px-6 py-3 font-medium text-navy shadow-card transition hover:-translate-y-0.5 hover:opacity-90"
                >
                  Sou motorista
                </Link>
                <Link
                  href="/responsavel"
                  className="rounded-pill border border-white/40 px-6 py-3 font-medium text-white transition hover:-translate-y-0.5 hover:bg-white/10"
                >
                  Sou responsável
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="flex flex-col items-center gap-2 px-6 pb-10 text-center">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/icons/icon-192.png"
            alt=""
            aria-hidden
            className="h-6 w-6 rounded-md"
          />
          <span className="font-heading text-sm font-semibold text-navy">
            VanTástica
          </span>
        </div>
        <span className="text-xs text-muted">
          © {new Date().getFullYear()} VanTástica. Feito com carinho no
          Brasil.
        </span>
      </footer>
    </div>
  );
}
