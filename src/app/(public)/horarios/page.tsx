import type { Metadata } from "next";
import { DIAS, hora } from "@/lib/formato";
import { horariosPublicos } from "@/lib/sitio";

export const metadata: Metadata = {
  title: "Horarios y lugares de entrenamiento",
  description: "Horarios de entrenamiento de Luchamanía por día, programa y lugar, en Sabana, San José.",
};

export const dynamic = "force-dynamic";

export default async function HorariosPage() {
  const horarios = await horariosPublicos();
  const lugares = [...new Set(horarios.map((h) => h.lugar))].sort();
  const diasConClase = DIAS.filter((d) => horarios.some((h) => h.dia === d.valor));

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl font-bold uppercase sm:text-6xl">Horarios</h1>
      <p className="mt-4 max-w-2xl text-lg text-suave">Estos son los entrenamientos de cada semana.</p>

      {diasConClase.length === 0 ? (
        <p className="mt-10 text-suave">Pronto publicaremos los horarios.</p>
      ) : (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {diasConClase.map((d) => (
            <section key={d.valor} className="rounded-2xl border border-borde bg-superficie p-5" aria-labelledby={`dia-${d.valor}`}>
              <h2 id={`dia-${d.valor}`} className="font-display text-2xl font-bold uppercase">
                <span className="bg-marca px-2">{d.nombre}</span>
              </h2>
              <ul className="mt-4 divide-y divide-borde">
                {horarios
                  .filter((h) => h.dia === d.valor)
                  .map((h) => (
                    <li key={h.id} className="py-3">
                      <p className="font-bold tabular-nums">
                        {hora(h.horaInicio)} – {hora(h.horaFin)}
                      </p>
                      <p className="text-sm">
                        {h.programa?.nombre} <span className="text-suave">· {h.programa?.disciplina?.nombre}</span>
                      </p>
                      <p className="text-xs text-suave">📍 {h.lugar}</p>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      {lugares.length > 0 && (
        <section className="mt-16" aria-labelledby="titulo-lugares">
          <h2 id="titulo-lugares" className="font-display text-3xl font-bold uppercase">Lugares de entrenamiento</h2>
          <ul className="mt-4 flex flex-wrap gap-3">
            {lugares.map((lugar) => (
              <li key={lugar} className="rounded-full border-2 border-tinta bg-superficie px-4 py-2 text-sm font-semibold">
                📍 {lugar}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}