import type { Metadata } from "next";
import Link from "next/link";
import { leerId } from "@/lib/formularios";
import { colones } from "@/lib/formato";
import { programasPublicos, rangoEdad } from "@/lib/sitio";
import { FormularioInscripcionEnLinea } from "./FormularioInscripcionEnLinea";

export const metadata: Metadata = {
  title: "Inscripción en línea",
  description: "Elija su programa, complete sus datos y pague en línea con tarjeta o SINPE Móvil.",
};

export const dynamic = "force-dynamic";

export default async function InscripcionPage({ searchParams }: { searchParams: Promise<{ programa?: string }> }) {
  const programas = await programasPublicos();
  const idElegido = leerId((await searchParams).programa);
  const elegido = programas.find((p) => p.id === idElegido);

  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[2fr_3fr]">
      <div>
        <h1 className="font-display text-6xl font-bold uppercase leading-none">
          Súbase al <span className="mt-2 inline-block bg-marca px-3">ring</span>
        </h1>
        <p className="mt-6 text-lg text-suave">Elija su programa, complete sus datos y pague en línea con tarjeta o SINPE Móvil.</p>

        <h2 className="mt-10 text-xs font-bold uppercase tracking-wider text-suave">Paso 1 de 3 · Programa</h2>
        {programas.length === 0 && <p className="mt-4 text-suave">Por ahora no hay programas con inscripción en línea.</p>}
        <ul className="mt-4 space-y-3">
          {programas.map((p) => {
            const activo = p.id === elegido?.id;
            return (
              <li key={p.id}>
                <Link
                  href={`/inscripcion?programa=${p.id}`}
                  scroll={false}
                  aria-current={activo ? "true" : undefined}
                  className={`flex items-center justify-between gap-4 rounded-2xl border-2 p-5 transition-colors ${
                    activo ? "border-tinta bg-yellow-50" : "border-borde bg-superficie hover:border-tinta"
                  }`}
                >
                  <span>
                    <span className="block font-bold">{p.nombre}</span>
                    <span className="text-sm text-suave">
                      {p.disciplina?.nombre} · {rangoEdad(p.edadMinima, p.edadMaxima)} · {colones(p.precioMensual)}/mes
                    </span>
                  </span>
                  {activo && <span className="rounded-full bg-marca px-3 py-1 text-xs font-bold">Seleccionado</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <div>
        {elegido ? (
          // key: si cambia el programa, el formulario empieza limpio.
          <FormularioInscripcionEnLinea key={elegido.id} programaId={elegido.id} precio={elegido.precioMensual} />
        ) : (
          <div className="flex h-full min-h-64 items-center justify-center rounded-2xl border-2 border-dashed border-borde p-8 text-center text-suave">
            Elija un programa de la lista para continuar.
          </div>
        )}
      </div>
    </div>
  );
}