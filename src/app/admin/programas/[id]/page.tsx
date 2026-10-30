import { notFound } from "next/navigation";
import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { leerId } from "@/lib/formularios";
import { db } from "@/prisma/db";
import { guardarPrograma } from "../acciones";
import { FormularioPrograma } from "../FormularioPrograma";

export default async function EditarProgramaPage({ params }: { params: Promise<{ id: string }> }) {
  await requerirAdministrador();
  const id = leerId((await params).id);
  if (!id) notFound();

  const [programa, disciplinas] = await Promise.all([
    db.orm.public.Programa.where({ id }).first(),
    db.orm.public.Disciplina.select("id", "nombre").orderBy((d) => d.nombre.asc()).all(),
  ]);
  if (!programa) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Gestión · Disciplinas" titulo={`Editar ${programa.nombre}`} />
      <FormularioPrograma accion={guardarPrograma.bind(null, id)} disciplinas={disciplinas} inicial={programa} />
    </div>
  );
}