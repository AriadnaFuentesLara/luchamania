import { notFound } from "next/navigation";
import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { leerId } from "@/lib/formularios";
import { db } from "@/prisma/db";
import { guardarUsuario } from "../acciones";
import { FormularioUsuario } from "../FormularioUsuario";

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  await requerirAdministrador();
  const id = leerId((await params).id);
  if (!id) notFound();

  // Nunca se trae contrasenaHash: lo que no se consulta no se puede filtrar por error.
  const usuario = await db.orm.public.Usuario.where({ id }).select("nombre", "correo", "rol", "activo").first();
  if (!usuario) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Administración · Usuarios" titulo={`Editar ${usuario.nombre}`} />
      <FormularioUsuario accion={guardarUsuario.bind(null, id)} inicial={usuario} />
    </div>
  );
}