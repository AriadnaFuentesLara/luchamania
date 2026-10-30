'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/prisma/db';
import { requerirAdministrador } from '@/lib/auth/dal';
import { esViolacionRelacion } from '@/lib/errores-db';
import { DIAS } from '@/lib/formato';
import { erroresDeValidacion, leerFormulario, leerId, type EstadoFormulario } from '@/lib/formularios';

const horaValida = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Hora no válida.');

const esquemaHorario = z
  .object({
    programaId: z.coerce.number().int().positive('Elegí un programa.'),
    dia: z.enum(DIAS.map((d) => d.valor), 'Elegí un día.'),
    horaInicio: horaValida,
    horaFin: horaValida,
    lugar: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(120, 'Máximo 120 caracteres.'),
  })
  .refine((h) => h.horaInicio < h.horaFin, {
    message: 'La hora de fin debe ser después de la de inicio.',
    path: ['horaFin'],
  });

export async function guardarHorario(
  id: number | null,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requerirAdministrador();

  const valores = leerFormulario(formData);
  const datos = esquemaHorario.safeParse(valores);
  if (!datos.success) return erroresDeValidacion(datos.error, valores);

  try {
    if (id === null) {
      await db.orm.public.Horario.create(datos.data);
    } else {
      const idValido = leerId(id);
      if (!idValido) return { error: 'Horario no válido.', valores };
      await db.orm.public.Horario.where({ id: idValido }).update(datos.data);
    }
  } catch (error) {
    if (esViolacionRelacion(error)) {
      return { errores: { programaId: 'El programa elegido no existe.' }, valores };
    }
    throw error;
  }

  revalidatePath('/admin/horarios');
  redirect('/admin/horarios');
}

// Un horario sí se puede borrar: no tiene historial asociado
export async function eliminarHorario(id: number) {
  await requerirAdministrador();
  const idValido = leerId(id);
  if (idValido) await db.orm.public.Horario.where({ id: idValido }).delete();
  revalidatePath('/admin/horarios');
  redirect('/admin/horarios');
}