import Link from "next/link";
import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { DIAS, hora } from "@/lib/formato";
import { db } from "@/prisma/db";

export default async function HorariosPage() {
  await requerirAdministrador();

  const horarios = await db.orm.public.Horario.include("programa", (p) =>
    p.select("nombre").include("disciplina", (d) => d.select("nombre")),
  )
    .orderBy((h) => h.horaInicio.asc())
    .all();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado
        seccion="Gestión"
        titulo="Horarios"
        descripcion="Semana de entrenamientos. Hacé clic en una clase para editarla."
        accion={{ texto: "+ Nuevo horario", href: "/admin/horarios/nuevo" }}
      />

      <div className="grid gap-3 md:grid-cols-4 xl:grid-cols-7">
        {DIAS.map((dia) => {
          const delDia = horarios.filter((h) => h.dia === dia.valor);
          return (
            <section key={dia.valor} className="rounded-2xl border border-gray-200 bg-white p-3">
              <h2 className="px-1 pb-3 text-xs font-bold uppercase tracking-widest text-gray-500">{dia.nombre}</h2>
              <div className="space-y-2">
                {delDia.length === 0 && <p className="px-1 text-xs text-gray-400">Sin clases</p>}
                {delDia.map((h) => (
                  <Link
                    key={h.id}
                    href={`/admin/horarios/${h.id}`}
                    className="block rounded-xl border-l-4 border-yellow-400 bg-yellow-50 p-3 transition hover:bg-yellow-100"
                  >
                    <p className="text-sm font-bold leading-tight">{h.programa?.nombre}</p>
                    <p className="mt-1 text-xs text-gray-600">{h.programa?.disciplina?.nombre}</p>
                    <p className="mt-1 text-xs font-semibold">
                      {hora(h.horaInicio)}–{hora(h.horaFin)}
                    </p>
                    <p className="text-xs text-gray-500">{h.lugar}</p>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}