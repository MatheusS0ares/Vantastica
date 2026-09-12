import Link from "next/link";
import { PagePlaceholder } from "@/components/PagePlaceholder";

const links = [
  { href: "/motorista/alunos", label: "Alunos" },
  { href: "/motorista/rota", label: "Rota" },
  { href: "/motorista/financeiro", label: "Financeiro" },
  { href: "/motorista/perfil", label: "Perfil" },
];

export default function MotoristaDashboardPage() {
  return (
    <div className="flex flex-1 flex-col">
      <PagePlaceholder
        title="Dashboard do Motorista"
        description="KPIs do turno, próxima parada e início de rota. Componente a implementar a partir do mockup aprovado."
      />
      <nav className="flex flex-col gap-3 px-5 pb-6">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="rounded-card bg-surface px-4 py-3 text-center font-medium text-navy shadow-card transition hover:opacity-90"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
