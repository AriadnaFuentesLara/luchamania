import { Encabezado } from "@/components/admin/Encabezado";
import { obtenerUsuarioActual } from "@/lib/auth/dal";
import { guardarMiembro } from "../acciones";
import { FormularioMiembro } from "../FormularioMiembro";

export default async function NuevoMiembroPage() {
  await obtenerUsuarioActual();

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Gestión · Miembros" titulo="Nuevo miembro" />
      <FormularioMiembro accion={guardarMiembro.bind(null, null)} />
    </div>
  );
}