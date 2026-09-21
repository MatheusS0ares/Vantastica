import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { CopyInviteLink } from "@/components/CopyInviteLink";
import { EditableStudentPhoto } from "@/components/EditableStudentPhoto";
import { ToastFromParams } from "@/components/ToastFromParams";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { getStudentPhotoSignedUrl } from "@/lib/supabase/storage";
import {
  AlertIcon,
  ClockIcon,
  MapPinIcon,
  UsersIcon,
} from "@/components/icons";
import {
  addGuardianToStudent,
  createIncident,
  updateGuardian,
  updateStudentInfo,
  updateStudentPhoto,
  updateStudentShifts,
} from "../actions";
import { SHIFTS, SHIFT_LABEL } from "@/lib/shifts";

type GuardianRow = {
  id: string;
  full_name: string;
  phone: string | null;
  user_id: string | null;
  invite_token: string;
};

type StudentShiftRow = {
  shift: string;
  expected_pickup_time: string | null;
  expected_dropoff_time: string | null;
};

function SectionHeader({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <span className="mt-0.5 text-blue">{icon}</span>
        <div className="flex flex-col gap-0.5">
          <span className="font-heading text-sm font-semibold text-navy">
            {title}
          </span>
          {description && (
            <span className="text-xs leading-snug text-muted">
              {description}
            </span>
          )}
        </div>
      </div>
      {action}
    </div>
  );
}

