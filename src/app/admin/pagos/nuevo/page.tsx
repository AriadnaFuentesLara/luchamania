import { redirect } from "next/navigation";
import { Encabezado } from "@/components/admin/Encabezado";
import { claseEntrada } from "@/components/admin/Campo";
import { obtenerUsuarioActual } from "@/lib/auth/dal";
import { leerId } from "@/lib/formularios";
import { db } from "@/prisma/db";
import { FormularioPago } from "../FormularioPago";

export default async function NuevoPagoPage({ searchParams }: { searchParams: Promise<{ miembro?: string }> }) {
  await obtenerUsuarioActual();
  const miembroId = leerId((await searchParams).miembro);

  // Paso 1: si todavía no se eligió el miembro, se muestra solo el selector
  if (!miembroId) {
    const miembros = await db.orm.public.Miembro.where({ activo: true })
      .select("id", "nombre", "apellidos", "cedula")
      .orderBy([(m) => m.apellidos.asc(), (m) => m.nombre.asc()])
      .all();
    return (
      <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
        <Encabezado seccion="Administración · Pagos" titulo="Registrar pago" />
        <form action="/admin/pagos/nuevo" className="flex gap-3 rounded-2xl border border-gray-200 bg-white p-6">
          <select name="miembro" required aria-label="Miembro" defaultValue="" className={claseEntrada + " mt-0"}>
            <option value="" disabled>
              Elegí un miembro
            </option>
            {miembros.map((m) => (
              <option key={m.id} value={m.id}>
                {m.apellidos}, {m.nombre} · {m.cedula}
              </option>
            ))}
          </select>
          <button type="submit" className="rounded-xl bg-black px-5 font-bold text-white">
            Seguir
          </button>
        </form>
      </div>
    );
  }

  // Paso 2: el formulario del pago, con las inscripciones activas de ese miembro.
  const [miembro, inscripciones] = await Promise.all([
    db.orm.public.Miembro.where({ id: miembroId, activo: true }).select("id", "nombre", "apellidos", "correo").first(),
    db.orm.public.Inscripcion.where({ miembroId, activa: true })
      .select("id")
      .include("programa", (p) => p.select("nombre", "precioMensual"))
      .all(),
  ]);
  if (!miembro) redirect("/admin/pagos/nuevo");

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Administración · Pagos" titulo="Registrar pago" />
      <FormularioPago miembro={miembro} inscripciones={inscripciones} />
    </div>
  );
}