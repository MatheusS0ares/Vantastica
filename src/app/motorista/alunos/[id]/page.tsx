import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { CopyInviteLink } from "@/components/CopyInviteLink";
import { EditableStudentPhoto } from "@/components/EditableStudentPhoto";
import { getStudentPhotoSignedUrl } from "@/lib/supabase/storage";
import {
  addGuardianToStudent,
  createIncident,
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

export default async function AlunoDossiePage({
  params,
  searchParams,
}: PageProps<"/motorista/alunos/[id]">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { id } = await params;
  const { error } = await searchParams;

  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, school_name, class_name, pickup_address, dropoff_address, medical_notes, photo_url",
    )
    .eq("id", id)
    .maybeSingle();

  if (!student) {
    notFound();
  }

  const photoUrl = await getStudentPhotoSignedUrl(supabase, student.photo_url);

  const { data: shiftsRaw } = await supabase
    .from("student_shifts")
    .select("shift, expected_pickup_time, expected_dropoff_time")
    .eq("student_id", id);

  const shiftByName = new Map(
    ((shiftsRaw ?? []) as StudentShiftRow[]).map((s) => [s.shift, s]),
  );

  const { data: guardianLinks } = await supabase
    .from("student_guardians")
    .select(
      "relationship, is_primary_contact, can_pick_up, guardians(id, full_name, phone, user_id, invite_token)",
    )
    .eq("student_id", id);

  const { data: incidents } = await supabase
    .from("incidents")
    .select("id, title, description, created_at")
    .eq("student_id", id)
    .order("created_at", { ascending: false })
    .limit(10);

  const addGuardianAction = addGuardianToStudent.bind(null, id);
  const updatePhotoAction = updateStudentPhoto.bind(null, id);
  const createIncidentAction = createIncident.bind(null, id);
  const updateShiftsAction = updateStudentShifts.bind(null, id);

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <Link href="/motorista/alunos" className="text-sm text-muted">
        ← Alunos
      </Link>

      {error && (
        <p className="rounded-input bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      <div className="flex items-center gap-4">
        <EditableStudentPhoto
          studentName={student.full_name}
          photoUrl={photoUrl}
          updatePhotoAction={updatePhotoAction}
        />
        <div className="flex flex-col gap-1">
          <h1 className="font-heading text-xl font-bold text-navy">
            {student.full_name}
          </h1>
          <span className="text-sm text-muted">
            {[student.school_name, student.class_name]
              .filter(Boolean)
              .join(" · ") || "Sem escola/turma cadastrada"}
          </span>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card">
        <span className="font-heading text-sm font-semibold text-navy">
          Endereços
        </span>
        <span className="text-sm text-text">
          Coleta: {student.pickup_address || "não informado"}
        </span>
        <span className="text-sm text-text">
          Entrega: {student.dropoff_address || "mesma da coleta"}
        </span>
        {student.medical_notes && (
          <span className="mt-1 rounded-input bg-amber/10 px-3 py-2 text-sm text-text">
            {student.medical_notes}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
        <div className="flex items-center justify-between">
          <span className="font-heading text-sm font-semibold text-navy">
            Turnos
          </span>
          <Link
            href={`/motorista/alunos/${id}/historico`}
            className="text-sm text-blue"
          >
            Ver relatório →
          </Link>
        </div>

        {SHIFTS.filter((shift) => shiftByName.has(shift)).length === 0 && (
          <p className="text-sm text-muted">
            Nenhum turno configurado ainda.
          </p>
        )}

        {SHIFTS.filter((shift) => shiftByName.has(shift)).map((shift) => {
          const info = shiftByName.get(shift);
          return (
            <div key={shift} className="flex items-center justify-between">
              <span className="text-sm font-medium text-navy">
                {SHIFT_LABEL[shift]}
              </span>
              <span className="text-sm text-text">
                Busca {info?.expected_pickup_time?.slice(0, 5) || "—"} ·
                Entrega {info?.expected_dropoff_time?.slice(0, 5) || "—"}
              </span>
            </div>
          );
        })}

        <details className="mt-1">
          <summary className="cursor-pointer text-sm text-blue">
            Editar turnos
          </summary>
          <form
            action={updateShiftsAction}
            className="mt-3 flex flex-col gap-4"
          >
            <p className="text-xs text-muted">
              Deixe os dois horários em branco pra um turno que o aluno não
              usa.
            </p>
            {SHIFTS.map((shift) => {
              const info = shiftByName.get(shift);
              return (
                <div key={shift} className="flex flex-col gap-2">
                  <span className="text-sm font-medium text-navy">
                    {SHIFT_LABEL[shift]}
                  </span>
                  <div className="flex gap-3">
                    <label className="flex flex-1 flex-col gap-1 text-sm text-text">
                      Busca
                      <input
                        type="time"
                        name={`${shift}_pickup`}
                        defaultValue={
                          info?.expected_pickup_time?.slice(0, 5) ?? ""
                        }
                        className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
                      />
                    </label>
                    <label className="flex flex-1 flex-col gap-1 text-sm text-text">
                      Entrega
                      <input
                        type="time"
                        name={`${shift}_dropoff`}
                        defaultValue={
                          info?.expected_dropoff_time?.slice(0, 5) ?? ""
                        }
                        className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
                      />
                    </label>
                  </div>
                </div>
              );
            })}
            <button
              type="submit"
              className="rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
            >
              Salvar turnos
            </button>
          </form>
        </details>
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-heading text-sm font-semibold text-navy">
          Responsáveis
        </span>

        {(!guardianLinks || guardianLinks.length === 0) && (
          <p className="text-sm text-muted">
            Nenhum responsável cadastrado ainda.
          </p>
        )}

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
              className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card"
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
              {!isClaimed && <CopyInviteLink token={guardian.invite_token} />}
            </div>
          );
        })}
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-heading text-sm font-semibold text-navy">
          Ocorrências
        </span>

        {(!incidents || incidents.length === 0) && (
          <p className="text-sm text-muted">
            Nenhuma ocorrência registrada.
          </p>
        )}

        {incidents?.map((incident) => (
          <div
            key={incident.id}
            className="flex flex-col gap-1 rounded-card bg-amber/10 p-4"
          >
            <div className="flex items-center justify-between">
              <span className="font-medium text-navy">{incident.title}</span>
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

      <details className="rounded-card bg-surface p-4 shadow-card">
        <summary className="cursor-pointer font-heading text-sm font-semibold text-navy">
          + Registrar ocorrência
        </summary>
        <form
          action={createIncidentAction}
          className="mt-4 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Título
            <input
              type="text"
              name="title"
              required
              placeholder="Febre leve na saída"
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Detalhes
            <textarea
              name="description"
              rows={3}
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <button
            type="submit"
            className="rounded-pill bg-amber px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Registrar ocorrência
          </button>
        </form>
      </details>

      <details className="rounded-card bg-surface p-4 shadow-card">
        <summary className="cursor-pointer font-heading text-sm font-semibold text-navy">
          + Adicionar responsável
        </summary>
        <form
          action={addGuardianAction}
          className="mt-4 flex flex-col gap-4"
        >
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Nome completo
            <input
              type="text"
              name="fullName"
              required
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Telefone
            <input
              type="tel"
              name="phone"
              placeholder="(31) 99999-0000"
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Parentesco
            <input
              type="text"
              name="relationship"
              placeholder="Mãe, Pai, Avó..."
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
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
      </details>
    </div>
  );
}
