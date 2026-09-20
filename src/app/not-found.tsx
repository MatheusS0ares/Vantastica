import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 py-16 text-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icons/icon-192.png"
        alt=""
        aria-hidden
        className="h-14 w-14 rounded-2xl"
      />
      <div className="flex flex-col gap-1">
        <span className="font-heading text-5xl font-bold text-navy">404</span>
        <h1 className="font-heading text-xl font-semibold text-navy">
          Essa página saiu da rota
        </h1>
        <p className="max-w-xs text-sm text-muted">
          O link pode estar errado ou a página pode ter sido movida. Vamos
          te levar de volta.
        </p>
      </div>
      <Link
        href="/"
        className="rounded-pill bg-navy px-6 py-3 font-medium text-white shadow-card transition hover:opacity-90"
      >
        Voltar pro início
      </Link>
    </div>
  );
}
