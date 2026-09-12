"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export type NavDockItem = {
  href: string;
  label: string;
  icon: ReactNode;
  exact?: boolean;
};

const ACCENTS = {
  blue: {
    color: "#2B6CB0",
    bg: "rgba(43,108,176,0.16)",
    glow: "0 0 24px rgba(43,108,176,0.6), 0 0 8px rgba(43,108,176,0.45)",
  },
  mint: {
    color: "#2F855A",
    bg: "rgba(47,133,90,0.18)",
    glow: "0 0 24px rgba(47,133,90,0.6), 0 0 8px rgba(47,133,90,0.45)",
  },
};

export function NavDock({
  items,
  accent,
}: {
  items: NavDockItem[];
  accent: keyof typeof ACCENTS;
}) {
  const pathname = usePathname();
  const theme = ACCENTS[accent];

  return (
    <nav
      className="fixed inset-x-4 bottom-3 z-20 flex items-center justify-around rounded-pill border border-border bg-surface/85 px-2 py-1.5 shadow-card backdrop-blur-lg"
      style={{
        boxShadow:
          "0 12px 28px -6px rgba(26,54,93,0.20), 0 4px 10px -4px rgba(26,54,93,0.10)",
      }}
    >
      {items.map((item) => {
        const isActive = item.exact
          ? pathname === item.href
          : pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className="flex flex-col items-center gap-0.5 rounded-pill px-3 py-1.5"
            style={
              isActive
                ? { background: theme.bg, boxShadow: theme.glow }
                : undefined
            }
          >
            <span style={{ color: isActive ? theme.color : "#A0AEC0" }}>
              {item.icon}
            </span>
            <span
              className="text-[10px]"
              style={{
                color: isActive ? theme.color : "#A0AEC0",
                fontWeight: isActive ? 600 : 500,
              }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
