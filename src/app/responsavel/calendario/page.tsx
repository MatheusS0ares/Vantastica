import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";

const EVENT_TYPE_LABEL: Record<string, string> = {
  feriado: "Feriado",
  recesso: "Recesso",
  prova: "Prova",
  sem_transporte: "Sem transporte",
};

const EVENT_TYPE_CLASS: Record<string, string> = {
  feriado: "bg-sage text-mint",
  recesso: "bg-blue/10 text-blue",
  prova: "bg-amber/10 text-amber",
  sem_transporte: "bg-coral/10 text-coral",
};

type StudentRow = { organization_id: string };
type EventRow = {
  id: string;
  event_date: string;
  title: string;
  event_type: string;
};

export default async function CalendarioResponsavelPage() {
  const context = await getUserContext();
  if (context.role !== "responsavel") redirect("/login");

  const supabase = await createClient();

  const { data: links } = await supabase
    .from("student_guardians")
    .select("students(organization_id)")
    .eq("guardian_id", context.guardianId);

  const organizationIds = Array.from(
    new Set(
      (links ?? [])
        .map((link) => (link.students as unknown as StudentRow | null)?.organization_id)
        .filter((id): id is string => Boolean(id)),
    ),
  );

  const { data: eventsRaw } = organizationIds.length
    ? await supabase
        .from("school_calendar_events")
        .select("id, event_date, title, event_type")
        .in("organization_id", organizationIds)
        .order("event_date", { ascending: true })
    : { data: [] as EventRow[] };

  const events = (eventsRaw ?? []) as EventRow[];
  const todayStr = new Date().toISOString().slice(0, 10);
  const upcoming = events.filter((event) => event.event_date >= todayStr);
  const past = events.filter((event) => event.event_date < todayStr).reverse();

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <h1 className="font-heading text-xl font-bold text-navy">
        Calendário Letivo
      </h1>

      {organizationIds.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno vinculado à sua conta ainda.
        </p>
      )}

      {organizationIds.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-heading text-sm font-semibold text-navy">
            Próximos eventos
          </span>
          {upcoming.length === 0 && (
            <p className="text-sm text-muted">Nenhum evento futuro cadastrado.</p>
          )}
          {upcoming.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-card bg-surface p-4 shadow-card"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-navy">
                  {event.title}
                </span>
                <span className="text-xs text-muted">
                  {new Date(event.event_date + "T00:00:00").toLocaleDateString(
                    "pt-BR",
                    { weekday: "long", day: "2-digit", month: "long" },
                  )}
                </span>
              </div>
              <span
                className={`rounded-pill px-3 py-1 text-xs font-semibold ${EVENT_TYPE_CLASS[event.event_type]}`}
              >
                {EVENT_TYPE_LABEL[event.event_type]}
              </span>
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="font-heading text-sm font-semibold text-navy">
            Eventos passados
          </span>
          {past.map((event) => (
            <div
              key={event.id}
              className="flex items-center justify-between rounded-card bg-surface p-3 opacity-60 shadow-card"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-navy">
                  {event.title}
                </span>
                <span className="text-xs text-muted">
                  {new Date(event.event_date + "T00:00:00").toLocaleDateString(
                    "pt-BR",
                  )}
                </span>
              </div>
              <span
                className={`rounded-pill px-3 py-1 text-xs font-semibold ${EVENT_TYPE_CLASS[event.event_type]}`}
              >
                {EVENT_TYPE_LABEL[event.event_type]}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
