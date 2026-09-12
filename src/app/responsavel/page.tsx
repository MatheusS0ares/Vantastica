import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { todayStartInBrazil, formatTimeInBrazil } from "@/lib/timezone";

type StatusInfo = {
  label: string;
  time?: string;
  className: string;
};

function statusFor(eventType: string | undefined, time: string | undefined): StatusInfo {
  if (eventType === "entrega") {
    return { label: "Entregue com segurança", time, className: "bg-sage text-mint" };
  }
  if (eventType === "embarque") {
    return { label: "Na van — a caminho", time, className: "bg-amber/10 text-amber" };
  }
  if (eventType === "ausente") {
    return { label: "Ausente hoje", time, className: "bg-coral/10 text-coral" };
  }
  return { label: "Aguardando coleta", className: "bg-border text-muted" };
}

export default async function ResponsavelStatusPage() {
  const context = await getUserContext();
  if (context.role !== "responsavel") redirect("/login");

  const supabase = await createClient();

  const { data: links } = await supabase
    .from("student_guardians")
    .select("students(id, full_name)")
    .eq("guardian_id", context.guardianId);

  const students = (links ?? [])
    .map(
      (link) =>
        link.students as unknown as { id: string; full_name: string } | null,
    )
    .filter((s): s is { id: string; full_name: string } => Boolean(s));

  const todayStart = todayStartInBrazil();

  const studentIds = students.map((s) => s.id);
  const { data: todaysCheckins } = studentIds.length
    ? await supabase
        .from("checkins")
        .select("student_id, event_type, occurred_at")
        .in("student_id", studentIds)
        .gte("occurred_at", todayStart.toISOString())
        .order("occurred_at", { ascending: true })
    : { data: [] as { student_id: string; event_type: string; occurred_at: string }[] };

  const latestByStudent = new Map<string, { event_type: string; time: string }>();
  for (const checkin of todaysCheckins ?? []) {
    const time = formatTimeInBrazil(new Date(checkin.occurred_at));
    latestByStudent.set(checkin.student_id, {
      event_type: checkin.event_type,
      time,
    });
  }

  return (
    <div className="flex flex-1 flex-col gap-4 px-5 py-6">
      <h1 className="font-heading text-xl font-bold text-navy">
        Status ao Vivo
      </h1>

      {students.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno vinculado à sua conta ainda.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {students.map((student) => {
          const latest = latestByStudent.get(student.id);
          const info = statusFor(latest?.event_type, latest?.time);

          return (
            <div
              key={student.id}
              className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card"
            >
              <span className="font-heading font-semibold text-navy">
                {student.full_name}
              </span>
              <div
                className={`flex flex-col gap-1 rounded-input px-4 py-3 ${info.className}`}
              >
                <span className="font-medium">{info.label}</span>
                {info.time && <span className="text-sm">Às {info.time}</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
