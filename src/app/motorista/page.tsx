import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { todayStartInBrazil } from "@/lib/timezone";

export default async function MotoristaDashboardPage() {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const supabase = await createClient();
  const todayStart = todayStartInBrazil();
  const monthStart = new Date();
  monthStart.setDate(1);
  const monthStartStr = monthStart.toISOString().slice(0, 10);
  const todayStr = new Date().toISOString().slice(0, 10);

  const [
    { count: totalStudents },
    { data: todaysCheckins },
    { count: incidentsToday },
    { data: monthInvoices },
  ] = await Promise.all([
    supabase
      .from("students")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId)
      .eq("is_active", true),
    supabase
      .from("checkins")
      .select("student_id, students!inner(organization_id)")
      .eq("event_type", "embarque")
      .eq("students.organization_id", context.organizationId)
      .gte("occurred_at", todayStart.toISOString()),
    supabase
      .from("incidents")
      .select("id", { count: "exact", head: true })
      .eq("organization_id", context.organizationId)
      .gte("created_at", todayStart.toISOString()),
    supabase
      .from("invoices")
      .select("status, due_date")
      .eq("organization_id", context.organizationId)
      .gte("reference_month", monthStartStr),
  ]);

  const embarcadosHoje = new Set(
    (todaysCheckins ?? []).map((c) => c.student_id),
  ).size;

  const invoicesThisMonth = monthInvoices ?? [];
  const inadimplentes = invoicesThisMonth.filter(
    (invoice) =>
      invoice.status === "atrasado" ||
      (invoice.status === "pendente" && invoice.due_date < todayStr),
  ).length;
  const inadimplenciaPct =
    invoicesThisMonth.length > 0
      ? Math.round((inadimplentes / invoicesThisMonth.length) * 100)
      : null;

  const kpis = [
    {
      label: "Alunos ativos",
      value: String(totalStudents ?? 0),
      color: "text-blue",
      bg: "bg-blue/10",
    },
    {
      label: "Embarcados hoje",
      value: `${embarcadosHoje}/${totalStudents ?? 0}`,
      color: "text-mint",
      bg: "bg-mint/10",
    },
    {
      label: "Ocorrências hoje",
      value: String(incidentsToday ?? 0),
      color: "text-amber",
      bg: "bg-amber/10",
    },
    {
      label: "Inadimplência",
      value: inadimplenciaPct === null ? "—" : `${inadimplenciaPct}%`,
      color: "text-coral",
      bg: "bg-coral/10",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <h1 className="font-heading text-xl font-bold text-navy">
        Resumo de Hoje
      </h1>

      <div className="grid grid-cols-2 gap-3">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card"
          >
            <div
              className={`h-9 w-9 rounded-pill ${kpi.bg} flex items-center justify-center`}
            >
              <div className={`h-3 w-3 rounded-pill ${kpi.color} bg-current`} />
            </div>
            <span className={`font-heading text-2xl font-bold ${kpi.color}`}>
              {kpi.value}
            </span>
            <span className="text-xs font-medium text-muted">
              {kpi.label}
            </span>
          </div>
        ))}
      </div>

      <Link
        href="/motorista/rota"
        className="rounded-pill bg-mint px-6 py-4 text-center font-medium text-white shadow-card transition hover:opacity-90"
      >
        Iniciar Rota
      </Link>
    </div>
  );
}
