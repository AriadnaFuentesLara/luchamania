import { Encabezado } from "@/components/admin/Encabezado";
import { requerirAdministrador } from "@/lib/auth/dal";
import { guardarDisciplina } from "../acciones";
import { FormularioDisciplina } from "../FormularioDisciplina";

export default async function NuevaDisciplinaPage() {
  await requerirAdministrador();

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-8 md:px-10">
      <Encabezado seccion="Gestión · Disciplinas" titulo="Nueva disciplina" />
      <FormularioDisciplina accion={guardarDisciplina.bind(null, null)} />
    </div>
  );
}