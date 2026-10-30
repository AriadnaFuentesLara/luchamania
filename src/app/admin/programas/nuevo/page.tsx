import { redirect } from "next/navigation";
import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { leerId } from "@/lib/formularios";
import { db } from "@/prisma/db";
import { guardarPrograma } from "../acciones";
import { FormularioPrograma } from "../FormularioPrograma";

export default async function NuevoProgramaPage({ searchParams }: { searchParams: Promise<{ disciplina?: string }> }) {
  await requerirAdministrador();

  const disciplinas = await db.orm.public.Disciplina.select("id", "nombre").orderBy((d) => d.nombre.asc()).all();
  if (disciplinas.length === 0) redirect("/admin/disciplinas/nueva");

  const elegida = leerId((await searchParams).disciplina) ?? disciplinas[0].id;

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Gestión · Disciplinas" titulo="Nuevo programa" />
      <FormularioPrograma accion={guardarPrograma.bind(null, null)} disciplinas={disciplinas} inicial={{ disciplinaId: elegida }} />
    </div>
  );
}