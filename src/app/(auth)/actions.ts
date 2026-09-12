"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function signIn(formData: FormData) {
  const email = readField(formData, "email");
  const password = readField(formData, "password");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }

  const context = await getUserContext();
  if (context.role === "motorista") redirect("/motorista");
  if (context.role === "responsavel") redirect("/responsavel");

  redirect(
    `/login?error=${encodeURIComponent(
      "Conta sem organização ou vínculo com aluno. Fale com quem te convidou.",
    )}`,
  );
}

export async function signUpMotorista(formData: FormData) {
  const email = readField(formData, "email");
  const password = readField(formData, "password");
  const orgName = readField(formData, "orgName");
  const phone = readField(formData, "phone") || null;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Se a confirmação de e-mail estiver ligada, ainda não teremos
      // sessão pra chamar create_organization agora — guardamos aqui
      // pra getUserContext completar o cadastro no primeiro login.
      data: { pending_org_name: orgName, pending_org_phone: phone },
    },
  });

  if (error) {
    redirect(`/cadastro?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      `/login?notice=${encodeURIComponent(
        "Verifique seu e-mail para confirmar a conta antes de entrar.",
      )}`,
    );
  }

  const { error: rpcError } = await supabase.rpc("create_organization", {
    org_name: orgName,
    org_phone: phone,
  });

  if (rpcError) {
    redirect(`/cadastro?error=${encodeURIComponent(rpcError.message)}`);
  }

  redirect("/motorista");
}

async function claimInviteOrRedirect(token: string) {
  const supabase = await createClient();
  const { data: claimed, error } = await supabase.rpc(
    "claim_guardian_invite",
    { token },
  );

  if (error || !claimed) {
    redirect(
      `/convite/${token}?error=${encodeURIComponent(
        "Convite inválido ou já utilizado.",
      )}`,
    );
  }

  redirect("/responsavel");
}

export async function signUpResponsavel(token: string, formData: FormData) {
  const email = readField(formData, "email");
  const password = readField(formData, "password");

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password });

  if (error) {
    redirect(`/convite/${token}?error=${encodeURIComponent(error.message)}`);
  }

  if (!data.session) {
    redirect(
      `/login?notice=${encodeURIComponent(
        "Verifique seu e-mail para confirmar a conta e depois volte no link do convite para vincular.",
      )}`,
    );
  }

  await claimInviteOrRedirect(token);
}

export async function signInResponsavel(token: string, formData: FormData) {
  const email = readField(formData, "email");
  const password = readField(formData, "password");

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect(`/convite/${token}?error=${encodeURIComponent(error.message)}`);
  }

  await claimInviteOrRedirect(token);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
