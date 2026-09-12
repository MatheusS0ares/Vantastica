import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { getStudentPhotoSignedUrl } from "@/lib/supabase/storage";
import { todayStartInBrazil, formatTimeInBrazil } from "@/lib/timezone";
import { SHIFTS, SHIFT_LABEL, currentShift, isShift } from "@/lib/shifts";
import { StudentCheckinCard } from "@/components/StudentCheckinCard";
import { recordCheckin } from "./actions";

type Status = "embarcado" | "entregue" | "ausente";

const STATUS_LABEL: Record<Status, string> = {
  embarcado: "Embarcou",
  entregue: "Entregue",
  ausente: "Ausente",
};

const STATUS_CLASS: Record<Status, string> = {
  embarcado: "bg-amber/10 text-amber",
  entregue: "bg-sage text-mint",
  ausente: "bg-coral/10 text-coral",
};

type ShiftStudentRow = {
  student_id: string;
  students: {
    id: string;
    full_name: string;
    pickup_address: string | null;
    photo_url: string | null;
    is_active: boolean;
  } | null;
};

export default async function RotaPage({
  searchParams,
}: PageProps<"/motorista/rota">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { error, turno } = await searchParams;
  const selectedShift =
    typeof turno === "string" && isShift(turno) ? turno : currentShift();

  const supabase = await createClient();

  const { data: shiftRowsRaw } = await supabase
    .from("student_shifts")
    .select(
      "student_id, students(id, full_name, pickup_address, photo_url, is_active)",
    )
    .eq("shift", selectedShift);

  const students = (shiftRowsRaw ?? [])
    .map((row) => row.students as unknown as ShiftStudentRow["students"])
    .filter((s): s is NonNullable<ShiftStudentRow["students"]> =>
      Boolean(s && s.is_active),
    )
    .sort((a, b) => a.full_name.localeCompare(b.full_name));

  const studentIds = students.map((s) => s.id);

  const todayStart = todayStartInBrazil();

  const { data: todaysCheckins } = studentIds.length
    ? await supabase
        .from("checkins")
        .select("student_id, event_type, occurred_at")
        .in("student_id", studentIds)
        .eq("shift", selectedShift)
        .gte("occurred_at", todayStart.toISOString())
        .order("occurred_at", { ascending: true })
    : { data: [] as { student_id: string; event_type: string; occurred_at: string }[] };

  const statusByStudent = new Map<string, { status: Status; time: string }>();
  for (const checkin of todaysCheckins ?? []) {
    const time = formatTimeInBrazil(new Date(checkin.occurred_at));
    const status: Status =
      checkin.event_type === "embarque"
        ? "embarcado"
        : checkin.event_type === "entrega"
          ? "entregue"
          : "ausente";
    statusByStudent.set(checkin.student_id, { status, time });
  }

  const photoUrls = new Map(
    await Promise.all(
      students.map(
        async (s) =>
          [s.id, await getStudentPhotoSignedUrl(supabase, s.photo_url)] as const,
      ),
    ),
  );

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

      <div className="flex gap-2">
        {SHIFTS.map((shift) => (
          <Link
            key={shift}
            href={`/motorista/rota?turno=${shift}`}
            className={`flex-1 rounded-pill px-3 py-2 text-center text-sm font-medium transition ${
              shift === selectedShift
                ? "bg-navy text-white"
                : "bg-surface text-muted shadow-card"
            }`}
          >
            {SHIFT_LABEL[shift]}
          </Link>
        ))}
      </div>

      {error && (
        <p className="rounded-input bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      {students.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno configurado para o turno {SHIFT_LABEL[selectedShift]}.{" "}
          <Link href="/motorista/alunos" className="text-blue">
            Configurar turnos
          </Link>
        </p>
      )}

      <div className="flex flex-col gap-3">
        {students.map((student) => {
          const info = statusByStudent.get(student.id);

          return (
            <StudentCheckinCard
              key={student.id}
              studentName={student.full_name}
              pickupAddress={student.pickup_address}
              photoUrl={photoUrls.get(student.id) ?? null}
              statusBadge={
                info ? (
                  <span
                    className={`rounded-pill px-3 py-1 text-xs font-semibold ${STATUS_CLASS[info.status]}`}
                  >
                    {STATUS_LABEL[info.status]} · {info.time}
                  </span>
                ) : null
              }
              showColetarButtons={!info}
              showEntregarButton={info?.status === "embarcado"}
              embarcarAction={recordCheckin.bind(
                null,
                student.id,
                selectedShift,
                "embarque",
              )}
              entregarAction={recordCheckin.bind(
                null,
                student.id,
                selectedShift,
                "entrega",
              )}
              ausenteAction={recordCheckin.bind(
                null,
                student.id,
                selectedShift,
                "ausente",
              )}
            />
          );
        })}
      </div>
    </div>
  );
}
