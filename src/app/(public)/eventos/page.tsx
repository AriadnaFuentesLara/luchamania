import type { Metadata } from "next";
import TarjetaEvento from "@/components/sitio/TarjetaEvento";
import { eventosAnteriores, proximosEventos } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Eventos",
  description: "Funciones de lucha libre, torneos y actividades de Luchamanía Costa Rica.",
};

export const dynamic = "force-dynamic";

export default async function EventosPage() {
  const [proximos, anteriores] = await Promise.all([proximosEventos(), eventosAnteriores()]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl font-bold uppercase sm:text-6xl">Eventos</h1>

      <section className="mt-10" aria-labelledby="titulo-proximos">
        <h2 id="titulo-proximos" className="font-display text-3xl font-bold uppercase">Próximos</h2>
        {proximos.length === 0 ? (
          <p className="mt-4 text-suave">No hay eventos programados por ahora. ¡Vuelva pronto!</p>
        ) : (
          <div className="mt-6 space-y-4">
            {proximos.map((e) => (
              <TarjetaEvento key={e.id} titulo={e.titulo} descripcion={e.descripcion} fecha={e.fecha} lugar={e.lugar} />
            ))}
          </div>
        )}
      </section>

      {anteriores.length > 0 && (
        <section className="mt-14 opacity-75" aria-labelledby="titulo-anteriores">
          <h2 id="titulo-anteriores" className="font-display text-3xl font-bold uppercase">Anteriores</h2>
          <div className="mt-6 space-y-4">
            {anteriores.map((e) => (
              <TarjetaEvento key={e.id} titulo={e.titulo} descripcion={e.descripcion} fecha={e.fecha} lugar={e.lugar} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}