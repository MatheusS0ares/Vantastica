"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function updateOrganization(formData: FormData) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const name = readField(formData, "name");
  const phone = readField(formData, "phone") || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ name, phone })
    .eq("id", context.organizationId);

  if (error) {
    redirect(`/motorista/perfil?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/motorista/perfil");
}

export async function createCalendarEvent(formData: FormData) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const eventDate = readField(formData, "eventDate");
  const title = readField(formData, "title");
  const eventType = readField(formData, "eventType");

  const supabase = await createClient();
  const { error } = await supabase.from("school_calendar_events").insert({
    organization_id: context.organizationId,
    event_date: eventDate,
    title,
    event_type: eventType,
  });

  if (error) {
    redirect(`/motorista/perfil?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/motorista/perfil");
  revalidatePath("/responsavel/calendario");
}

export async function deleteCalendarEvent(eventId: string) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const supabase = await createClient();
  await supabase.from("school_calendar_events").delete().eq("id", eventId);

  revalidatePath("/motorista/perfil");
  revalidatePath("/responsavel/calendario");
}
