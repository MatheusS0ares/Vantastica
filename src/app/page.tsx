import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
      <div className="flex flex-col items-center gap-2">
        <Image
          src="/logo.png"
          alt="VanTástica"
          width={120}
          height={120}
          priority
          className="mb-2"
        />
        <h1 className="font-heading text-3xl font-bold text-navy">
          Uma van simplesmente fantástica.
        </h1>
        <p className="max-w-sm text-muted">
          Gestão inteligente de vans escolares — rotas, check-in dos alunos e
          comunicação automática com as famílias.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/motorista"
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
    </div>
  );
}
