import type { Metadata, Viewport } from "next";
import { Poppins, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { RegisterServiceWorker } from "@/components/RegisterServiceWorker";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vantastica.com.br";
const TAGLINE = "Gestão inteligente de vans escolares";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "VanTástica — Gestão inteligente de vans escolares",
    template: "%s · VanTástica",
  },
  description:
    "Controle de rotas, check-in de embarque/entrega em tempo real e comunicação automática com os responsáveis. Feito para quem dirige uma van escolar no Brasil.",
  keywords: [
    "van escolar",
    "transporte escolar",
    "gestão de van escolar",
    "app para motorista escolar",
    "monitoramento de van escolar",
    "check-in escolar",
  ],
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    title: "VanTástica",
    statusBarStyle: "default",
  },
  openGraph: {
    title: "VanTástica — Gestão inteligente de vans escolares",
    description: TAGLINE,
    url: SITE_URL,
    siteName: "VanTástica",
    locale: "pt_BR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "VanTástica — Gestão inteligente de vans escolares",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "VanTástica — Gestão inteligente de vans escolares",
    description: TAGLINE,
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: "#1A365D",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${poppins.variable} ${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-text font-body">
        {children}
        <RegisterServiceWorker />
        <Toaster
          richColors
          position="top-center"
          toastOptions={{
            style: { fontFamily: "var(--font-inter), sans-serif" },
          }}
        />
      </body>
    </html>
  );
}
