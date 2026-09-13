"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { IMPERSONATION_COOKIE } from "@/lib/supabase/user-context";

// Re-verifica direto no banco em vez de confiar em getUserContext(): uma
// ação que concede acesso a qualquer organização não pode depender de um
// resultado cacheado — sempre confirma que quem está chamando é mesmo um
// admin da plataforma nesse exato momento.
async function requirePlatformAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: adminRow } = await supabase
    .from("platform_admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!adminRow) redirect("/login");
}

export async function impersonateOrganization(organizationId: string) {
  await requirePlatformAdmin();

  const cookieStore = await cookies();
  cookieStore.set(IMPERSONATION_COOKIE, organizationId, {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
  });

  redirect("/motorista");
}

export async function stopImpersonating() {
  await requirePlatformAdmin();

  const cookieStore = await cookies();
  cookieStore.delete(IMPERSONATION_COOKIE);

  redirect("/admin");
}
