import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { guardarUsuario } from "../acciones";
import { FormularioUsuario } from "../FormularioUsuario";

export default async function NuevoUsuarioPage() {
  await requerirAdministrador();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Administración · Usuarios" titulo="Nuevo usuario" />
      <FormularioUsuario accion={guardarUsuario.bind(null, null)} />
    </div>
  );
}