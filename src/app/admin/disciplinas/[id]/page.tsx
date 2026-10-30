import { notFound } from "next/navigation";
import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { leerId } from "@/lib/formularios";
import { db } from "@/prisma/db";
import { guardarDisciplina } from "../acciones";
import { FormularioDisciplina } from "../FormularioDisciplina";

export default async function EditarDisciplinaPage({ params }: { params: Promise<{ id: string }> }) {
  await requerirAdministrador();
  const id = leerId((await params).id);
  if (!id) notFound();

  const disciplina = await db.orm.public.Disciplina.where({ id }).first();
  if (!disciplina) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Gestión · Disciplinas" titulo={`Editar ${disciplina.nombre}`} />
      <FormularioDisciplina accion={guardarDisciplina.bind(null, id)} inicial={disciplina} />
    </div>
  );
}