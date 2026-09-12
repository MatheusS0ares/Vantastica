"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { parseBRLToCents } from "@/lib/currency";

function readField(formData: FormData, name: string): string {
  return String(formData.get(name) ?? "").trim();
}

export async function createInvoice(formData: FormData) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const studentId = readField(formData, "studentId");
  const amountCents = parseBRLToCents(readField(formData, "amount"));
  const dueDate = readField(formData, "dueDate");
  const referenceMonthInput = readField(formData, "referenceMonth"); // "2026-09"
  const referenceMonth = `${referenceMonthInput}-01`;

  const supabase = await createClient();
  const { error } = await supabase.from("invoices").insert({
    organization_id: context.organizationId,
    student_id: studentId,
    reference_month: referenceMonth,
    amount_cents: amountCents,
    due_date: dueDate,
  });

  if (error) {
    redirect(
      `/motorista/financeiro?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/motorista/financeiro");
}

export async function markInvoiceAsPaid(invoiceId: string) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const supabase = await createClient();
  const { error } = await supabase
    .from("invoices")
    .update({ status: "pago", paid_at: new Date().toISOString() })
    .eq("id", invoiceId);

  if (error) {
    redirect(
      `/motorista/financeiro?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/motorista/financeiro");
}

export async function updateOrgPixKey(formData: FormData) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const pixKey = readField(formData, "pixKey") || null;

  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({ pix_key: pixKey })
    .eq("id", context.organizationId);

  if (error) {
    redirect(
      `/motorista/financeiro?error=${encodeURIComponent(error.message)}`,
    );
  }

  revalidatePath("/motorista/financeiro");
}
