import type { ReactNode } from "react";
import Cinta from "@/components/sitio/Cinta";
import Footer from "@/components/sitio/Footer";
import Navbar from "@/components/sitio/Navbar";

// Estructura de todas las páginas públicas: menú arriba, franja de marca y pie de página
export default function SitioLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <a href="#contenido" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:rounded focus:bg-marca focus:px-4 focus:py-2">
        Saltar al contenido
      </a>
      <Navbar />
      <Cinta />
      <main id="contenido">{children}</main>
      <Footer />
    </>
  );
}