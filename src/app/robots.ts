import type { MetadataRoute } from "next";

// Le dice a Google qué puede revisar. El panel y el login no se indexan.
export default function robots(): MetadataRoute.Robots {
  const sitio = process.env.APP_URL ?? "http://localhost:3000";
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/admin", "/login", "/api", "/salir"] },
    sitemap: `${sitio}/sitemap.xml`,
  };
}