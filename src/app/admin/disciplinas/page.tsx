import Link from "next/link";
import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { colones } from "@/lib/formato";
import { db } from "@/prisma/db";
import { cambiarEstadoDisciplina } from "./acciones";
import { cambiarEstadoPrograma } from "../programas/acciones";

export default async function DisciplinasPage() {
  await requerirAdministrador();

  const [disciplinas, programas] = await Promise.all([
    db.orm.public.Disciplina.orderBy((d) => d.nombre.asc()).all(),
    db.orm.public.Programa.orderBy((p) => p.nombre.asc()).all(),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado
        seccion="Gestión"
        titulo="Disciplinas y programas"
        descripcion="Cada disciplina agrupa programas con su público, edades y precio mensual."
        accion={{ texto: "+ Nueva disciplina", href: "/admin/disciplinas/nueva" }}
      />

      {disciplinas.length === 0 && (
        <p className="rounded-2xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
          Todavía no hay disciplinas. Empezá creando la primera.
        </p>
      )}

      {disciplinas.map((disciplina) => {
        const suyos = programas.filter((p) => p.disciplinaId === disciplina.id);
        return (
          <section key={disciplina.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
            <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-100 p-5">
              <div>
                <h2 className="flex items-center gap-3 text-lg font-black">
                  {disciplina.nombre}
                  {!disciplina.activa && (
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-bold text-gray-600">Inactiva</span>
                  )}
                </h2>
                {disciplina.descripcion && <p className="mt-1 max-w-2xl text-sm text-gray-500">{disciplina.descripcion}</p>}
              </div>
              <div className="flex items-center gap-4 text-sm font-bold">
                <Link href={`/admin/programas/nuevo?disciplina=${disciplina.id}`} className="text-yellow-700 hover:underline">
                  + Programa
                </Link>
                <Link href={`/admin/disciplinas/${disciplina.id}`} className="underline decoration-yellow-400 decoration-2 underline-offset-4">
                  Editar
                </Link>
                <form action={cambiarEstadoDisciplina.bind(null, disciplina.id, !disciplina.activa)}>
                  <button type="submit" className={disciplina.activa ? "text-red-700" : "text-green-700"}>
                    {disciplina.activa ? "Desactivar" : "Activar"}
                  </button>
                </form>
              </div>
            </div>

            {suyos.length === 0 ? (
              <p className="p-5 text-sm text-gray-500">Sin programas todavía.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
                    <tr>
                      <th className="px-5 py-3">Programa</th>
                      <th className="px-5 py-3">Público</th>
                      <th className="px-5 py-3">Edades</th>
                      <th className="px-5 py-3">Precio mensual</th>
                      <th className="px-5 py-3">Estado</th>
                      <th className="px-5 py-3" />
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {suyos.map((programa) => (
                      <tr key={programa.id}>
                        <td className="px-5 py-3 font-semibold">{programa.nombre}</td>
                        <td className="px-5 py-3 text-gray-600">{programa.publicoMeta ?? "—"}</td>
                        <td className="px-5 py-3 text-gray-600">
                          {programa.edadMinima ?? programa.edadMaxima
                            ? `${programa.edadMinima ?? 0} a ${programa.edadMaxima ?? "+"} años`
                            : "Todas"}
                        </td>
                        <td className="px-5 py-3">{colones(programa.precioMensual)}</td>
                        <td className="px-5 py-3">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${programa.activo ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                            {programa.activo ? "Activo" : "Inactivo"}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex justify-end gap-4 font-bold">
                            <Link href={`/admin/programas/${programa.id}`} className="underline decoration-yellow-400 decoration-2 underline-offset-4">
                              Editar
                            </Link>
                            <form action={cambiarEstadoPrograma.bind(null, programa.id, !programa.activo)}>
                              <button type="submit" className={programa.activo ? "text-red-700" : "text-green-700"}>
                                {programa.activo ? "Desactivar" : "Activar"}
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}