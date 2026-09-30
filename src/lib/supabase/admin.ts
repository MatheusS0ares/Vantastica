import { createClient } from "@supabase/supabase-js";

// Client separado com a service role key — só roda em código de
// servidor, nunca no browser. Único uso: criar/consultar contas de
// login (Admin API do GoTrue), fora do alcance da RLS.
function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } },
  );
}

// Senha inicial de toda conta de responsável criada pelo motorista —
// combinada de antemão com quem usa o app (ex.: "a senha de todo mundo
// começa assim, e no primeiro acesso já pede pra trocar"). Pode trocar
// via DEFAULT_GUARDIAN_PASSWORD na Vercel sem precisar redeploy de código.
export const DEFAULT_GUARDIAN_PASSWORD =
  process.env.DEFAULT_GUARDIAN_PASSWORD || "vantastica123";

async function findUserByEmail(
  admin: ReturnType<typeof createAdminClient>,
  email: string,
) {
  const normalized = email.trim().toLowerCase();

  // A Admin API não tem "buscar por e-mail" direto — só dá pra paginar
  // listUsers(). Pro tamanho desse app (uma van, algumas dezenas de
  // famílias) isso é rápido; o limite de páginas é só uma trava de
  // segurança pra nunca rodar em loop infinito.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({
      page,
      perPage: 200,
    });
    if (error || data.users.length === 0) break;

    const found = data.users.find(
      (u) => u.email?.toLowerCase() === normalized,
    );
    if (found) return found;

    if (data.users.length < 200) break;
  }

  return null;
}

/**
 * Cria a conta de login do responsável direto, com a senha padrão, já
 * confirmada (sem precisar do e-mail de confirmação do Supabase, que
 * era onde o fluxo antigo de convite por link travava pra parte dos
 * pais). Marca must_change_password pra forçar a troca no primeiro
 * acesso.
 *
 * Se o e-mail já tiver conta (ex.: o mesmo responsável tem outro filho
 * cadastrado em outra van/turma), reaproveita a conta existente sem
 * mexer na senha dela.
 */
export async function createOrFindGuardianAccount(
  email: string,
): Promise<{ userId: string; isNew: boolean } | { error: string }> {
  const admin = createAdminClient();

  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: DEFAULT_GUARDIAN_PASSWORD,
    email_confirm: true,
    user_metadata: { must_change_password: true },
  });

  if (!error && data.user) {
    return { userId: data.user.id, isNew: true };
  }

  const isDuplicate =
    error?.code === "email_exists" ||
    /already.*registered|already.*exists/i.test(error?.message ?? "");

  if (isDuplicate) {
    const existing = await findUserByEmail(admin, email);
    if (existing) return { userId: existing.id, isNew: false };
  }

  return {
    error: error?.message || "Não foi possível criar a conta do responsável.",
  };
}
