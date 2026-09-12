import { NavDock } from "./NavDock";
import { HomeIcon, ClockIcon, WalletIcon, CalendarIcon } from "./icons";

export function ResponsavelNav() {
  return (
    <NavDock
      accent="mint"
      items={[
        { href: "/responsavel", label: "Início", icon: <HomeIcon />, exact: true },
        {
          href: "/responsavel/historico",
          label: "Histórico",
          icon: <ClockIcon />,
        },
        {
          href: "/responsavel/financeiro",
          label: "Financeiro",
          icon: <WalletIcon />,
        },
        {
          href: "/responsavel/calendario",
          label: "Calendário",
          icon: <CalendarIcon />,
        },
      ]}
    />
  );
}
