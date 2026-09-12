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

const LATE_TOLERANCE_MINUTES = 5;
const HISTORY_DAYS = 30;

type CheckinRow = {
  event_type: "embarque" | "entrega" | "ausente";
  occurred_at: string;
};

type DayEntry = {
  dateKey: string;
  pickupAt: Date | null;
  dropoffAt: Date | null;
  ausente: boolean;
};

type Punctuality = "no-horario" | "atrasado" | "sem-previsao" | null;

function punctualityFor(
  actualAt: Date | null,
  expectedTime: string | null,
): Punctuality {
  if (!actualAt) return null;
  if (!expectedTime) return "sem-previsao";

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

export default async function AlunoHistoricoPage({
  params,
}: PageProps<"/motorista/alunos/[id]/historico">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { id } = await params;
  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select(
      "id, full_name, photo_url, expected_pickup_time, expected_dropoff_time",
    )
    .eq("id", id)
    .maybeSingle();

  if (!student) {
    notFound();
  }

  const photoUrl = await getStudentPhotoSignedUrl(supabase, student.photo_url);
  const expectedPickup = student.expected_pickup_time?.slice(0, 5) ?? null;
  const expectedDropoff = student.expected_dropoff_time?.slice(0, 5) ?? null;

  const fromDate = new Date();
  fromDate.setDate(fromDate.getDate() - HISTORY_DAYS);

  const { data: checkinsRaw } = await supabase
    .from("checkins")
    .select("event_type, occurred_at")
    .eq("student_id", id)
    .gte("occurred_at", fromDate.toISOString())
    .order("occurred_at", { ascending: true });

  const checkins = (checkinsRaw ?? []) as CheckinRow[];

  const dayByKey = new Map<string, DayEntry>();
  for (const checkin of checkins) {
    const occurredAt = new Date(checkin.occurred_at);
    const dateKey = dateKeyInBrazil(occurredAt);

    const entry = dayByKey.get(dateKey) ?? {
      dateKey,
      pickupAt: null,
      dropoffAt: null,
      ausente: false,
    };

    if (checkin.event_type === "embarque") entry.pickupAt = occurredAt;
    else if (checkin.event_type === "entrega") entry.dropoffAt = occurredAt;
    else entry.ausente = true;

    dayByKey.set(dateKey, entry);
  }

  const todayKey = dateKeyInBrazil(new Date());
  const today = dayByKey.get(todayKey) ?? {
    dateKey: todayKey,
    pickupAt: null,
    dropoffAt: null,
    ausente: false,
  };

  const days = Array.from(dayByKey.values())
    .filter((day) => day.dateKey !== todayKey)
    .sort((a, b) => (a.dateKey < b.dateKey ? 1 : -1));

  function renderRow(label: string, at: Date | null, expected: string | null) {
    const punctuality = punctualityFor(at, expected);
    const minutesLate = at
      ? timeStringToMinutes(formatTimeInBrazil(at)) -
        timeStringToMinutes(expected ?? "00:00")
      : 0;

    return (
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">{label}</span>
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
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <Link
        href={`/motorista/alunos/${id}`}
        className="text-sm text-muted"
      >
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

      {!expectedPickup && !expectedDropoff && (
        <p className="rounded-input bg-amber/10 px-3 py-2 text-sm text-amber">
          Nenhum horário previsto cadastrado ainda — defina no dossiê do
          aluno pra ver se ele está sendo pego/entregue no horário.
        </p>
      )}

      <div className="flex flex-col gap-3 rounded-card bg-surface p-4 shadow-card">
        <span className="font-heading text-sm font-semibold text-navy">
          Hoje
        </span>
        {today.ausente ? (
          <span className="rounded-pill bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
            Ausente
          </span>
        ) : (
          <>
            {renderRow("Busca", today.pickupAt, expectedPickup)}
            {renderRow("Entrega", today.dropoffAt, expectedDropoff)}
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <span className="font-heading text-sm font-semibold text-navy">
          Últimos {HISTORY_DAYS} dias
        </span>

        {days.length === 0 && (
          <p className="text-sm text-muted">
            Nenhum registro nos últimos {HISTORY_DAYS} dias.
          </p>
        )}

        {days.map((day) => (
          <div
            key={day.dateKey}
            className="flex flex-col gap-2 rounded-card bg-surface p-3 shadow-card"
          >
            <span className="text-xs font-semibold uppercase tracking-wide text-muted">
              {new Date(day.dateKey + "T00:00:00").toLocaleDateString(
                "pt-BR",
                { weekday: "short", day: "2-digit", month: "2-digit" },
              )}
            </span>
            {day.ausente ? (
              <span className="w-fit rounded-pill bg-coral/10 px-3 py-1 text-xs font-semibold text-coral">
                Ausente
              </span>
            ) : (
              <>
                {renderRow("Busca", day.pickupAt, expectedPickup)}
                {renderRow("Entrega", day.dropoffAt, expectedDropoff)}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
