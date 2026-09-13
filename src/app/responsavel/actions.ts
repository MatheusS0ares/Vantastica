"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { uploadStudentPhoto, deleteStudentPhoto } from "@/lib/supabase/storage";
import { getVehicleLocation, type VehicleLocation } from "@/lib/supabase/location";

export async function updateStudentPhotoAsGuardian(
  studentId: string,
  formData: FormData,
) {
  const context = await getUserContext();
  if (context.role !== "responsavel") redirect("/login");

  const photoFile = formData.get("photo") as File | null;
  if (!photoFile || photoFile.size === 0) return;

  const supabase = await createClient();

  // RLS de "students" só deixa o responsável LER o próprio aluno — a
  // troca de fato acontece pela RPC abaixo, que confere o vínculo de
  // novo e só mexe na coluna photo_url.
  const { data: student } = await supabase
    .from("students")
    .select("organization_id, photo_url")
    .eq("id", studentId)
    .maybeSingle();

  if (!student) {
    redirect(
      `/responsavel?error=${encodeURIComponent("Aluno não encontrado.")}`,
    );
  }

  const newPath = await uploadStudentPhoto(
    supabase,
    student.organization_id,
    studentId,
    photoFile,
  );

  if (!newPath) {
    redirect(
      `/responsavel?error=${encodeURIComponent("Não foi possível enviar a foto.")}`,
    );
  }

  const { data: updated, error } = await supabase.rpc(
    "update_student_photo_as_guardian",
    { sid: studentId, new_photo_url: newPath },
  );

  if (error || !updated) {
    redirect(
      `/responsavel?error=${encodeURIComponent("Você não tem permissão para editar a foto deste aluno.")}`,
    );
  }

  await deleteStudentPhoto(supabase, student.photo_url);

  revalidatePath("/responsavel");
}

/**
 * Chamada repetidamente pelo mapa ao vivo (polling no cliente) — a RLS
 * de vehicle_locations já garante que só volta algo se o responsável
 * for mesmo vinculado a um aluno dessa organização.
 */
export async function getVehicleLocationForResponsavel(
  organizationId: string,
): Promise<VehicleLocation | null> {
  const context = await getUserContext();
  if (context.role !== "responsavel") return null;

  const supabase = await createClient();
  return getVehicleLocation(supabase, organizationId);
}
