import Link from "next/link";
import { Encabezado } from "@/components/admin/Encabezado";
import { obtenerUsuarioActual } from "@/lib/auth/dal";
import { colones, fechaCorta, partesFechaHora } from "@/lib/formato";
import { db } from "@/prisma/db";
import { aprobarPagoPendiente, rechazarPago, verificarTilopay } from "./acciones";

const POR_PAGINA = 20;
const FILTROS = ["todos", "pendiente", "aprobado", "rechazado"] as const;
type Filtro = (typeof FILTROS)[number];

const NOMBRE_METODO: Record<string, string> = {
  efectivo: "Efectivo",
  sinpe: "SINPE Móvil",
  transferencia: "Transferencia",
  tilopay: "Tilopay",
};
const COLOR_ESTADO: Record<string, string> = {
  aprobado: "bg-green-50 text-green-700",
  pendiente: "bg-amber-50 text-amber-800",
  rechazado: "bg-red-50 text-red-700",
};
const MENSAJE_TILOPAY: Record<string, string> = {
  aprobado: "Tilopay confirmó el pago. La membresía ya se extendió.",
  rechazado: "Tilopay rechazó el pago.",
  pendiente: "Tilopay todavía no confirma el pago. Podés verificarlo más tarde desde esta lista.",
  desconocido: "No se encontró ese pago.",
};

export default async function PagosPage({
  searchParams,
}: {
  searchParams: Promise<{ estado?: string; pagina?: string; tilopay?: string }>;
}) {
  await obtenerUsuarioActual();
  const parametros = await searchParams;
  const filtro: Filtro = FILTROS.includes(parametros.estado as Filtro) ? (parametros.estado as Filtro) : "todos";
  const pagina = Math.max(1, Math.floor(Number(parametros.pagina)) || 1);

  const base = db.orm.public.Pago.include("miembro", (m) => m.select("id", "nombre", "apellidos"))
    .include("inscripcion", (i) => i.select("id").include("programa", (p) => p.select("nombre")))
    .include("registradoPor", (u) => u.select("nombre"));
  const filtrados = filtro === "todos" ? base : base.where({ estado: filtro });

  const [pagos, total] = await Promise.all([
    filtrados
      .orderBy([(p) => p.creadoEn.desc(), (p) => p.id.desc()])
      .limit(POR_PAGINA)
      .offset((pagina - 1) * POR_PAGINA)
      .all(),
    (filtro === "todos" ? db.orm.public.Pago : db.orm.public.Pago.where({ estado: filtro })).aggregate((a) => ({
      cantidad: a.count(),
    })),
  ]);
  const paginas = Math.max(1, Math.ceil(total.cantidad / POR_PAGINA));

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Administración" titulo="Pagos" accion={{ texto: "+ Registrar pago", href: "/admin/pagos/nuevo" }} />

      {parametros.tilopay && MENSAJE_TILOPAY[parametros.tilopay] && (
        <p role="status" className="rounded-xl bg-gray-900 px-5 py-4 text-sm font-semibold text-white">
          {MENSAJE_TILOPAY[parametros.tilopay]}
        </p>
      )}

      <nav className="flex flex-wrap gap-2">
        {FILTROS.map((f) => (
          <Link
            key={f}
            href={`/admin/pagos?estado=${f}`}
            className={`rounded-full px-5 py-2 text-sm font-semibold capitalize ${f === filtro ? "bg-black text-white" : "border border-gray-300 bg-white text-gray-700"}`}
          >
            {f === "todos" ? "Todos" : `${f}s`}
          </Link>
        ))}
      </nav>

      <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-gray-50 text-xs uppercase tracking-wider text-gray-500">
            <tr>
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3">Miembro</th>
              <th className="px-5 py-3">Programa</th>
              <th className="px-5 py-3">Método</th>
              <th className="px-5 py-3">Monto</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Registró</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {pagos.length === 0 && (
              <tr>
                <td colSpan={8} className="px-5 py-10 text-center text-gray-500">
                  No hay pagos.
                </td>
              </tr>
            )}
            {pagos.map((p) => (
              <tr key={p.id}>
                <td className="px-5 py-3 tabular-nums">{fechaCorta(partesFechaHora(p.creadoEn).fecha)}</td>
                <td className="px-5 py-3 font-bold">
                  <Link href={`/admin/miembros/${p.miembro?.id}`} className="hover:underline">
                    {p.miembro?.nombre} {p.miembro?.apellidos}
                  </Link>
                </td>
                <td className="px-5 py-3 text-gray-600">{p.inscripcion?.programa?.nombre ?? "—"}</td>
                <td className="px-5 py-3">{NOMBRE_METODO[p.metodoPago]}</td>
                <td className="px-5 py-3 tabular-nums">{colones(p.monto)}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${COLOR_ESTADO[p.estado]}`}>{p.estado}</span>
                </td>
                <td className="px-5 py-3 text-gray-600">{p.registradoPor?.nombre ?? "En línea"}</td>
                <td className="px-5 py-3">
                  {p.estado === "pendiente" && (
                    <div className="flex justify-end gap-4 font-bold">
                      {p.referenciaTilopay ? (
                        <form action={verificarTilopay.bind(null, p.referenciaTilopay)}>
                          <button type="submit">Verificar</button>
                        </form>
                      ) : (
                        <form action={aprobarPagoPendiente.bind(null, p.id)}>
                          <button type="submit" className="text-green-700">
                            Aprobar
                          </button>
                        </form>
                      )}
                      <form action={rechazarPago.bind(null, p.id)}>
                        <button type="submit" className="text-red-700">
                          Rechazar
                        </button>
                      </form>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <p>{total.cantidad} pagos</p>
        <div className="flex items-center gap-4 font-semibold">
          {pagina > 1 && <Link href={`/admin/pagos?estado=${filtro}&pagina=${pagina - 1}`}>‹ Anterior</Link>}
          <span>
            Página {pagina} de {paginas}
          </span>
          {pagina < paginas && <Link href={`/admin/pagos?estado=${filtro}&pagina=${pagina + 1}`}>Siguiente ›</Link>}
        </div>
      </div>
    </div>
  );
}