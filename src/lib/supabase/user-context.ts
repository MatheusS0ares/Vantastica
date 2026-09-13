import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const IMPERSONATION_COOKIE = "impersonate_org";

export type UserContext =
  | {
      role: "motorista";
      userId: string;
      organizationId: string;
      isAdminImpersonation?: boolean;
    }
  | { role: "responsavel"; userId: string; guardianId: string }
  | { role: "admin"; userId: string }
  | { role: null; userId: string | null };

/**
 * Determina se o usuário logado é dono/motorista (membro de uma
 * organização) ou responsável (guardian já vinculado a um aluno).
 *
 * auth.getUser() sempre revalida com o servidor do Supabase (ao
 * contrário de getSession()), então é uma chamada de rede de verdade —
 * cache() garante que o layout e a page da mesma navegação, que ambos
 * chamam getUserContext(), reaproveitem uma única chamada em vez de
 * duplicar o round-trip.
 */
export const getUserContext = cache(async (): Promise<UserContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { role: null, userId: null };
  }

  const { data: adminRow } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (adminRow) {
    const cookieStore = await cookies();
    const impersonatedOrgId = cookieStore.get(IMPERSONATION_COOKIE)?.value;

    if (impersonatedOrgId) {
      return {
        role: "motorista",
        userId: user.id,
        organizationId: impersonatedOrgId,
        isAdminImpersonation: true,
      };
    }

    return { role: "admin", userId: user.id };
  }

  const { data: membership } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })
    .limit(1)
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
    .limit(1)
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
});
