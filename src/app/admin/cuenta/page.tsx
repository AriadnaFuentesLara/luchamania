import { Encabezado } from "@/components/admin/Encabezado";
import { obtenerUsuarioActual } from "@/lib/auth/dal";
import { FormularioContrasena } from "./FormularioContrasena";

export default async function CuentaPage() {
  const yo = await obtenerUsuarioActual();

  return (
    <div className="mx-auto max-w-xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Mi cuenta" titulo={yo.nombre} descripcion={`Rol: ${yo.rol}`} />
      <FormularioContrasena />
    </div>
  );
}