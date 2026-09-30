"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";

export async function updateOwnPassword(formData: FormData) {
  const context = await getUserContext();
  if (context.role !== "responsavel") redirect("/login");

  const password = String(formData.get("password") ?? "").trim();
  const confirmPassword = String(formData.get("confirmPassword") ?? "").trim();

  if (password.length < 6) {
    redirect(
      `/trocar-senha?error=${encodeURIComponent("A senha precisa ter pelo menos 6 caracteres.")}`,
    );
  }

  if (password !== confirmPassword) {
    redirect(
      `/trocar-senha?error=${encodeURIComponent("As senhas não coincidem.")}`,
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({
    password,
    data: { must_change_password: false },
  });

  if (error) {
    redirect(`/trocar-senha?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/responsavel");
}
