'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/prisma/db';
import { requerirAdministrador } from '@/lib/auth/dal';
import { esViolacionUnica } from '@/lib/errores-db';
import { erroresDeValidacion, leerFormulario, leerId, type EstadoFormulario } from '@/lib/formularios';

const esquemaDisciplina = z.object({
  nombre: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(80, 'Máximo 80 caracteres.'),
  descripcion: z
    .string()
    .trim()
    .max(500, 'Máximo 500 caracteres.')
    .transform((texto) => texto || null),
});

// Crea (id = null) o edita (id = número) una disciplina.
export async function guardarDisciplina(
  id: number | null,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  // Las acciones se pueden llamar directo por internet: siempre se revisa el rol aquí.
  await requerirAdministrador();

  const valores = leerFormulario(formData);
  const datos = esquemaDisciplina.safeParse(valores);
  if (!datos.success) return erroresDeValidacion(datos.error, valores);

  try {
    if (id === null) {
      await db.orm.public.Disciplina.create(datos.data);
    } else {
      const idValido = leerId(id);
      if (!idValido) return { error: 'Disciplina no válida.', valores };
      await db.orm.public.Disciplina.where({ id: idValido }).update(datos.data);
    }
  } catch (error) {
    if (esViolacionUnica(error)) {
      return { errores: { nombre: 'Ya existe una disciplina con ese nombre.' }, valores };
    }
    throw error;
  }

  revalidatePath('/admin/disciplinas');
  redirect('/admin/disciplinas');
}

// No se borran: se desactivan, para no perder los programas ni el historial.
export async function cambiarEstadoDisciplina(id: number, activa: boolean) {
  await requerirAdministrador();
  const idValido = leerId(id);
  if (!idValido) return;
  await db.orm.public.Disciplina.where({ id: idValido }).update({ activa: activa === true });
  revalidatePath('/admin/disciplinas');
}