import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { CopyInviteLink } from "@/components/CopyInviteLink";
import { CompressedUploadForm } from "@/components/CompressedUploadForm";
import { ToastFromParams } from "@/components/ToastFromParams";
import {
  createCalendarEvent,
  createOrganizationInvite,
  deleteCalendarEvent,
  updateOrganization,
  updateOrganizationAsset,
} from "./actions";

const EVENT_TYPE_LABEL: Record<string, string> = {
  feriado: "Feriado",
  recesso: "Recesso",
  prova: "Prova",
  sem_transporte: "Sem transporte",
};

export default async function PerfilMotoristaPage() {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const supabase = await createClient();

  const [{ data: org }, { data: events }, { count: memberCount }, { data: invites }] =
    await Promise.all([
      supabase
        .from("organizations")
        .select(
          "name, phone, van_plate, van_model, van_capacity, van_photo_url, logo_url",
        )
        .eq("id", context.organizationId)
        .maybeSingle(),
      supabase
        .from("school_calendar_events")
        .select("id, event_date, title, event_type")
        .eq("organization_id", context.organizationId)
        .order("event_date", { ascending: true }),
      supabase
        .from("organization_members")
        .select("user_id", { count: "exact", head: true })
        .eq("organization_id", context.organizationId),
      supabase
        .from("organization_invites")
        .select("id, invite_token, created_at")
        .eq("organization_id", context.organizationId)
        .is("claimed_by", null)
        .order("created_at", { ascending: false }),
    ]);

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <ToastFromParams />
      <h1 className="font-heading text-xl font-bold text-navy">Perfil</h1>

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
          <div className="flex gap-3">
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-text">
              Placa da van
              <input
                type="text"
                name="vanPlate"
                defaultValue={org?.van_plate ?? ""}
                placeholder="ABC-1234"
                className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex flex-1 flex-col gap-1 text-sm font-medium text-text">
              Capacidade
              <input
                type="number"
                name="vanCapacity"
                min="1"
                defaultValue={org?.van_capacity ?? ""}
                placeholder="15"
                className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
          </div>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Modelo da van
            <input
              type="text"
              name="vanModel"
              defaultValue={org?.van_model ?? ""}
              placeholder="Mercedes-Benz Sprinter 2022"
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

      <div className="flex flex-col gap-4 rounded-card bg-surface p-4 shadow-card">
        <span className="font-heading text-sm font-semibold text-navy">
          Identidade Visual
        </span>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-pill bg-blue/10">
            {org?.logo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.logo_url}
                alt="Logo"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <CompressedUploadForm
            action={updateOrganizationAsset.bind(null, "logo")}
            fieldName="logo"
            label="Logo da empresa"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-card bg-blue/10">
            {org?.van_photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={org.van_photo_url}
                alt="Foto da van"
                className="h-full w-full object-cover"
              />
            )}
          </div>
          <CompressedUploadForm
            action={updateOrganizationAsset.bind(null, "van")}
            fieldName="van"
            label="Foto da van"
          />
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
        <span className="font-heading text-sm font-semibold text-navy">
          Motoristas
        </span>
        <span className="text-sm text-text">
          {memberCount ?? 0} motorista{memberCount === 1 ? "" : "s"} nessa
          organização
        </span>

        {invites && invites.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Convites pendentes
            </span>
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between rounded-input border border-border px-3 py-2"
              >
                <span className="text-xs text-muted">
                  Convidado em{" "}
                  {new Date(invite.created_at).toLocaleDateString("pt-BR")}
                </span>
                <CopyInviteLink
                  token={invite.invite_token}
                  path="/convite-motorista"
                />
              </div>
            ))}
          </div>
        )}

        <form action={createOrganizationInvite}>
          <button
            type="submit"
            className="rounded-pill border border-blue px-4 py-2 text-sm font-medium text-blue transition hover:opacity-80"
          >
            + Convidar motorista
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
