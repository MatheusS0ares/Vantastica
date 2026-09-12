import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import {
  createCalendarEvent,
  deleteCalendarEvent,
  updateOrganization,
} from "./actions";

const EVENT_TYPE_LABEL: Record<string, string> = {
  feriado: "Feriado",
  recesso: "Recesso",
  prova: "Prova",
  sem_transporte: "Sem transporte",
};

export default async function PerfilMotoristaPage({
  searchParams,
}: PageProps<"/motorista/perfil">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { error } = await searchParams;
  const supabase = await createClient();

  const [{ data: org }, { data: events }] = await Promise.all([
    supabase
      .from("organizations")
      .select("name, phone")
      .eq("id", context.organizationId)
      .maybeSingle(),
    supabase
      .from("school_calendar_events")
      .select("id, event_date, title, event_type")
      .eq("organization_id", context.organizationId)
      .order("event_date", { ascending: true }),
  ]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <h1 className="font-heading text-xl font-bold text-navy">Perfil</h1>

      {error && (
        <p className="rounded-input bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
        <span className="font-heading text-sm font-semibold text-navy">
          Dados da Van/Empresa
        </span>
        <form action={updateOrganization} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Nome
            <input
              type="text"
              name="name"
              required
              defaultValue={org?.name ?? ""}
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Telefone
            <input
              type="tel"
              name="phone"
              defaultValue={org?.phone ?? ""}
              placeholder="(31) 99999-0000"
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <button
            type="submit"
            className="rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Salvar
          </button>
        </form>
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-heading text-sm font-semibold text-navy">
          Calendário Letivo
        </span>

        {(!events || events.length === 0) && (
          <p className="text-sm text-muted">Nenhum evento cadastrado.</p>
        )}

        {events?.map((event) => (
          <div
            key={event.id}
            className="flex items-center justify-between rounded-card bg-surface p-3 shadow-card"
          >
            <div className="flex flex-col">
              <span className="text-sm font-medium text-navy">
                {event.title}
              </span>
              <span className="text-xs text-muted">
                {new Date(event.event_date + "T00:00:00").toLocaleDateString(
                  "pt-BR",
                )}{" "}
                · {EVENT_TYPE_LABEL[event.event_type]}
              </span>
            </div>
            <form action={deleteCalendarEvent.bind(null, event.id)}>
              <button
                type="submit"
                className="text-sm text-coral"
                aria-label="Remover evento"
              >
                Remover
              </button>
            </form>
          </div>
        ))}
      </div>

      <details className="rounded-card bg-surface p-4 shadow-card">
        <summary className="cursor-pointer font-heading text-sm font-semibold text-navy">
          + Novo evento no calendário
        </summary>
        <form
          action={createCalendarEvent}
          className="mt-4 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Título
            <input
              type="text"
              name="title"
              required
              placeholder="Feriado de Tiradentes"
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Data
            <input
              type="date"
              name="eventDate"
              required
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Tipo
            <select
              name="eventType"
              required
              className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
            >
              <option value="feriado">Feriado</option>
              <option value="recesso">Recesso</option>
              <option value="prova">Prova</option>
              <option value="sem_transporte">Sem transporte</option>
            </select>
          </label>
          <button
            type="submit"
            className="rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Adicionar evento
          </button>
        </form>
      </details>
    </div>
  );
}
