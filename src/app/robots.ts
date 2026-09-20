import type { MetadataRoute } from "next";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://vantastica.com.br";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/motorista",
        "/responsavel",
        "/admin",
        "/convite",
        "/convite-motorista",
      ],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
