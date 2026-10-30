import type { Metadata } from "next";
import TarjetaPrograma from "@/components/sitio/TarjetaPrograma";
import { DIAS } from "@/lib/formato";
import { horariosPublicos, programasPublicos } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Disciplinas y programas",
  description:
    "Lucha olímpica, artes marciales mixtas, deportes de contacto, clases para niños y zumba en Sabana, San José. Precios y edades de cada programa.",
};

export const dynamic = "force-dynamic";

export default async function DisciplinasPage() {
  const [programas, horarios] = await Promise.all([programasPublicos(), horariosPublicos()]);

  // Agrupa los programas por disciplina, en el orden en que aparecen.
  const disciplinas = new Map<number, { nombre: string; descripcion: string | null; programas: typeof programas }>();
  for (const p of programas) {
    const grupo = disciplinas.get(p.disciplinaId) ?? { nombre: p.disciplina?.nombre ?? "", descripcion: p.disciplina?.descripcion ?? null, programas: [] };
    grupo.programas.push(p);
    disciplinas.set(p.disciplinaId, grupo);
  }

  // "Lunes, Miércoles y Viernes" a partir de los horarios de cada programa.
  function diasDe(programaId: number) {
    const dias = DIAS.filter((d) => horarios.some((h) => h.programaId === programaId && h.dia === d.valor)).map((d) => d.nombre);
    if (dias.length === 0) return undefined;
    return dias.length === 1 ? dias[0] : `${dias.slice(0, -1).join(", ")} y ${dias.at(-1)}`;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl font-bold uppercase sm:text-6xl">Disciplinas y programas</h1>
      <p className="mt-4 max-w-2xl text-lg text-suave">
        Elija la disciplina que más le guste. Cada una tiene programas según la edad y el nivel, con su precio mensual.
      </p>

      {disciplinas.size === 0 && <p className="mt-10 text-suave">Pronto publicaremos nuestras disciplinas.</p>}

      {[...disciplinas.entries()].map(([id, d]) => (
        <section key={id} className="mt-14" aria-labelledby={`disciplina-${id}`}>
          <h2 id={`disciplina-${id}`} className="font-display text-3xl font-bold uppercase">
            <span className="border-b-4 border-marca">{d.nombre}</span>
          </h2>
          {d.descripcion && <p className="mt-3 max-w-3xl text-suave">{d.descripcion}</p>}
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {d.programas.map((p) => (
              <TarjetaPrograma
                key={p.id}
                id={p.id}
                nombre={p.nombre}
                disciplina={d.nombre}
                publicoMeta={p.publicoMeta}
                edadMinima={p.edadMinima}
                edadMaxima={p.edadMaxima}
                precioMensual={p.precioMensual}
                dias={diasDe(p.id)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}