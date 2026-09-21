import { cache } from "react";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export const IMPERSONATION_COOKIE = "impersonate_org";

export type UserContext =
  | {
      role: "motorista";
      userId: string;
      organizationId: string;
      organizationName?: string;
      organizationLogoUrl?: string | null;
      isAdminImpersonation?: boolean;
    }
  | { role: "responsavel"; userId: string; guardianId: string }
  | { role: "admin"; userId: string }
  | { role: null; userId: string | null };

type UserContextRpcRow = {
  is_admin: boolean;
  organization_id: string | null;
  organization_name: string | null;
  organization_logo_url: string | null;
  guardian_id: string | null;
};

/**
 * Determina se o usuário logado é dono/motorista (membro de uma
 * organização) ou responsável (guardian já vinculado a um aluno).
 *
 * auth.getUser() sempre revalida com o servidor do Supabase (ao
 * contrário de getSession()), então é uma chamada de rede de verdade —
 * cache() garante que o layout e a page da mesma navegação, que ambos
 * chamam getUserContext(), reaproveitem uma única chamada em vez de
 * duplicar o round-trip.
 *
 * As checagens de admin/motorista/responsável (que antes eram 3
 * consultas sequenciais) viraram uma única chamada RPC
 * (get_user_context, ver migration 0014) — cada ida-e-volta a menos
 * aqui é uma navegação inteira mais rápida, já que isso roda em toda
 * página.
 */
export const getUserContext = cache(async (): Promise<UserContext> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { role: null, userId: null };
  }

  const { data: ctx } = await supabase
    .rpc("get_user_context")
    .maybeSingle<UserContextRpcRow>();

  if (ctx?.is_admin) {
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

  if (ctx?.organization_id) {
    return {
      role: "motorista",
      userId: user.id,
      organizationId: ctx.organization_id,
      organizationName: ctx.organization_name ?? undefined,
      organizationLogoUrl: ctx.organization_logo_url,
    };
  }

  if (ctx?.guardian_id) {
    return { role: "responsavel", userId: user.id, guardianId: ctx.guardian_id };
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
