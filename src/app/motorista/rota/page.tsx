import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { getStudentPhotoSignedUrl } from "@/lib/supabase/storage";
import { todayStartInBrazil, formatTimeInBrazil } from "@/lib/timezone";
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

export default async function RotaPage({
  searchParams,
}: PageProps<"/motorista/rota">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name, pickup_address, photo_url")
    .eq("organization_id", context.organizationId)
    .eq("is_active", true)
    .order("full_name");

  const studentIds = students?.map((s) => s.id) ?? [];

  const todayStart = todayStartInBrazil();

  const { data: todaysCheckins } = studentIds.length
    ? await supabase
        .from("checkins")
        .select("student_id, event_type, occurred_at")
        .in("student_id", studentIds)
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
      (students ?? []).map(
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

      {error && (
        <p className="rounded-input bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      {students && students.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno cadastrado ainda.{" "}
          <Link href="/motorista/alunos/novo" className="text-blue">
            Cadastrar aluno
          </Link>
        </p>
      )}

      <div className="flex flex-col gap-3">
        {students?.map((student) => {
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
              embarcarAction={recordCheckin.bind(null, student.id, "embarque")}
              entregarAction={recordCheckin.bind(null, student.id, "entrega")}
              ausenteAction={recordCheckin.bind(null, student.id, "ausente")}
            />
          );
        })}
      </div>
    </div>
  );
}
