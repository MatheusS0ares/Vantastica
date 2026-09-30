import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/supabase/user-context";
import { SignOutButton } from "@/components/SignOutButton";
import { ResponsavelNav } from "@/components/ResponsavelNav";
import { InstallPrompt } from "@/components/InstallPrompt";

export const metadata: Metadata = {
  title: "VanTástica Responsável",
  manifest: "/manifest-responsavel.webmanifest",
  appleWebApp: {
    capable: true,
    title: "VanTástica",
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

export default async function ResponsavelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getUserContext();

  if (context.role !== "responsavel") {
    redirect("/login");
  }

  // Conta criada pelo motorista com senha padrão — força trocar antes
  // de usar o app. /trocar-senha fica fora desse layout (senão essa
  // mesma checagem redirecionaria pra lá de novo, em loop).
  if (context.mustChangePassword) {
    redirect("/trocar-senha");
  }

  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="flex justify-end px-4 py-2">
        <SignOutButton />
      </div>
      <InstallPrompt />
      {children}
      <ResponsavelNav />
    </div>
  );
}
