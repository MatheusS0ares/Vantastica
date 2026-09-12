import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { redirect } from "next/navigation";

export default async function AlunosPage() {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const supabase = await createClient();
  const { data: students, error } = await supabase
    .from("students")
    .select("id, full_name, school_name, class_name")
    .eq("organization_id", context.organizationId)
    .order("full_name");

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-navy">Alunos</h1>
        <Link
          href="/motorista/alunos/novo"
          className="rounded-pill bg-navy px-4 py-2 text-sm font-medium text-white shadow-card transition hover:opacity-90"
        >
          + Novo Aluno
        </Link>
      </div>

      {error && (
        <p className="rounded-input bg-coral/10 px-3 py-2 text-sm text-coral">
          Não foi possível carregar os alunos: {error.message}
        </p>
      )}

      {students && students.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno cadastrado ainda. Toque em &quot;+ Novo Aluno&quot;
          pra começar.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {students?.map((student) => (
          <Link
            key={student.id}
            href={`/motorista/alunos/${student.id}`}
            className="flex flex-col gap-1 rounded-card bg-surface p-4 shadow-card transition hover:opacity-90"
          >
            <span className="font-heading font-semibold text-navy">
              {student.full_name}
            </span>
            <span className="text-sm text-muted">
              {[student.school_name, student.class_name]
                .filter(Boolean)
                .join(" · ") || "Sem escola/turma cadastrada"}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
