import Link from "next/link";
import { and, or } from "@prisma/orm-postgres/orm-client";
import { Encabezado } from "@/components/admin/Encabezado";
import { obtenerUsuarioActual } from "@/lib/auth/dal";
import { calcularEdad } from "@/lib/formato";
import { db } from "@/prisma/db";
import { cambiarEstadoMiembro } from "./acciones";

const POR_PAGINA = 20;
const FILTROS = [
  { valor: "activos", nombre: "Activos" },
  { valor: "inactivos", nombre: "Inactivos" },
  { valor: "todos", nombre: "Todos" },
] as const;

type Filtro = (typeof FILTROS)[number]["valor"];

export default async function MiembrosPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; estado?: string; pagina?: string; guardado?: string }>;
}) {
  await obtenerUsuarioActual();
  const parametros = await searchParams;

  const busqueda = (parametros.q ?? "").trim().slice(0, 60);
  const estado: Filtro = FILTROS.some((f) => f.valor === parametros.estado) ? (parametros.estado as Filtro) : "activos";
  const pagina = Math.max(1, Math.floor(Number(parametros.pagina)) || 1);

  // Los símbolos % y _ tienen significado especial en ILIKE: se escapan para buscarlos como texto.
  const patron = `%${busqueda.replace(/[\\%_]/g, "\\$&")}%`;

  // La misma búsqueda sirve para traer la página y para contar el total.
  const filtrados = db.orm.public.Miembro.where((m) =>
    and(
      estado === "todos" ? m.id.gt(0) : m.activo.eq(estado === "activos"),
      or(m.nombre.ilike(patron), m.apellidos.ilike(patron), m.cedula.ilike(patron)),
    ),
  );

  const [miembros, total] = await Promise.all([
    filtrados
      .orderBy([(m) => m.apellidos.asc(), (m) => m.nombre.asc(), (m) => m.id.asc()])
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA)
      .all(),
    filtrados.aggregate((a) => ({ cantidad: a.count() })),
  ]);

  const paginas = Math.max(1, Math.ceil(total.cantidad / POR_PAGINA));
  const enlace = (cambios: Record<string, string | number>) => {
    const p = new URLSearchParams({ q: busqueda, estado, pagina: String(pagina), ...cambios });
    return `/admin/miembros?${p}`;
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Gestión" titulo="Miembros" accion={{ texto: "+ Nuevo miembro", href: "/admin/miembros/nuevo" }} />

      {parametros.guardado && (
        <p role="status" className="rounded-xl bg-green-50 px-5 py-4 text-sm font-semibold text-green-800">
          Miembro guardado correctamente.
        </p>
      )}

      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
        <nav className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <Link
              key={f.valor}
              href={enlace({ estado: f.valor, pagina: 1 })}
              className={`rounded-full px-5 py-2 text-sm font-semibold ${
                f.valor === estado ? "bg-black text-white" : "border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
              }`}
            >
              {f.nombre}
            </Link>
          ))}
        </nav>

        {/* Formulario GET: la búsqueda queda en la URL y funciona sin JavaScript. */}
        <form className="flex gap-2" action="/admin/miembros">
          <input type="hidden" name="estado" value={estado} />
          <input
            name="q"
            defaultValue={busqueda}
            placeholder="Buscar por nombre o cédula"
            aria-label="Buscar por nombre o cédula"
            className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none focus:border-yellow-400 lg:w-80"
          />
          <button type="submit" className="rounded-xl bg-black px-4 py-2.5 text-sm font-bold text-white">
            Buscar
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-5 py-3">Cédula</th>
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">Teléfono</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {miembros.length === 0 && (
              <tr>
                <td colSpan={5} className="px-5 py-10 text-center text-gray-500">
                  No se encontraron miembros.
                </td>
              </tr>
            )}
            {miembros.map((m) => (
              <tr key={m.id}>
                <td className="px-5 py-3 tabular-nums">{m.cedula}</td>
                <td className="px-5 py-3 font-bold">
                  {m.nombre} {m.apellidos}
                  {calcularEdad(m.fechaNacimiento) < 18 && (
                    <span className="ml-2 rounded-full bg-black px-2.5 py-0.5 text-xs font-bold text-yellow-400">Menor</span>
                  )}
                </td>
                <td className="px-5 py-3 tabular-nums">{m.telefono ?? m.encargadoTelefono ?? "—"}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${m.activo ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {m.activo ? "Activo" : "Inactivo"}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <div className="flex justify-end gap-4 font-bold">
                    <Link href={`/admin/miembros/${m.id}`} className="underline decoration-yellow-400 decoration-2 underline-offset-4">
                      Editar
                    </Link>
                    <form action={cambiarEstadoMiembro.bind(null, m.id, !m.activo)}>
                      <button type="submit" className={m.activo ? "text-red-700" : "text-green-700"}>
                        {m.activo ? "Desactivar" : "Reactivar"}
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>
          {total.cantidad} {total.cantidad === 1 ? "miembro" : "miembros"}
        </p>
        <div className="flex items-center gap-4 font-semibold">
          {pagina > 1 && <Link href={enlace({ pagina: pagina - 1 })}>‹ Anterior</Link>}
          <span>
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && <Link href={enlace({ pagina: pagina + 1 })}>Siguiente ›</Link>}
        </div>
      </div>
    </div>
  );
}