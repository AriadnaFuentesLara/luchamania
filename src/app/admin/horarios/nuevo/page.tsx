import { redirect } from "next/navigation";
import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { guardarHorario } from "../acciones";
import { programasParaElegir } from "../datos";
import { FormularioHorario } from "../FormularioHorario";

export default async function NuevoHorarioPage() {
  await requerirAdministrador();

  const programas = await programasParaElegir();
  if (programas.length === 0) redirect("/admin/disciplinas");

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Gestión · Horarios" titulo="Nuevo horario" />
      <FormularioHorario accion={guardarHorario.bind(null, null)} programas={programas} />
    </div>
  );
}