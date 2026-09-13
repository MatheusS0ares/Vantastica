import { createClient } from "@/lib/supabase/server";
import { impersonateOrganization } from "./actions";

type OrganizationRow = {
  id: string;
  name: string;
  phone: string | null;
  van_plate: string | null;
  van_model: string | null;
  created_at: string;
};

export default async function AdminPage() {
  const supabase = await createClient();

  const { data: orgsRaw } = await supabase
    .from("organizations")
    .select("id, name, phone, van_plate, van_model, created_at")
    .order("created_at", { ascending: false });

  const organizations = (orgsRaw ?? []) as OrganizationRow[];

  const orgsWithCounts = await Promise.all(
    organizations.map(async (org) => {
      const [{ count: studentCount }, { count: driverCount }] =
        await Promise.all([
          supabase
            .from("students")
            .select("id", { count: "exact", head: true })
            .eq("organization_id", org.id),
          supabase
            .from("organization_members")
            .select("user_id", { count: "exact", head: true })
            .eq("organization_id", org.id),
        ]);

      return { org, studentCount: studentCount ?? 0, driverCount: driverCount ?? 0 };
    }),
  );

  return (
    <div className="flex flex-1 flex-col gap-6 px-5 py-6">
      <h1 className="font-heading text-xl font-bold text-navy">
        Organizações
      </h1>

      {orgsWithCounts.length === 0 && (
        <p className="text-sm text-muted">Nenhuma organização cadastrada.</p>
      )}

      <div className="flex flex-col gap-3">
        {orgsWithCounts.map(({ org, studentCount, driverCount }) => (
          <div
            key={org.id}
            className="flex flex-col gap-2 rounded-card bg-surface p-4 shadow-card"
          >
            <div className="flex items-center justify-between">
              <span className="font-heading font-semibold text-navy">
                {org.name}
              </span>
              <span className="text-xs text-muted">
                {new Date(org.created_at).toLocaleDateString("pt-BR")}
              </span>
            </div>
            <span className="text-sm text-muted">
              {org.phone || "sem telefone"}
              {org.van_plate ? ` · Placa ${org.van_plate}` : ""}
              {org.van_model ? ` · ${org.van_model}` : ""}
            </span>
            <span className="text-sm text-text">
              {driverCount} motorista{driverCount === 1 ? "" : "s"} ·{" "}
              {studentCount} aluno{studentCount === 1 ? "" : "s"}
            </span>
            <form action={impersonateOrganization.bind(null, org.id)}>
              <button
                type="submit"
                className="w-full rounded-pill bg-navy px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
              >
                Entrar como {org.name}
              </button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
