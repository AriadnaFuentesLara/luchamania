"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const enlaces = [
  { nombre: "Inicio", ruta: "/" },
  { nombre: "Historia", ruta: "/historia" },
  { nombre: "Disciplinas", ruta: "/disciplinas" },
  { nombre: "Horarios", ruta: "/horarios" },
  { nombre: "Eventos", ruta: "/eventos" },
];

export default function Navbar() {
  const rutaActual = usePathname();

  return (
    <header className="border-b-4 border-tinta bg-superficie">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-4 sm:px-6">
        <Link href="/" className="font-display text-3xl font-bold uppercase tracking-tight" aria-label="Luchamanía Costa Rica, inicio">
          <span className="bg-[linear-gradient(transparent_60%,var(--color-marca)_60%)]">Luchamania</span>
          <span className="ml-1.5 bg-tinta px-1.5 text-xl text-marca">CR</span>
        </Link>

        <Link
          href="/inscripcion"
          className="rounded-lg bg-marca px-4 py-2 font-display text-lg font-bold uppercase tracking-wide transition-colors hover:bg-marca-oscuro md:order-last"
        >
          Inscríbase
        </Link>

        {/* En el celular los enlaces bajan a su propia fila y se deslizan de lado. */}
        <nav aria-label="Principal" className="-mx-4 w-[calc(100%+2rem)] overflow-x-auto px-4 md:mx-0 md:ml-auto md:w-auto md:px-0">
          <ul className="flex gap-6 whitespace-nowrap">
            {enlaces.map((enlace) => {
              const activo = enlace.ruta === "/" ? rutaActual === "/" : rutaActual.startsWith(enlace.ruta);
              return (
                <li key={enlace.ruta}>
                  <Link
                    href={enlace.ruta}
                    aria-current={activo ? "page" : undefined}
                    className={`font-display text-lg font-bold uppercase tracking-wide transition-colors hover:text-marca-oscuro ${
                      activo ? "underline decoration-marca decoration-4 underline-offset-8" : ""
                    }`}
                  >
                    {enlace.nombre}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </header>
  );
}