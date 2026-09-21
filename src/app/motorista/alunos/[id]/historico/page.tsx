import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { getStudentPhotoSignedUrl } from "@/lib/supabase/storage";
import {
  dateKeyInBrazil,
  formatTimeInBrazil,
  timeStringToMinutes,
} from "@/lib/timezone";
import { SHIFTS, SHIFT_LABEL, type Shift } from "@/lib/shifts";

const LATE_TOLERANCE_MINUTES = 5;
const HISTORY_DAYS = 30;

type ShiftKey = Shift | "sem_turno";

type StudentShiftRow = {
  shift: Shift;
  expected_pickup_time: string | null;
  expected_dropoff_time: string | null;
};

type CheckinRow = {
  event_type: "embarque" | "entrega" | "ausente";
  occurred_at: string;
  shift: Shift | null;
};

// Um turno é a ida-e-volta inteira (ex.: matutino = busca em casa +
// chegada na escola + busca na escola ao meio-dia + entrega em casa),
// por isso cada dia/turno guarda até 4 horários, não só 2.
type ShiftEntry = {
  pickupIdaAt: Date | null;
  dropoffIdaAt: Date | null;
  pickupVoltaAt: Date | null;
  dropoffVoltaAt: Date | null;
  ausente: boolean;
};

function emptyEntry(): ShiftEntry {
  return {
    pickupIdaAt: null,
    dropoffIdaAt: null,
    pickupVoltaAt: null,
    dropoffVoltaAt: null,
    ausente: false,
  };
}

type Punctuality = "no-horario" | "atrasado" | null;

function punctualityFor(
  actualAt: Date | null,
  expectedTime: string | null,
): Punctuality {
  if (!actualAt || !expectedTime) return null;

  const actualMinutes = timeStringToMinutes(formatTimeInBrazil(actualAt));
  const expectedMinutes = timeStringToMinutes(expectedTime);

  return actualMinutes - expectedMinutes > LATE_TOLERANCE_MINUTES
    ? "atrasado"
    : "no-horario";
}

function PunctualityBadge({
  punctuality,
  minutesLate,
}: {
  punctuality: Punctuality;
  minutesLate: number;
}) {
  if (punctuality === "atrasado") {
    return (
      <span className="rounded-pill bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
        Atrasado {minutesLate}min
      </span>
    );
  }
  if (punctuality === "no-horario") {
    return (
      <span className="rounded-pill bg-sage px-2 py-0.5 text-xs font-semibold text-mint">
        No horário
      </span>
    );
  }
  return null;
}

function ShiftCard({
  label,
  entry,
  expectedPickup,
  expectedDropoff,
}: {
  label: string;
  entry: ShiftEntry;
  expectedPickup: string | null;
  expectedDropoff: string | null;
}) {
  // Só os dois extremos do turno (primeira busca e entrega final) têm
  // horário previsto configurado — as etapas do meio (chegada/busca na
  // escola) aparecem só informativamente, sem selo de pontualidade.
  function renderRow(
    rowLabel: string,
    at: Date | null,
    expected: string | null,
  ) {
    const punctuality = punctualityFor(at, expected);
    const minutesLate = at
      ? timeStringToMinutes(formatTimeInBrazil(at)) -
        timeStringToMinutes(expected ?? "00:00")
      : 0;

    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{rowLabel}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-navy">
            {at ? formatTimeInBrazil(at) : "—"}
          </span>
          <PunctualityBadge
            punctuality={punctuality}
            minutesLate={minutesLate}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted">
          {label}
        </span>
        {entry.ausente && (
          <span className="rounded-pill bg-coral/10 px-2 py-0.5 text-xs font-semibold text-coral">
            Ausente
          </span>
        )}
      </div>
      {/* Mesmo com ausência marcada (ex.: na volta), as pernas que já
          aconteceram antes disso continuam visíveis — só as que não
          rolaram aparecem como "—". */}
      {renderRow("Busca (ida)", entry.pickupIdaAt, expectedPickup)}
      {renderRow("Chegada na escola", entry.dropoffIdaAt, null)}
      {renderRow("Busca na escola (volta)", entry.pickupVoltaAt, null)}
      {renderRow("Entrega em casa", entry.dropoffVoltaAt, expectedDropoff)}
    </div>
  );
}

