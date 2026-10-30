import type { MetadataRoute } from "next";

// Mapa del sitio para registrarlo en Google Search Console (/sitemap.xml).
export default function sitemap(): MetadataRoute.Sitemap {
  const sitio = process.env.APP_URL ?? "http://localhost:3000";
  const paginas = [
    { ruta: "", prioridad: 1, frecuencia: "weekly" },
    { ruta: "/disciplinas", prioridad: 0.9, frecuencia: "monthly" },
    { ruta: "/horarios", prioridad: 0.9, frecuencia: "monthly" },
    { ruta: "/eventos", prioridad: 0.8, frecuencia: "weekly" },
    { ruta: "/inscripcion", prioridad: 0.8, frecuencia: "monthly" },
    { ruta: "/historia", prioridad: 0.6, frecuencia: "yearly" },
  ] as const;
  return paginas.map((p) => ({
    url: `${sitio}${p.ruta}`,
    lastModified: new Date(),
    changeFrequency: p.frecuencia,
    priority: p.prioridad,
  }));
}