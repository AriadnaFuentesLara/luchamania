import Link from "next/link";
import { colones } from "@/lib/formato";
import { rangoEdad } from "@/lib/sitio";

type Props = {
  id: number;
  nombre: string;
  disciplina: string;
  publicoMeta: string | null;
  edadMinima: number | null;
  edadMaxima: number | null;
  precioMensual: string;
  dias?: string;
};

export default function TarjetaPrograma(p: Props) {
  return (
    <article className="flex flex-col rounded-2xl border-2 border-tinta bg-superficie p-6">
      <p className="text-xs font-bold uppercase tracking-wider text-suave">{p.disciplina}</p>
      <h3 className="mt-1 font-display text-2xl font-bold uppercase">{p.nombre}</h3>
      {p.publicoMeta && <p className="mt-2 text-sm text-suave">{p.publicoMeta}</p>}
      <ul className="mt-4 space-y-1 text-sm">
        <li>👤 {rangoEdad(p.edadMinima, p.edadMaxima)}</li>
        {p.dias && <li>🗓 {p.dias}</li>}
      </ul>
      <div className="mt-auto flex items-end justify-between gap-4 pt-6">
        <p>
          <span className="font-display text-3xl font-bold">{colones(p.precioMensual)}</span>
          <span className="text-sm text-suave"> /mes</span>
        </p>
        <Link
          href={`/inscripcion?programa=${p.id}`}
          className="rounded-lg bg-marca px-4 py-2 text-sm font-bold uppercase tracking-wide transition-colors hover:bg-marca-oscuro"
          aria-label={`Inscribirse en ${p.nombre}`}
        >
          Inscribirse
        </Link>
      </div>
    </article>
  );
}