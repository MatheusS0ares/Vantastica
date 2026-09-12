import { createClient } from "@/lib/supabase/server";

export type UserContext =
  | { role: "motorista"; userId: string; organizationId: string }
  | { role: "responsavel"; userId: string; guardianId: string }
  | { role: null; userId: string | null };

/**
 * Determina se o usuário logado é dono/motorista (membro de uma
 * organização) ou responsável (guardian já vinculado a um aluno).
 */
export async function getUserContext(): Promise<UserContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { role: null, userId: null };
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (membership) {
    return {
      role: "motorista",
      userId: user.id,
      organizationId: membership.organization_id,
    };
  }

  const { data: guardian } = await supabase
    .from("guardians")
    .select("id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (guardian) {
    return { role: "responsavel", userId: user.id, guardianId: guardian.id };
  }

  // Conta de motorista criada com confirmação de e-mail pendente: o
  // signUp não tinha sessão ainda pra chamar create_organization na
  // hora, então guardamos os dados em user_metadata. No primeiro login
  // com sessão de verdade, completamos o cadastro aqui.
  const pendingOrgName = user.user_metadata?.pending_org_name as
    | string
    | undefined;

  if (pendingOrgName) {
    const { data: newOrgId } = await supabase.rpc("create_organization", {
      org_name: pendingOrgName,
      org_phone: (user.user_metadata?.pending_org_phone as string) ?? null,
    });

    if (newOrgId) {
      return { role: "motorista", userId: user.id, organizationId: newOrgId };
    }
  }

  return { role: null, userId: user.id };
}
