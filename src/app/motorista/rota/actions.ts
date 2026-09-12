"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { notifyGuardiansOfCheckin } from "@/lib/notifications";
import type { Shift } from "@/lib/shifts";

type CheckinEvent = "embarque" | "entrega" | "ausente";

export async function recordCheckin(
  studentId: string,
  shift: Shift,
  eventType: CheckinEvent,
) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const supabase = await createClient();

  const { data: student } = await supabase
    .from("students")
    .select("full_name")
    .eq("id", studentId)
    .single();

  const occurredAt = new Date();

  const { error } = await supabase.from("checkins").insert({
    student_id: studentId,
    shift,
    event_type: eventType,
    recorded_by: context.userId,
    occurred_at: occurredAt.toISOString(),
  });

  if (error) {
    redirect(
      `/motorista/rota?turno=${shift}&error=${encodeURIComponent(error.message)}`,
    );
  }

  if (student) {
    const { data: guardianLinks } = await supabase
      .from("student_guardians")
      .select("guardians(email)")
      .eq("student_id", studentId);

    const guardianEmails = (guardianLinks ?? [])
      .map(
        (link) =>
          (link.guardians as unknown as { email: string | null } | null)
            ?.email,
      )
      .filter((email): email is string => Boolean(email));

    await notifyGuardiansOfCheckin({
      studentName: student.full_name,
      eventType,
      occurredAt,
      guardianEmails,
    });
  }

  revalidatePath("/motorista/rota");
}
