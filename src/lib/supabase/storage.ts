import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "student-photos";
const SIGNED_URL_TTL_SECONDS = 3600;

/**
 * Sobe a foto do aluno pro bucket privado, sob
 * "<organization_id>/<student_id>/...", que é o que a RLS de
 * storage.objects usa pra restringir acesso à própria organização (dono
 * da van) e ao próprio aluno (responsável vinculado). Retorna o path
 * salvo (não a URL — a URL é assinada sob demanda, com validade curta).
 */
export async function uploadStudentPhoto(
  supabase: SupabaseClient,
  organizationId: string,
  studentId: string,
  file: File,
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${organizationId}/${studentId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error("Falha ao subir foto do aluno:", error);
    return null;
  }

  return path;
}

export async function deleteStudentPhoto(
  supabase: SupabaseClient,
  path: string | null,
): Promise<void> {
  if (!path) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function getStudentPhotoSignedUrl(
  supabase: SupabaseClient,
  path: string | null,
): Promise<string | null> {
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.error("Falha ao gerar URL assinada da foto:", error);
    return null;
  }

  return data.signedUrl;
}

const ORG_ASSETS_BUCKET = "org-assets";

/**
 * Logo e foto da van não são dados sensíveis, então o bucket é público —
 * a URL retornada já é estável e final, sem precisar assinar/renovar
 * como as fotos de aluno.
 */
export async function uploadOrgAsset(
  supabase: SupabaseClient,
  organizationId: string,
  kind: "logo" | "van",
  file: File,
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${organizationId}/${kind}-${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(ORG_ASSETS_BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error("Falha ao subir imagem da organização:", error);
    return null;
  }

  return supabase.storage.from(ORG_ASSETS_BUCKET).getPublicUrl(path).data
    .publicUrl;
}