export default async function AlunoHistoricoPage({
  params,
}: PageProps<"/motorista/alunos/[id]/historico">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { id } = await params;
  const supabase = await createClient();

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - HISTORY_DAYS);

  // student, shiftsRaw e checkinsRaw só dependem do `id` da URL, não
  // um do outro — buscar em paralelo poupa 2 idas-e-voltas sequenciais.
  const [{ data: student }, { data: shiftsRaw }, { data: checkinsRaw }] =
    await Promise.all([
      supabase
        .from("students")
        .select("id, full_name, photo_url")
        .eq("id", id)
        .maybeSingle(),
      supabase
        .from("student_shifts")
        .select("shift, expected_pickup_time, expected_dropoff_time")
        .eq("student_id", id),
      supabase
        .from("checkins")
        .select("event_type, occurred_at, shift")
        .eq("student_id", id)
        .gte("occurred_at", fromDate.toISOString())
        .order("occurred_at", { ascending: true }),
    ]);

  if (!student) {
    notFound();
  }

  const photoUrl = await getStudentPhotoSignedUrl(supabase, student.photo_url);

  const shiftByName = new Map(
    ((shiftsRaw ?? []) as StudentShiftRow[]).map((s) => [
      s.shift,
      {
        pickup: s.expected_pickup_time?.slice(0, 5) ?? null,
        dropoff: s.expected_dropoff_time?.slice(0, 5) ?? null,
      },
    ]),
  );
  const enrolledShifts = SHIFTS.filter((shift) => shiftByName.has(shift));

  const checkins = (checkinsRaw ?? []) as CheckinRow[];

  const dayByKey = new Map<string, Map<ShiftKey, ShiftEntry>>();
  for (const checkin of checkins) {
    const occurredAt = new Date(checkin.occurred_at);
    const dateKey = dateKeyInBrazil(occurredAt);
    const shiftKey: ShiftKey = checkin.shift ?? "sem_turno";

    const dayMap = dayByKey.get(dateKey) ?? new Map<ShiftKey, ShiftEntry>();
    const entry = dayMap.get(shiftKey) ?? emptyEntry();

    // Primeiro embarque/entrega do dia+turno = perna de ida; o segundo
    // = perna de volta (busca/entrega na escola ao final do turno).
    if (checkin.event_type === "embarque") {
      if (!entry.pickupIdaAt) entry.pickupIdaAt = occurredAt;
      else entry.pickupVoltaAt = occurredAt;
    } else if (checkin.event_type === "entrega") {
      if (!entry.dropoffIdaAt) entry.dropoffIdaAt = occurredAt;
      else entry.dropoffVoltaAt = occurredAt;
    } else {
      entry.ausente = true;
    }

    dayMap.set(shiftKey, entry);
    dayByKey.set(dateKey, dayMap);
  }

  // "Hoje" sempre mostra todos os turnos em que o aluno está matriculado
  // (mesmo sem nenhum check-in ainda, pra deixar claro o que falta
  // registrar); dias passados só mostram turnos que de fato tiveram
  // check-in, senão todo dia ganharia linhas "—/—" pros turnos parados.
  function shiftsWithData(dayMap: Map<ShiftKey, ShiftEntry> | undefined) {
    const shifts: ShiftKey[] = enrolledShifts.filter((shift) =>
      dayMap?.has(shift),
    );
    if (dayMap?.has("sem_turno")) shifts.push("sem_turno");
    return shifts;
  }

  const todayKey = dateKeyInBrazil(new Date());
  const todayMap = dayByKey.get(todayKey);
  const todayShifts: ShiftKey[] = [...enrolledShifts];
  if (todayMap?.has("sem_turno")) todayShifts.push("sem_turno");

  const pastDays = Array.from(dayByKey.keys())
    .filter((dateKey) => dateKey !== todayKey)
    .sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <Link href={`/motorista/alunos/${id}`} className="text-sm text-muted">
        ← {student.full_name}
      </Link>

      <div className="flex items-center gap-3">
        {photoUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={photoUrl}
            alt={student.full_name}
            className="h-12 w-12 rounded-full object-cover"
          />
        )}
        <h1 className="font-heading text-xl font-bold text-navy">
          Relatório de {student.full_name}
        </h1>
      </div>

      {enrolledShifts.length === 0 && (
        <p className="rounded-input bg-amber/10 px-3 py-2 text-sm text-amber">
          Nenhum turno configurado ainda — defina no dossiê do aluno pra ver
          se ele está sendo pego/entregue no horário.
        </p>
      )}

      <div className="flex flex-col gap-4 rounded-card bg-surface p-4 shadow-card">
        <span className="font-heading text-sm font-semibold text-navy">
          Hoje
        </span>
        {todayShifts.length === 0 && (
          <p className="text-sm text-muted">Nenhum registro hoje.</p>
        )}
        {todayShifts.map((shift) => (
          <ShiftCard
            key={shift}
            label={
              shift === "sem_turno" ? "Turno não informado" : SHIFT_LABEL[shift]
            }
            entry={todayMap?.get(shift) ?? emptyEntry()}
            expectedPickup={
              shift === "sem_turno" ? null : (shiftByName.get(shift)?.pickup ?? null)
            }
            expectedDropoff={
              shift === "sem_turno" ? null : (shiftByName.get(shift)?.dropoff ?? null)
            }
          />
        ))}
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-heading text-sm font-semibold text-navy">
          Últimos {HISTORY_DAYS} dias
        </span>

        {pastDays.length === 0 && (
          <p className="text-sm text-muted">
            Nenhum registro nos últimos {HISTORY_DAYS} dias.
          </p>
        )}

        {pastDays.map((dateKey) => {
          const dayMap = dayByKey.get(dateKey);
          const dayShifts = shiftsWithData(dayMap);

          if (dayShifts.length === 0) return null;

          return (
            <div
              key={dateKey}
              className="flex flex-col gap-3 rounded-card bg-surface p-3 shadow-card"
            >
              <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                {new Date(dateKey + "T00:00:00").toLocaleDateString("pt-BR", {
                  weekday: "short",
                  day: "2-digit",
                  month: "2-digit",
                })}
              </span>
              {dayShifts.map((shift) => (
                <ShiftCard
                  key={shift}
                  label={
                    shift === "sem_turno"
                      ? "Turno não informado"
                      : SHIFT_LABEL[shift]
                  }
                  entry={dayMap?.get(shift) ?? emptyEntry()}
                  expectedPickup={
                    shift === "sem_turno"
                      ? null
                      : (shiftByName.get(shift)?.pickup ?? null)
                  }
                  expectedDropoff={
                    shift === "sem_turno"
                      ? null
                      : (shiftByName.get(shift)?.dropoff ?? null)
                  }
                />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
