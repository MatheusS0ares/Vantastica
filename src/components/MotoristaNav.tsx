import { NavDock } from "./NavDock";
import { HomeIcon, RouteIcon, UsersIcon, WalletIcon, UserIcon } from "./icons";

export function MotoristaNav() {
  return (
    <NavDock
      accent="blue"
      items={[
        { href: "/motorista", label: "Início", icon: <HomeIcon />, exact: true },
        { href: "/motorista/rota", label: "Rota", icon: <RouteIcon /> },
        { href: "/motorista/alunos", label: "Alunos", icon: <UsersIcon /> },
        {
          href: "/motorista/financeiro",
          label: "Financeiro",
          icon: <WalletIcon />,
        },
        { href: "/motorista/perfil", label: "Perfil", icon: <UserIcon /> },
      ]}
    />
  );
}
