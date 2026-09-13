import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { formatCentsAsBRL } from "@/lib/currency";
import {
  createBulkInvoices,
  createInvoice,
  markInvoiceAsPaid,
  updateOrgPixKey,
} from "./actions";

const STATUS_LABEL: Record<string, string> = {
  pendente: "Pendente",
  pago: "Pago",
  atrasado: "Atrasado",
};

const STATUS_CLASS: Record<string, string> = {
  pendente: "bg-amber/10 text-amber",
  pago: "bg-sage text-mint",
  atrasado: "bg-coral/10 text-coral",
};

type InvoiceRow = {
  id: string;
  amount_cents: number;
  due_date: string;
  status: string;
  reference_month: string;
  students: { full_name: string } | null;
};

export default async function FinanceiroMotoristaPage({
  searchParams,
}: PageProps<"/motorista/financeiro">) {
  const context = await getUserContext();
  if (context.role !== "motorista") redirect("/login");

  const { error } = await searchParams;
  const supabase = await createClient();

  const { data: students } = await supabase
    .from("students")
    .select("id, full_name")
    .eq("organization_id", context.organizationId)
    .eq("is_active", true)
    .order("full_name");

  const { data: invoicesRaw } = await supabase
    .from("invoices")
    .select("id, amount_cents, due_date, status, reference_month, students(full_name)")
    .eq("organization_id", context.organizationId)
    .order("due_date", { ascending: false });

  const invoices = (invoicesRaw ?? []) as unknown as InvoiceRow[];

  const { data: org } = await supabase
    .from("organizations")
    .select("pix_key")
    .eq("id", context.organizationId)
    .maybeSingle();

  const today = new Date().toISOString().slice(0, 7); // "2026-09"

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <h1 className="font-heading text-xl font-bold text-navy">Financeiro</h1>

      {error && (
        <p className="rounded-input bg-coral/10 px-3 py-2 text-sm text-coral">
          {error}
        </p>
      )}

      <div className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card">
        <span className="font-heading text-sm font-semibold text-navy">
          Chave PIX
        </span>
        <form action={updateOrgPixKey} className="flex gap-2">
          <input
            type="text"
            name="pixKey"
            defaultValue={org?.pix_key ?? ""}
            placeholder="CPF, e-mail, telefone ou chave aleatória"
            className="flex-1 rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
          />
          <button
            type="submit"
            className="rounded-pill bg-navy px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
          >
            Salvar
          </button>
        </form>
      </div>

      <details className="rounded-card bg-surface p-4 shadow-card">
        <summary className="cursor-pointer font-heading text-sm font-semibold text-navy">
          + Gerar mensalidades do mês (todos os alunos)
        </summary>
        <form
          action={createBulkInvoices}
          className="mt-4 flex flex-col gap-4"
        >
          <p className="text-xs text-muted">
            Cria uma mensalidade com o mesmo valor e vencimento pra cada
            aluno ativo. Quem já tiver mensalidade lançada nesse mês não é
            afetado.
          </p>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Mês de referência
            <input
              type="month"
              name="referenceMonth"
              required
              defaultValue={today}
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Valor (R$)
            <input
              type="text"
              name="amount"
              required
              placeholder="450,00"
              inputMode="decimal"
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Vencimento
            <input
              type="date"
              name="dueDate"
              required
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <button
            type="submit"
            className="rounded-pill bg-mint px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Gerar mensalidades
          </button>
        </form>
      </details>

      <details className="rounded-card bg-surface p-4 shadow-card">
        <summary className="cursor-pointer font-heading text-sm font-semibold text-navy">
          + Nova mensalidade
        </summary>
        <form action={createInvoice} className="mt-4 flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Aluno
            <select
              name="studentId"
              required
              className="rounded-input border border-border bg-surface px-3 py-2 text-base outline-none focus:border-blue"
            >
              <option value="">Selecione...</option>
              {students?.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.full_name}
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Mês de referência
            <input
              type="month"
              name="referenceMonth"
              required
              defaultValue={today}
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Valor (R$)
            <input
              type="text"
              name="amount"
              required
              placeholder="450,00"
              inputMode="decimal"
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-text">
            Vencimento
            <input
              type="date"
              name="dueDate"
              required
              className="rounded-input border border-border px-3 py-2 text-base outline-none focus:border-blue"
            />
          </label>
          <button
            type="submit"
            className="rounded-pill bg-navy px-6 py-3 font-medium text-white transition hover:opacity-90"
          >
            Criar mensalidade
          </button>
        </form>
      </details>

      <div className="flex flex-col gap-3">
        <span className="font-heading text-sm font-semibold text-navy">
          Mensalidades
        </span>

        {invoices.length === 0 && (
          <p className="text-sm text-muted">
            Nenhuma mensalidade cadastrada ainda.
          </p>
        )}

        {invoices.map((invoice) => {
          const isOverdue =
            invoice.status === "pendente" &&
            invoice.due_date < new Date().toISOString().slice(0, 10);
          const statusKey = isOverdue ? "atrasado" : invoice.status;

          return (
            <div
              key={invoice.id}
              className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card"
            >
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="font-medium text-navy">
                    {invoice.students?.full_name ?? "Aluno removido"}
                  </span>
                  <span className="text-sm text-muted">
                    Vencimento: {new Date(invoice.due_date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="font-heading font-bold text-navy">
                    {formatCentsAsBRL(invoice.amount_cents)}
                  </span>
                  <span
                    className={`rounded-pill px-3 py-1 text-xs font-semibold ${STATUS_CLASS[statusKey]}`}
                  >
                    {STATUS_LABEL[statusKey]}
                  </span>
                </div>
              </div>
              {invoice.status !== "pago" && (
                <form action={markInvoiceAsPaid.bind(null, invoice.id)}>
                  <button
                    type="submit"
                    className="w-full rounded-pill border border-mint px-4 py-2 text-sm font-medium text-mint transition hover:opacity-80"
                  >
                    Marcar como pago
                  </button>
                </form>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
