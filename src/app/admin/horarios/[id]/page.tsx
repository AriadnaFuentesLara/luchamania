import { notFound } from "next/navigation";
import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { leerId } from "@/lib/formularios";
import { db } from "@/prisma/db";
import { eliminarHorario, guardarHorario } from "../acciones";
import { programasParaElegir } from "../datos";
import { FormularioHorario } from "../FormularioHorario";

export default async function EditarHorarioPage({ params }: { params: Promise<{ id: string }> }) {
  await requerirAdministrador();
  const id = leerId((await params).id);
  if (!id) notFound();

  const [horario, programas] = await Promise.all([
    db.orm.public.Horario.where({ id }).first(),
    programasParaElegir(),
  ]);
  if (!horario) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Gestión · Horarios" titulo="Editar horario" />
      <FormularioHorario accion={guardarHorario.bind(null, id)} programas={programas} inicial={horario} />
      <form action={eliminarHorario.bind(null, id)} className="text-right">
        <button type="submit" className="text-sm font-bold text-red-700 hover:underline">
          Eliminar este horario
        </button>
      </form>
    </div>
  );
}