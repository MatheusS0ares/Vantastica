import { signOut } from "@/app/(auth)/actions";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <button
        type="submit"
        className="text-sm font-medium text-muted transition hover:text-navy"
      >
        Sair
      </button>
    </form>
  );
}
