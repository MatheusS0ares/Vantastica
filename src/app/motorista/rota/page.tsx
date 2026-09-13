import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { getStudentPhotoSignedUrl } from "@/lib/supabase/storage";
import { todayStartInBrazil, formatTimeInBrazil } from "@/lib/timezone";
import { SHIFTS, SHIFT_LABEL, currentShift, isShift } from "@/lib/shifts";
import { StudentCheckinCard, type PrimaryAction } from "@/components/StudentCheckinCard";
import { ShareLocationToggle } from "@/components/ShareLocationToggle";
import { recordCheckin } from "./actions";

// Um turno é a ida-e-volta inteira de um grupo de alunos (ex.: matutino
// = busca em casa + chegada na escola + busca na escola ao meio-dia +
// entrega em casa), não só um embarque e uma entrega. Cada evento novo
// avança o aluno pra próxima etapa dentro do mesmo turno/dia.
type Stage =
  | "aguardando_ida"
  | "a_caminho_escola"
  | "aguardando_volta"
  | "a_caminho_casa"
  | "concluido"
  | "ausente";

const STAGE_BADGE: Record<
  Stage,
  { label: string; className: string } | null
> = {
  aguardando_ida: null,
  a_caminho_escola: {
    label: "A caminho da escola",
    className: "bg-amber/10 text-amber",
  },
  aguardando_volta: { label: "Na escola", className: "bg-blue/10 text-blue" },
  a_caminho_casa: {
    label: "A caminho de casa",
    className: "bg-amber/10 text-amber",
  },
  concluido: { label: "Entregue", className: "bg-sage text-mint" },
  ausente: { label: "Ausente", className: "bg-coral/10 text-coral" },
};

const STAGE_RING: Record<Stage, string> = {
  aguardando_ida: "border-border",
  a_caminho_escola: "border-amber",
  aguardando_volta: "border-blue",
  a_caminho_casa: "border-amber",
  concluido: "border-mint",
  ausente: "border-coral",
};

const STAGE_PRIMARY: Record<Stage, PrimaryAction | null> = {
  aguardando_ida: {
    kind: "embarque",
    label: "Coletar",
    confirmTitle: "Confirmar busca",
    confirmButton: "Confirmar busca",
  },
  a_caminho_escola: {
    kind: "entrega",
    label: "Confirmar chegada na escola",
    confirmTitle: "Confirmar chegada na escola",
    confirmButton: "Confirmar chegada",
  },
  aguardando_volta: {
    kind: "embarque",
    label: "Buscar na escola",
    confirmTitle: "Confirmar busca na escola",
    confirmButton: "Confirmar busca",
  },
  a_caminho_casa: {
    kind: "entrega",
    label: "Confirmar entrega em casa",
    confirmTitle: "Confirmar entrega em casa",
    confirmButton: "Confirmar entrega",
  },
  concluido: null,
  ausente: null,
};

function stageFor(events: { event_type: string }[]): Stage {
  if (events.some((e) => e.event_type === "ausente")) return "ausente";
  switch (events.length) {
    case 0:
      return "aguardando_ida";
    case 1:
      return "a_caminho_escola";
    case 2:
      return "aguardando_volta";
    case 3:
      return "a_caminho_casa";
    default:
      return "concluido";
  }
}

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

  const eventsByStudent = new Map<
    string,
    { event_type: string; time: string }[]
  >();
  for (const checkin of todaysCheckins ?? []) {
    const arr = eventsByStudent.get(checkin.student_id) ?? [];
    arr.push({
      event_type: checkin.event_type,
      time: formatTimeInBrazil(new Date(checkin.occurred_at)),
    });
    eventsByStudent.set(checkin.student_id, arr);
  }

  const photoUrls = new Map(
    await Promise.all(
      students.map(
        async (s) =>
          [s.id, await getStudentPhotoSignedUrl(supabase, s.photo_url)] as const,
      ),
    ),
  );

  const stagesByStudent = new Map(
    students.map((s) => [s.id, stageFor(eventsByStudent.get(s.id) ?? [])]),
  );
  const doneCount = [...stagesByStudent.values()].filter(
    (stage) => stage === "concluido" || stage === "ausente",
  ).length;

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

      <ShareLocationToggle />

      {error && (
        <p className="rounded-input bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      {students.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno configurado para o turno {SHIFT_LABEL[selectedShift]}.{" "}
          <Link
            href={`/motorista/alunos/turnos?turno=${selectedShift}`}
            className="text-blue"
          >
            Configurar turnos
          </Link>
        </p>
      )}

      {students.length > 0 && (
        <div className="flex flex-col gap-4 rounded-card bg-surface p-5 shadow-card">
          <div className="flex items-center justify-between">
            <span className="font-heading text-sm font-semibold text-navy">
              {SHIFT_LABEL[selectedShift]}
            </span>
            <span className="text-xs font-medium text-muted">
              {doneCount} de {students.length} concluídos
            </span>
          </div>

          <div className="flex flex-col">
            {students.map((student, index) => {
              const events = eventsByStudent.get(student.id) ?? [];
              const stage = stagesByStudent.get(student.id)!;
              const badge = STAGE_BADGE[stage];
              const lastTime = events[events.length - 1]?.time;

              return (
                <div
                  key={student.id}
                  className="relative flex gap-3 pb-5 last:pb-0"
                >
                  {index < students.length - 1 && (
                    <div className="absolute bottom-0 left-[21px] top-11 w-px bg-border" />
                  )}
                  <StudentCheckinCard
                    studentName={student.full_name}
                    pickupAddress={student.pickup_address}
                    photoUrl={photoUrls.get(student.id) ?? null}
                    statusBadge={
                      badge ? (
                        <span
                          className={`w-fit rounded-pill px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
                        >
                          {badge.label}
                          {lastTime ? ` · ${lastTime}` : ""}
                        </span>
                      ) : null
                    }
                    stage={stage}
                    ringClassName={STAGE_RING[stage]}
                    primaryAction={STAGE_PRIMARY[stage]}
                    showAusenteButton={
                      stage === "aguardando_ida" || stage === "aguardando_volta"
                    }
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
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
