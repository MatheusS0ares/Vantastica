import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/supabase/user-context";
import { createClient } from "@/lib/supabase/server";
import { SignOutButton } from "@/components/SignOutButton";
import { MotoristaNav } from "@/components/MotoristaNav";
import { stopImpersonating } from "@/app/admin/actions";

export const metadata: Metadata = {
  title: "VanTástica Motorista",
  manifest: "/manifest-motorista.webmanifest",
  appleWebApp: {
    capable: true,
    title: "VanTástica Motorista",
    statusBarStyle: "default",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export default async function MotoristaLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getUserContext();

  if (context.role !== "motorista") {
    redirect("/login");
  }

  // Nome/logo já vêm no contexto (mesma chamada RPC que resolveu o
  // papel do usuário) pro caso comum. Impersonação de admin é a
  // exceção: o cookie só guarda o id da org impersonada, então essa é
  // a única situação em que ainda vale a pena uma consulta à parte.
  let orgName = context.organizationName;
  let orgLogoUrl = context.organizationLogoUrl;

  if (context.isAdminImpersonation) {
    const supabase = await createClient();
    const { data: org } = await supabase
      .from("organizations")
      .select("name, logo_url")
      .eq("id", context.organizationId)
      .maybeSingle();
    orgName = org?.name;
    orgLogoUrl = org?.logo_url;
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      {context.isAdminImpersonation && (
        <div className="flex items-center justify-between gap-3 bg-navy px-4 py-2 text-sm text-white">
          <span>Modo admin — vendo como esta organização</span>
          <form action={stopImpersonating}>
            <button type="submit" className="underline">
              Sair
            </button>
          </form>
        </div>
      )}
      <div className="flex items-center justify-between px-4 py-2">
        <div className="flex items-center gap-2">
          {orgLogoUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={orgLogoUrl}
              alt={orgName}
              className="h-8 w-8 rounded-pill object-cover"
            />
          )}
          {orgName && (
            <span className="font-heading text-sm font-semibold text-navy">
              {orgName}
            </span>
          )}
        </div>
        <SignOutButton />
      </div>
      {children}
      <MotoristaNav />
    </div>
  );
}