export default async function AlunoDossiePage({
  params,
}: PageProps<"/motorista/alunos/[id]">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { id } = await params;

  const supabase = await createClient();

  // As quatro consultas abaixo são independentes entre si (nenhuma usa
  // o resultado de outra, só o `id` da URL) — rodar em paralelo evita
  // pagar 4 idas-e-voltas sequenciais ao banco só pra montar essa tela.
  const [
    { data: student },
    { data: shiftsRaw },
    { data: guardianLinks },
    { data: incidents },
  ] = await Promise.all([
    supabase
      .from("students")
      .select(
        "id, full_name, school_name, class_name, pickup_address, dropoff_address, medical_notes, photo_url",
      )
      .eq("id", id)
      .maybeSingle(),
    supabase
      .from("student_shifts")
      .select("shift, expected_pickup_time, expected_dropoff_time")
      .eq("student_id", id),
    supabase
      .from("student_guardians")
      .select(
        "relationship, is_primary_contact, can_pick_up, guardians(id, full_name, phone, user_id, invite_token)",
      )
      .eq("student_id", id),
    supabase
      .from("incidents")
      .select("id, title, description, created_at")
      .eq("student_id", id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (!student) {
    notFound();
  }

  const photoUrl = await getStudentPhotoSignedUrl(supabase, student.photo_url);

  const shiftByName = new Map(
    ((shiftsRaw ?? []) as StudentShiftRow[]).map((s) => [s.shift, s]),
  );
  const configuredShifts = SHIFTS.filter((shift) => shiftByName.has(shift));

  const addGuardianAction = addGuardianToStudent.bind(null, id);
  const updatePhotoAction = updateStudentPhoto.bind(null, id);
  const createIncidentAction = createIncident.bind(null, id);
  const updateShiftsAction = updateStudentShifts.bind(null, id);
  const updateInfoAction = updateStudentInfo.bind(null, id);

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <Link
        href="/motorista/alunos"
        className="flex w-fit items-center gap-1 text-sm font-medium text-muted"
      >
        ← Alunos
      </Link>

      <ToastFromParams />

      {/* Hero: foto grande em destaque + identificação do aluno */}
      <div className="flex flex-col items-center gap-3 rounded-card bg-surface p-6 text-center shadow-card">
        <EditableStudentPhoto
          studentName={student.full_name}
          photoUrl={photoUrl}
          updatePhotoAction={updatePhotoAction}
          size="lg"
        />
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-2xl font-bold text-navy">
            {student.full_name}
          </h1>
          <span className="text-sm text-muted">
            {[student.school_name, student.class_name]
              .filter(Boolean)
              .join(" · ") || "Sem escola/turma cadastrada"}
          </span>
        </div>
        <span className="text-xs text-muted">Toque na foto pra trocar</span>
      </div>

      {/* Endereços */}
      <div className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
        <SectionHeader
          icon={<MapPinIcon size={18} />}
          title="Endereços"
          description="De onde a van busca e pra onde leva o aluno"
        />
        <div className="flex flex-col gap-2 rounded-input bg-bg px-3 py-3">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Coleta
            </span>
            <span className="text-sm text-text">
              {student.pickup_address || "Não informado"}
            </span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              Entrega
            </span>
            <span className="text-sm text-text">
              {student.dropoff_address || "Mesma da coleta"}
            </span>
          </div>
        </div>
        {student.medical_notes && (
          <div className="flex items-start gap-2 rounded-input bg-amber/10 px-3 py-2.5">
            <AlertIcon size={16} />
            <span className="text-sm text-text">{student.medical_notes}</span>
          </div>
        )}

        <Collapsible className="mt-1">
          <CollapsibleTrigger>Editar dados do aluno</CollapsibleTrigger>
          <CollapsibleContent>
          <form
            action={updateInfoAction}
            className="flex flex-col gap-4 rounded-input bg-bg p-3"
          >
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Nome completo
              <input
                type="text"
                name="fullName"
                required
                defaultValue={student.full_name}
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Escola
              <input
                type="text"
                name="schoolName"
                defaultValue={student.school_name ?? ""}
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Turma
              <input
                type="text"
                name="className"
                defaultValue={student.class_name ?? ""}
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Endereço de coleta
              <input
                type="text"
                name="pickupAddress"
                defaultValue={student.pickup_address ?? ""}
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Endereço de entrega
              <input
                type="text"
                name="dropoffAddress"
                placeholder="Deixe em branco se for o mesmo da coleta"
                defaultValue={student.dropoff_address ?? ""}
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Observações médicas
              <textarea
                name="medicalNotes"
                rows={2}
                defaultValue={student.medical_notes ?? ""}
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <button
              type="submit"
              className="rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Salvar dados
            </button>
          </form>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Turnos */}
      <div className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
        <SectionHeader
          icon={<ClockIcon size={18} />}
          title="Turnos"
          description="Horários de busca e entrega usados pra calcular atrasos"
          action={
            <Link
              href={`/motorista/alunos/${id}/historico`}
              className="text-sm font-medium text-blue"
            >
              Relatório →
            </Link>
          }
        />

        {configuredShifts.length === 0 ? (
          <p className="rounded-input bg-amber/10 px-3 py-2.5 text-sm text-amber">
            Nenhum turno configurado ainda — sem isso, a rota de hoje não
            mostra esse aluno.
          </p>
        ) : (
          <div className="flex flex-col gap-2">
            {configuredShifts.map((shift) => {
              const info = shiftByName.get(shift);
              return (
                <div
                  key={shift}
                  className="flex items-center justify-between rounded-input bg-bg px-3 py-2.5"
                >
                  <span className="text-sm font-medium text-navy">
                    {SHIFT_LABEL[shift]}
                  </span>
                  <span className="text-sm text-text">
                    {info?.expected_pickup_time?.slice(0, 5) || "—"} →{" "}
                    {info?.expected_dropoff_time?.slice(0, 5) || "—"}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        <Collapsible className="mt-1">
          <CollapsibleTrigger>Editar turnos</CollapsibleTrigger>
          <CollapsibleContent>
          <form
            action={updateShiftsAction}
            className="flex flex-col gap-4 rounded-input bg-bg p-3"
          >
            <p className="text-xs text-muted">
              Cada turno completo tem 4 etapas registradas automaticamente
              pela van (saída de casa → chegada na escola → saída da escola
              → chegada em casa). Aqui você só define os horários previstos
              de saída de casa e chegada em casa, usados pra calcular
              atraso — as paradas na escola não precisam de horário
              previsto.
            </p>
            {SHIFTS.map((shift) => {
              const info = shiftByName.get(shift);
              const isConfigured = shiftByName.has(shift);
              const fields = (
                <div className="flex gap-3">
                  <label className="flex flex-1 flex-col gap-1 text-sm text-text">
                    Saída de casa
                    <input
                      type="time"
                      name={`${shift}_pickup`}
                      defaultValue={
                        info?.expected_pickup_time?.slice(0, 5) ?? ""
                      }
                      className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
                    />
                  </label>
                  <label className="flex flex-1 flex-col gap-1 text-sm text-text">
                    Chegada em casa
                    <input
                      type="time"
                      name={`${shift}_dropoff`}
                      defaultValue={
                        info?.expected_dropoff_time?.slice(0, 5) ?? ""
                      }
                      className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
                    />
                  </label>
                </div>
              );

              // A maioria dos alunos anda só num turno — só mostra os
              // outros dois quando o motorista pedir explicitamente pra
              // não confundir "turno não usado" com "esqueci de preencher".
              if (isConfigured) {
                return (
                  <div key={shift} className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-navy">
                      {SHIFT_LABEL[shift]}
                    </span>
                    {fields}
                  </div>
                );
              }

              return (
                <Collapsible key={shift}>
                  <CollapsibleTrigger className="text-sm text-muted">
                    Adicionar {SHIFT_LABEL[shift]} (outro período)
                  </CollapsibleTrigger>
                  <CollapsibleContent>{fields}</CollapsibleContent>
                </Collapsible>
              );
            })}
            <button
              type="submit"
              className="rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Salvar turnos
            </button>
          </form>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Responsáveis */}
      <div className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
        <SectionHeader
          icon={<UsersIcon size={18} />}
          title="Responsáveis"
          description="Quem recebe notificações e acompanha o aluno pelo app"
        />

        {(!guardianLinks || guardianLinks.length === 0) && (
          <p className="text-sm text-muted">
            Nenhum responsável cadastrado ainda.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {guardianLinks?.map((link) => {
            // Supabase infra a relação como array no tipo (sem gerar tipos
            // do schema), mas em runtime é sempre um objeto único, já que
            // student_guardians.guardian_id aponta pra um único guardian.
            const guardian = link.guardians as unknown as GuardianRow | null;
            if (!guardian) return null;
            const isClaimed = Boolean(guardian.user_id);

            return (
              <div
                key={guardian.id}
                className="flex flex-col gap-2 rounded-input bg-bg p-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-medium text-navy">
                      {guardian.full_name}
                    </span>
                    <span className="text-sm text-muted">
                      {link.relationship || "Responsável"}
                      {guardian.phone ? ` · ${guardian.phone}` : ""}
                    </span>
                  </div>
                  {isClaimed ? (
                    <span className="rounded-pill bg-sage px-3 py-1 text-xs font-semibold text-mint">
                      Vinculado
                    </span>
                  ) : (
                    <span className="rounded-pill bg-amber/10 px-3 py-1 text-xs font-semibold text-amber">
                      Pendente
                    </span>
                  )}
                </div>
                {!isClaimed && (
                  <>
                    <span className="text-xs text-muted">
                      Ainda não criou conta — envie o link pra ele se
                      cadastrar e acompanhar o aluno
                    </span>
                    <CopyInviteLink token={guardian.invite_token} />
                  </>
                )}

                <Collapsible>
                  <CollapsibleTrigger className="text-xs text-blue">
                    Editar
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                  <form
                    action={updateGuardian.bind(null, id, guardian.id)}
                    className="flex flex-col gap-3 rounded-input bg-surface p-3"
                  >
                    <label className="flex flex-col gap-1 text-sm font-medium text-text">
                      Nome completo
                      <input
                        type="text"
                        name="fullName"
                        required
                        defaultValue={guardian.full_name}
                        className="rounded-input border border-border bg-bg px-3 py-2 text-base outline-none focus:border-blue"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-text">
                      Telefone
                      <input
                        type="tel"
                        name="phone"
                        defaultValue={guardian.phone ?? ""}
                        className="rounded-input border border-border bg-bg px-3 py-2 text-base outline-none focus:border-blue"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-sm font-medium text-text">
                      Parentesco
                      <input
                        type="text"
                        name="relationship"
                        defaultValue={link.relationship ?? ""}
                        className="rounded-input border border-border bg-bg px-3 py-2 text-base outline-none focus:border-blue"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                      <input
                        type="checkbox"
                        name="isPrimaryContact"
                        defaultChecked={link.is_primary_contact}
                      />
                      Contato principal
                    </label>
                    <label className="flex items-center gap-2 text-sm text-text">
                      <input
                        type="checkbox"
                        name="canPickUp"
                        defaultChecked={link.can_pick_up}
                      />
                      Autorizado a buscar a criança
                    </label>
                    <button
                      type="submit"
                      className="rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
                    >
                      Salvar responsável
                    </button>
                  </form>
                  </CollapsibleContent>
                </Collapsible>
              </div>
            );
          })}
        </div>

        <Collapsible className="mt-1">
          <CollapsibleTrigger>Adicionar responsável</CollapsibleTrigger>
          <CollapsibleContent>
          <form
            action={addGuardianAction}
            className="flex flex-col gap-4 rounded-input bg-bg p-3"
          >
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Nome completo
              <input
                type="text"
                name="fullName"
                required
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Telefone
              <input
                type="tel"
                name="phone"
                placeholder="(31) 99999-0000"
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Parentesco
              <input
                type="text"
                name="relationship"
                placeholder="Mãe, Pai, Avó..."
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" name="isPrimaryContact" />
              Contato principal
            </label>
            <label className="flex items-center gap-2 text-sm text-text">
              <input type="checkbox" name="canPickUp" />
              Autorizado a buscar a criança
            </label>
            <button
              type="submit"
              className="rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Adicionar responsável
            </button>
          </form>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Ocorrências */}
      <div className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
        <SectionHeader
          icon={<AlertIcon size={18} />}
          title="Ocorrências"
          description="Saúde, comportamento ou avisos importantes sobre o aluno"
        />

        {(!incidents || incidents.length === 0) && (
          <p className="text-sm text-muted">
            Nenhuma ocorrência registrada.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {incidents?.map((incident) => (
            <div
              key={incident.id}
              className="flex flex-col gap-1 rounded-input bg-amber/10 p-3"
            >
              <div className="flex items-center justify-between">
                <span className="font-medium text-navy">
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

        <Collapsible className="mt-1">
          <CollapsibleTrigger>Registrar ocorrência</CollapsibleTrigger>
          <CollapsibleContent>
          <form
            action={createIncidentAction}
            className="flex flex-col gap-4 rounded-input bg-bg p-3"
          >
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Título
              <input
                type="text"
                name="title"
                required
                placeholder="Febre leve na saída"
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-medium text-text">
              Detalhes
              <textarea
                name="description"
                rows={3}
                className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
              />
            </label>
            <button
              type="submit"
              className="rounded-pill bg-amber px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Registrar ocorrência
            </button>
          </form>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </div>
  );
}
