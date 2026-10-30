import Link from "next/link";
import TarjetaEvento from "@/components/sitio/TarjetaEvento";
import TarjetaPrograma from "@/components/sitio/TarjetaPrograma";
import { programasPublicos, proximosEventos } from "@/lib/sitio";

// Los datos salen de la base en cada visita: lo que el personal cambia en el panel se ve de inmediato.
export const dynamic = "force-dynamic";

export default async function Inicio() {
  const [programas, eventos] = await Promise.all([programasPublicos(), proximosEventos(3)]);

  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 md:grid-cols-[3fr_2fr] md:items-center">
        <div>
          <h1 className="font-display text-6xl font-bold uppercase leading-none sm:text-7xl">
            Súbase al <span className="mt-2 inline-block bg-marca px-3">ring</span>
          </h1>
          <p className="mt-6 max-w-xl text-lg text-suave">
            Lucha olímpica, artes marciales mixtas y deportes de contacto en Sabana, San José. Desde 1990 formamos atletas
            de todas las edades, con clases para niños de 5 a 13 años y zumba para madres de familia.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/inscripcion" className="rounded-lg bg-marca px-6 py-3 font-bold uppercase tracking-wide transition-colors hover:bg-marca-oscuro">
              Inscríbase en línea
            </Link>
            <Link href="/horarios" className="rounded-lg border-2 border-tinta px-6 py-3 font-bold uppercase tracking-wide transition-colors hover:bg-superficie">
              Ver horarios
            </Link>
          </div>
        </div>
        <div className="rounded-2xl bg-tinta p-8 text-white">
          <p className="font-display text-5xl font-bold text-marca">1960</p>
          <p className="mt-2 text-sm text-gray-300">La lucha libre llega a Costa Rica, con Víctor Hugo Ramírez como su gran figura.</p>
          <p className="mt-6 font-display text-5xl font-bold text-marca">1990</p>
          <p className="mt-2 text-sm text-gray-300">Víctor Hugo Ramírez funda Luchamanía.</p>
          <Link href="/historia" className="mt-6 inline-block text-sm font-bold text-marca underline underline-offset-4">
            Conozca nuestra historia
          </Link>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 sm:px-6" aria-labelledby="titulo-programas">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="titulo-programas" className="font-display text-4xl font-bold uppercase">Nuestros programas</h2>
          <Link href="/disciplinas" className="text-sm font-bold underline underline-offset-4">Ver todas las disciplinas</Link>
        </div>
        {programas.length === 0 ? (
          <p className="mt-6 text-suave">Pronto publicaremos nuestros programas.</p>
        ) : (
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {programas.slice(0, 6).map((p) => (
              <TarjetaPrograma
                key={p.id}
                id={p.id}
                nombre={p.nombre}
                disciplina={p.disciplina?.nombre ?? ""}
                publicoMeta={p.publicoMeta}
                edadMinima={p.edadMinima}
                edadMaxima={p.edadMaxima}
                precioMensual={p.precioMensual}
              />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto mt-16 max-w-6xl px-4 sm:px-6" aria-labelledby="titulo-eventos">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 id="titulo-eventos" className="font-display text-4xl font-bold uppercase">Próximos eventos</h2>
          <Link href="/eventos" className="text-sm font-bold underline underline-offset-4">Ver todos los eventos</Link>
        </div>
        {eventos.length === 0 ? (
          <p className="mt-6 text-suave">No hay eventos programados por ahora. ¡Vuelva pronto!</p>
        ) : (
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {eventos.map((e) => (
              <TarjetaEvento key={e.id} titulo={e.titulo} descripcion={e.descripcion} fecha={e.fecha} lugar={e.lugar} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}