import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/supabase/user-context";
import { SignOutButton } from "@/components/SignOutButton";
import { MotoristaNav } from "@/components/MotoristaNav";

export const metadata: Metadata = {
  title: "VemVan Motorista",
  manifest: "/manifest-motorista.webmanifest",
  appleWebApp: {
    capable: true,
    title: "VemVan Motorista",
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

  return (
    <div className="flex flex-1 flex-col pb-24">
      <div className="flex justify-end px-4 py-2">
        <SignOutButton />
      </div>
      {children}
      <MotoristaNav />
    </div>
  );
}
