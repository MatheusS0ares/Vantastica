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

  const [{ data: student }, { data: organization }] = await Promise.all([
    supabase.from("students").select("full_name").eq("id", studentId).single(),
    supabase
      .from("organizations")
      .select("name, logo_url")
      .eq("id", context.organizationId)
      .maybeSingle(),
  ]);

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
      organizationName: organization?.name ?? "VanTástica",
      organizationLogoUrl: organization?.logo_url,
    });
  }

  revalidatePath("/motorista/rota");
}

/**
 * Chamada repetidamente pelo navegador do motorista (via
 * navigator.geolocation.watchPosition) enquanto ele compartilha
 * localização — nunca redireciona em caso de erro, já que isso
 * quebraria a chamada silenciosa feita em segundo plano pelo cliente.
 */
export async function updateVehicleLocation(
  latitude: number,
  longitude: number,
) {
  const context = await getUserContext();
  if (context.role !== "motorista") return;

  const supabase = await createClient();
  await supabase.from("vehicle_locations").upsert(
    {
      organization_id: context.organizationId,
      latitude,
      longitude,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "organization_id" },
  );
}
