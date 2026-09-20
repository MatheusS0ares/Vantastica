import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { SHIFT_LABEL, isShift, currentShift } from "@/lib/shifts";
import { ToastFromParams } from "@/components/ToastFromParams";
import { ShiftTabs } from "@/components/ShiftTabs";
import { bulkUpdateShiftForStudents } from "../actions";

type StudentRow = {
  id: string;
  full_name: string;
  school_name: string | null;
  class_name: string | null;
};

type ShiftRow = { student_id: string };

export default async function ConfigurarTurnosPage({
  searchParams,
}: PageProps<"/motorista/alunos/turnos">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { turno } = await searchParams;
  const selectedShift =
    typeof turno === "string" && isShift(turno) ? turno : currentShift();

  const supabase = await createClient();

  const { data: studentsRaw } = await supabase
    .from("students")
    .select("id, full_name, school_name, class_name")
    .eq("organization_id", context.organizationId)
    .eq("is_active", true)
    .order("full_name");

  const students = (studentsRaw ?? []) as StudentRow[];
  const studentIds = students.map((s) => s.id);

  const { data: shiftRowsRaw } = studentIds.length
    ? await supabase
        .from("student_shifts")
        .select("student_id")
        .eq("shift", selectedShift)
        .in("student_id", studentIds)
    : { data: [] as ShiftRow[] };

  const configuredIds = new Set(
    (shiftRowsRaw ?? []).map((row) => row.student_id),
  );
  const missingStudents = students.filter((s) => !configuredIds.has(s.id));

  const bulkAction = bulkUpdateShiftForStudents.bind(null, selectedShift);

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-6">
      <ToastFromParams />
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-xl font-bold text-navy">
          Configurar turnos
        </h1>
        <Link href="/motorista/rota" className="text-sm text-muted">
          ← Rota
        </Link>
      </div>

      <ShiftTabs selectedShift={selectedShift} basePath="/motorista/alunos/turnos" />

      {students.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno cadastrado ainda.{" "}
          <Link href="/motorista/alunos/novo" className="text-blue">
            Cadastrar aluno
          </Link>
        </p>
      )}

      {students.length > 0 && missingStudents.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Todos os alunos ativos já têm horário definido pro turno{" "}
          {SHIFT_LABEL[selectedShift]}.
        </p>
      )}

      {missingStudents.length > 0 && (
        <form action={bulkAction} className="flex flex-col gap-3">
          <p className="text-xs text-muted">
            {missingStudents.length} aluno
            {missingStudents.length === 1 ? "" : "s"} sem horário definido pro
            turno {SHIFT_LABEL[selectedShift]}. Preencha só quem anda nesse
            turno — deixe os dois campos em branco pra quem não anda.
          </p>

          {missingStudents.map((student) => (
            <div
              key={student.id}
              className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card"
            >
              <input type="hidden" name="studentId" value={student.id} />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-navy">
                  {student.full_name}
                </span>
                <span className="text-xs text-muted">
                  {[student.school_name, student.class_name]
                    .filter(Boolean)
                    .join(" · ") || "Sem escola/turma cadastrada"}
                </span>
              </div>
              <div className="flex gap-3">
                <label className="flex flex-1 flex-col gap-1 text-sm text-text">
                  Busca
                  <input
                    type="time"
                    name={`pickup_${student.id}`}
                    className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
                  />
                </label>
                <label className="flex flex-1 flex-col gap-1 text-sm text-text">
                  Entrega
                  <input
                    type="time"
                    name={`dropoff_${student.id}`}
                    className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
                  />
                </label>
              </div>
            </div>
          ))}

          <button
            type="submit"
            className="rounded-pill bg-navy px-6 py-3 font-medium text-white shadow-card transition hover:opacity-90"
          >
            Salvar horários preenchidos
          </button>
        </form>
      )}

      <div className="mt-2 text-center">
        <Link href="/motorista/alunos" className="text-sm text-blue">
          Ver todos os alunos (editar turnos individualmente)
        </Link>
      </div>
    </div>
  );
}
