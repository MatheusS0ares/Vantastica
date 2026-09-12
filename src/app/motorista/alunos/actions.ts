"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { uploadStudentPhoto, deleteStudentPhoto } from "@/lib/supabase/storage";

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function createStudent(formData: FormData) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const fullName = readField(formData, "fullName");
  const schoolName = readField(formData, "schoolName") || null;
  const className = readField(formData, "className") || null;
  const pickupAddress = readField(formData, "pickupAddress") || null;
  const dropoffAddress = readField(formData, "dropoffAddress") || null;
  const medicalNotes = readField(formData, "medicalNotes") || null;
  const expectedPickupTime = readField(formData, "expectedPickupTime") || null;
  const expectedDropoffTime =
    readField(formData, "expectedDropoffTime") || null;
  const photoFile = formData.get("photo") as File | null;

  const supabase = await createClient();

  // O path da foto inclui o student_id (pra RLS restringir por aluno),
  // então o aluno precisa existir primeiro; a foto é anexada logo em
  // seguida, sem bloquear o cadastro se o upload falhar.
  const { data, error } = await supabase
    .from("students")
    .insert({
      organization_id: context.organizationId,
      full_name: fullName,
      school_name: schoolName,
      class_name: className,
      pickup_address: pickupAddress,
      dropoff_address: dropoffAddress,
      medical_notes: medicalNotes,
      expected_pickup_time: expectedPickupTime,
      expected_dropoff_time: expectedDropoffTime,
    })
    .select("id")
    .single();

  if (error) {
    redirect(`/motorista/alunos/novo?error=${encodeURIComponent(error.message)}`);
  }

  if (photoFile && photoFile.size > 0) {
    const photoUrl = await uploadStudentPhoto(
      supabase,
      context.organizationId,
      data.id,
      photoFile,
    );
    if (photoUrl) {
      await supabase.from("students").update({ photo_url: photoUrl }).eq("id", data.id);
    }
  }

  redirect(`/motorista/alunos/${data.id}`);
}

export async function updateStudentPhoto(
  studentId: string,
  formData: FormData,
) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const photoFile = formData.get("photo") as File | null;
  if (!photoFile || photoFile.size === 0) return;

  const supabase = await createClient();

  const { data: existing } = await supabase
    .from("students")
    .select("photo_url")
    .eq("id", studentId)
    .maybeSingle();

  const newPath = await uploadStudentPhoto(
    supabase,
    context.organizationId,
    studentId,
    photoFile,
  );

  if (!newPath) {
    redirect(
      `/motorista/alunos/${studentId}?error=${encodeURIComponent("Não foi possível enviar a foto.")}`,
    );
  }

  const { error } = await supabase
    .from("students")
    .update({ photo_url: newPath })
    .eq("id", studentId);

  if (error) {
    redirect(
      `/motorista/alunos/${studentId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  // Só remove a antiga depois que a nova já está salva — evita ficar
  // sem nenhuma foto se algo falhar no meio do caminho.
  await deleteStudentPhoto(supabase, existing?.photo_url ?? null);

  revalidatePath(`/motorista/alunos/${studentId}`);
}

export async function updateStudentSchedule(
  studentId: string,
  formData: FormData,
) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const expectedPickupTime = readField(formData, "expectedPickupTime") || null;
  const expectedDropoffTime =
    readField(formData, "expectedDropoffTime") || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("students")
    .update({
      expected_pickup_time: expectedPickupTime,
      expected_dropoff_time: expectedDropoffTime,
    })
    .eq("id", studentId);

  if (error) {
    redirect(
      `/motorista/alunos/${studentId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/motorista/alunos/${studentId}`);
  revalidatePath(`/motorista/alunos/${studentId}/historico`);
}

export async function createIncident(studentId: string, formData: FormData) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const title = readField(formData, "title");
  const description = readField(formData, "description") || null;

  const supabase = await createClient();
  const { error } = await supabase.from("incidents").insert({
    organization_id: context.organizationId,
    student_id: studentId,
    title,
    description,
    created_by: context.userId,
  });

  if (error) {
    redirect(
      `/motorista/alunos/${studentId}?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath(`/motorista/alunos/${studentId}`);
}

export async function addGuardianToStudent(
  studentId: string,
  formData: FormData,
) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const fullName = readField(formData, "fullName");
  const phone = readField(formData, "phone") || null;
  const relationship = readField(formData, "relationship") || null;
  const isPrimaryContact = formData.get("isPrimaryContact") === "on";
  const canPickUp = formData.get("canPickUp") === "on";

  const supabase = await createClient();

  const { data: guardian, error: guardianError } = await supabase
    .from("guardians")
    .insert({ full_name: fullName, phone })
    .select("id")
    .single();

  if (guardianError) {
    redirect(
      `/motorista/alunos/${studentId}?error=${encodeURIComponent(guardianError.message)}`,
    );
  }

  const { error: linkError } = await supabase.from("student_guardians").insert({
    student_id: studentId,
    guardian_id: guardian.id,
    relationship,
    is_primary_contact: isPrimaryContact,
    can_pick_up: canPickUp,
  });

  if (linkError) {
    redirect(
      `/motorista/alunos/${studentId}?error=${encodeURIComponent(linkError.message)}`,
    );
  }

  revalidatePath(`/motorista/alunos/${studentId}`);
}
