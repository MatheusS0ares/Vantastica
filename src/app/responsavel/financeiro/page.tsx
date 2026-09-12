import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserContext } from "@/lib/supabase/user-context";
import { formatCentsAsBRL } from "@/lib/currency";
import { CopyText } from "@/components/CopyText";

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

type StudentRow = {
  id: string;
  full_name: string;
  organization_id: string;
};

type InvoiceRow = {
  id: string;
  amount_cents: number;
  due_date: string;
  status: string;
  reference_month: string;
};

export default async function FinanceiroResponsavelPage() {
  const context = await getUserContext();
  if (context.role !== "responsavel") redirect("/login");

  const supabase = await createClient();

  const { data: links } = await supabase
    .from("student_guardians")
    .select("students(id, full_name, organization_id)")
    .eq("guardian_id", context.guardianId);

  const students = (links ?? [])
    .map((link) => link.students as unknown as StudentRow | null)
    .filter((s): s is StudentRow => Boolean(s));

  const studentsWithData = await Promise.all(
    students.map(async (student) => {
      const [{ data: invoicesRaw }, { data: org }] = await Promise.all([
        supabase
          .from("invoices")
          .select("id, amount_cents, due_date, status, reference_month")
          .eq("student_id", student.id)
          .order("reference_month", { ascending: false }),
        supabase
          .from("organizations")
          .select("name, pix_key")
          .eq("id", student.organization_id)
          .maybeSingle(),
      ]);

      return {
        student,
        invoices: (invoicesRaw ?? []) as InvoiceRow[],
        orgName: org?.name ?? null,
        pixKey: org?.pix_key ?? null,
      };
    }),
  );

  const todayStr = new Date().toISOString().slice(0, 10);

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <h1 className="font-heading text-xl font-bold text-navy">Financeiro</h1>

      {studentsWithData.length === 0 && (
        <p className="mt-6 text-center text-sm text-muted">
          Nenhum aluno vinculado à sua conta ainda.
        </p>
      )}

      {studentsWithData.map(({ student, invoices, orgName, pixKey }) => {
        const [current, ...history] = invoices;
        const isOverdue =
          current?.status === "pendente" && current.due_date < todayStr;
        const statusKey = current
          ? isOverdue
            ? "atrasado"
            : current.status
          : null;

        return (
          <div key={student.id} className="flex flex-col gap-4">
            <span className="font-heading font-semibold text-navy">
              {student.full_name}
            </span>

            {current ? (
              <div className="flex flex-col gap-3 rounded-card bg-surface p-5 shadow-card">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted">
                    {new Date(current.reference_month + "T00:00:00").toLocaleDateString(
                      "pt-BR",
                      { month: "long", year: "numeric" },
                    )}
                  </span>
                  {statusKey && (
                    <span
                      className={`rounded-pill px-3 py-1 text-xs font-semibold ${STATUS_CLASS[statusKey]}`}
                    >
                      {STATUS_LABEL[statusKey]}
                    </span>
                  )}
                </div>
                <span className="font-heading text-2xl font-bold text-navy">
                  {formatCentsAsBRL(current.amount_cents)}
                </span>
                <span className="text-sm text-muted">
                  Vencimento:{" "}
                  {new Date(current.due_date + "T00:00:00").toLocaleDateString(
                    "pt-BR",
                  )}
                </span>

                {pixKey && (
                  <div className="mt-2 flex items-center justify-between gap-3 rounded-input border border-border px-3 py-2">
                    <div className="flex flex-col min-w-0">
                      <span className="text-xs text-muted">
                        Chave PIX · {orgName}
                      </span>
                      <span className="truncate text-sm font-medium text-navy">
                        {pixKey}
                      </span>
                    </div>
                    <CopyText text={pixKey} label="Copiar" />
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted">
                Nenhuma mensalidade lançada ainda.
              </p>
            )}

            {history.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                  Histórico
                </span>
                {history.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between rounded-card bg-surface p-3 shadow-card"
                  >
                    <span className="text-sm text-text">
                      {new Date(
                        invoice.reference_month + "T00:00:00",
                      ).toLocaleDateString("pt-BR", {
                        month: "long",
                        year: "numeric",
                      })}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-navy">
                        {formatCentsAsBRL(invoice.amount_cents)}
                      </span>
                      <span
                        className={`rounded-pill px-2 py-0.5 text-xs font-semibold ${STATUS_CLASS[invoice.status]}`}
                      >
                        {STATUS_LABEL[invoice.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
