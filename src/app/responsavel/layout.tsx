import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/supabase/user-context";
import { SignOutButton } from "@/components/SignOutButton";

export const metadata: Metadata = {
  title: "VemVan Responsável",
  manifest: "/manifest-responsavel.webmanifest",
  appleWebApp: {
    capable: true,
    title: "VemVan",
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

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex justify-end px-4 py-2">
        <SignOutButton />
      </div>
      {children}
    </div>
  );
}
