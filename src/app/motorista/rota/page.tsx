import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { recordCheckin } from "./actions";

type Status = "pendente" | "embarcado" | "entregue" | "ausente";

const STATUS_LABEL: Record<Exclude<Status, "pendente">, string> = {
  embarcado: "Embarcou",
  entregue: "Entregue",
  ausente: "Ausente",
};

const STATUS_CLASS: Record<Exclude<Status, "pendente">, string> = {
  embarcado: "bg-amber/10 text-amber",
  entregue: "bg-sage text-mint",
  ausente: "bg-coral/10 text-coral",
};

export default async function RotaPage({
  searchParams,
}: PageProps<"/motorista/rota">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, pickup_address")
    .eq("organization_id", context.organizationId)
    .eq("is_active", true)
    .order("full_name");

  const studentIds = students?.map((s) => s.id) ?? [];

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const { data: todaysCheckins } = studentIds.length
    ? await supabase
        .from("checkins")
        .select("student_id, event_type, occurred_at")
        .in("student_id", studentIds)
        .gte("occurred_at", todayStart.toISOString())
        .order("occurred_at", { ascending: true })
    : { data: [] as { student_id: string; event_type: string; occurred_at: string }[] };

  const statusByStudent = new Map<
    string,
    { status: Exclude<Status, "pendente">; time: string }
  >();
  for (const checkin of todaysCheckins ?? []) {
    const time = new Date(checkin.occurred_at).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const status: Exclude<Status, "pendente"> =
      checkin.event_type === "embarque"
        ? "embarcado"
        : checkin.event_type === "entrega"
          ? "entregue"
          : "ausente";
    statusByStudent.set(checkin.student_id, { status, time });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-navy">
          Rota de Hoje
        </h1>
        <Link href="/motorista" className="text-sm text-muted">
          ← Dashboard
        </Link>
      </div>

      {error && (
        <p className="rounded-input bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      {students && students.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno cadastrado ainda.{" "}
          <Link href="/motorista/alunos/novo" className="text-blue">
            Cadastrar aluno
          </Link>
        </p>
      )}

      <div className="flex flex-col gap-3">
        {students?.map((student) => {
          const info = statusByStudent.get(student.id);
          const embarcarAction = recordCheckin.bind(null, student.id, "embarque");
          const entregarAction = recordCheckin.bind(null, student.id, "entrega");
          const ausenteAction = recordCheckin.bind(null, student.id, "ausente");

          return (
            <div
              key={student.id}
              className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-navy">
                    {student.full_name}
                  </span>
                  {student.pickup_address && (
                    <span className="text-sm text-muted">
                      {student.pickup_address}
                    </span>
                  )}
                </div>
                {info && (
                  <span
                    className={`rounded-pill px-3 py-1 text-xs font-semibold ${STATUS_CLASS[info.status]}`}
                  >
                    {STATUS_LABEL[info.status]} · {info.time}
                  </span>
                )}
              </div>

              {!info && (
                <div className="flex gap-3">
                  <form action={embarcarAction} className="flex-1">
                    <button
                      type="submit"
                      className="w-full rounded-pill bg-mint px-4 py-3 font-medium text-white transition hover:opacity-90"
                    >
                      Coletar
                    </button>
                  </form>
                  <form action={ausenteAction} className="flex-1">
                    <button
                      type="submit"
                      className="w-full rounded-pill border border-coral px-4 py-3 font-medium text-coral transition hover:opacity-90"
                    >
                      Ausente
                    </button>
                  </form>
                </div>
              )}

              {info?.status === "embarcado" && (
                <form action={entregarAction}>
                  <button
                    type="submit"
                    className="w-full rounded-pill bg-navy px-4 py-3 font-medium text-white transition hover:opacity-90"
                  >
                    Confirmar entrega
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
