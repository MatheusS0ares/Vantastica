import { redirect } from "next/navigation";
import { getUserContext } from "@/lib/supabase/user-context";
import { SignOutButton } from "@/components/SignOutButton";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const context = await getUserContext();

  if (context.role !== "admin") {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="font-heading text-sm font-semibold text-navy">
          VanTástica Admin
        </span>
        <SignOutButton />
      </div>
      {children}
    </div>
  );
}
