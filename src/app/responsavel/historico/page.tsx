import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { formatTimeInBrazil } from "@/lib/timezone";
import { SHIFT_LABEL, type Shift } from "@/lib/shifts";

const EVENT_LABEL: Record<string, string> = {
  embarque: "Embarque",
  entrega: "Entrega",
  ausente: "Ausência",
};

const EVENT_CLASS: Record<string, string> = {
  embarque: "bg-amber/10 text-amber",
  entrega: "bg-sage text-mint",
  ausente: "bg-coral/10 text-coral",
};

type StudentRow = { id: string; full_name: string };
type IncidentRow = {
  id: string;
  title: string;
  description: string | null;
  created_at: string;
  student_id: string;
};
type CheckinRow = {
  id: string;
  event_type: string;
  occurred_at: string;
  student_id: string;
  shift: Shift | null;
};

export default async function HistoricoPage() {
  const context = await getUserContext();
  if (context.role !== "responsavel") redirect("/login");

  const supabase = await createClient();

  const { data: links } = await supabase
    .from("student_guardians")
    .select("students(id, full_name)")
    .eq("guardian_id", context.guardianId);

  const students = (links ?? [])
    .map((link) => link.students as unknown as StudentRow | null)
    .filter((s): s is StudentRow => Boolean(s));

  const studentIds = students.map((s) => s.id);
  const studentNameById = new Map(students.map((s) => [s.id, s.full_name]));

  const [{ data: incidentsRaw }, { data: checkinsRaw }] = await Promise.all([
    studentIds.length
      ? supabase
          .from("incidents")
          .select("id, title, description, created_at, student_id")
          .in("student_id", studentIds)
          .order("created_at", { ascending: false })
          .limit(15)
      : Promise.resolve({ data: [] as IncidentRow[] }),
    studentIds.length
      ? supabase
          .from("checkins")
          .select("id, event_type, occurred_at, student_id, shift")
          .in("student_id", studentIds)
          .order("occurred_at", { ascending: false })
          .limit(20)
      : Promise.resolve({ data: [] as CheckinRow[] }),
  ]);

  const incidents = (incidentsRaw ?? []) as IncidentRow[];
  const checkins = (checkinsRaw ?? []) as CheckinRow[];

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <h1 className="font-heading text-xl font-bold text-navy">
        Avisos e Histórico
      </h1>

      {students.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno vinculado à sua conta ainda.
        </p>
      )}

      {students.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-heading text-sm font-semibold text-navy">
            Avisos
          </span>
          {incidents.length === 0 && (
            <p className="text-sm text-muted">Nenhum aviso registrado.</p>
          )}
          {incidents.map((incident) => (
            <div
              key={incident.id}
              className="flex flex-col gap-1 rounded-card bg-amber/10 p-4"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-navy">
                  {studentNameById.get(incident.student_id)} ·{" "}
                  {incident.title}
                </span>
                <span className="text-xs text-muted">
                  {new Date(incident.created_at).toLocaleDateString("pt-BR")}
                </span>
              </div>
              {incident.description && (
                <span className="text-sm text-text">
                  {incident.description}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {students.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-heading text-sm font-semibold text-navy">
            Últimos Registros
          </span>
          {checkins.length === 0 && (
            <p className="text-sm text-muted">
              Nenhum check-in registrado ainda.
            </p>
          )}
          {checkins.map((checkin) => (
            <div
              key={checkin.id}
              className="flex items-center justify-between rounded-card bg-surface p-3 shadow-card"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-navy">
                  {studentNameById.get(checkin.student_id)}
                </span>
                <span className="text-xs text-muted">
                  {new Date(checkin.occurred_at).toLocaleDateString("pt-BR")}{" "}
                  · {formatTimeInBrazil(new Date(checkin.occurred_at))}
                  {checkin.shift ? ` · ${SHIFT_LABEL[checkin.shift]}` : ""}
                </span>
              </div>
              <span
                className={`rounded-pill px-3 py-1 text-xs font-semibold ${EVENT_CLASS[checkin.event_type]}`}
              >
                {EVENT_LABEL[checkin.event_type]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
