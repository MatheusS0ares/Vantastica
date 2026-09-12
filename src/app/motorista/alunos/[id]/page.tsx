import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { CopyInviteLink } from "@/components/CopyInviteLink";
import { getStudentPhotoSignedUrl } from "@/lib/supabase/storage";
import { addGuardianToStudent } from "../actions";

type GuardianRow = {
  id: string;
  full_name: string;
  phone: string | null;
  user_id: string | null;
  invite_token: string;
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

  const { data: guardianLinks } = await supabase
    .from("student_guardians")
    .select(
      "relationship, is_primary_contact, can_pick_up, guardians(id, full_name, phone, user_id, invite_token)",
    )
    .eq("student_id", id);

  const addGuardianAction = addGuardianToStudent.bind(null, id);

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
        <div className="h-16 w-16 shrink-0 overflow-hidden rounded-pill bg-blue/10">
          {photoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photoUrl}
              alt={student.full_name}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center font-heading text-lg font-semibold text-blue">
              {(student.full_name as string)
                .split(" ")
                .filter(Boolean)
                .slice(0, 2)
                .map((part: string) => part[0]?.toUpperCase())
                .join("")}
            </div>
          )}
        </div>
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
