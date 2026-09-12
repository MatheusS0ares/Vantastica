import type { Metadata } from "next";

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

export default function ResponsavelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-1 flex-col">{children}</div>;
}
