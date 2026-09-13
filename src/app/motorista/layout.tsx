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

  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("name, logo_url")
    .eq("id", context.organizationId)
    .maybeSingle();

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
          {org?.logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={org.logo_url}
              alt={org.name}
              className="h-8 w-8 rounded-pill object-cover"
            />
          )}
          {org?.name && (
            <span className="font-heading text-sm font-semibold text-navy">
              {org.name}
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
