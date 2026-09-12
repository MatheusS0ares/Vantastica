import type { SupabaseClient } from "@supabase/supabase-js";

const BUCKET = "student-photos";
const SIGNED_URL_TTL_SECONDS = 3600;

/**
 * Sobe a foto do aluno pro bucket privado, sob "<organization_id>/...",
 * que é o que a RLS de storage.objects usa pra restringir acesso à
 * própria organização. Retorna o path salvo (não a URL — a URL é
 * assinada sob demanda, com validade curta).
 */
export async function uploadStudentPhoto(
  supabase: SupabaseClient,
  organizationId: string,
  file: File,
): Promise<string | null> {
  if (!file || file.size === 0) return null;

  const extension = file.name.split(".").pop() || "jpg";
  const path = `${organizationId}/${crypto.randomUUID()}.${extension}`;

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type });

  if (error) {
    console.error("Falha ao subir foto do aluno:", error);
    return null;
  }

  return path;
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
