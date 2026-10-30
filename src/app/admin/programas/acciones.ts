'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/prisma/db';
import { requerirAdministrador } from '@/lib/auth/dal';
import { esViolacionRelacion, esViolacionUnica } from '@/lib/errores-db';
import { erroresDeValidacion, leerFormulario, leerId, type EstadoFormulario } from '@/lib/formularios';

// Campo de número opcional: vacío = sin dato (null).
const edad = z.preprocess(
  (valor) => (valor === '' || valor === undefined ? null : valor),
  z.coerce.number('Escribí un número.').int('Debe ser un número entero.').min(0, 'No puede ser negativa.').max(120, 'Edad no válida.').nullable(),
);

const esquemaPrograma = z
  .object({
    disciplinaId: z.coerce.number().int().positive('Elegí una disciplina.'),
    nombre: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(80, 'Máximo 80 caracteres.'),
    publicoMeta: z.string().trim().max(120, 'Máximo 120 caracteres.').transform((t) => t || null),
    edadMinima: edad,
    edadMaxima: edad,
    // Vacío se convierte en undefined para que no cuente como 0.
    precioMensual: z.preprocess(
      (valor) => (valor === '' ? undefined : valor),
      z.coerce.number('Escribí el precio en números.').min(0, 'No puede ser negativo.').max(10_000_000, 'Precio demasiado alto.'),
    ),
  })
  .refine((p) => p.edadMinima === null || p.edadMaxima === null || p.edadMinima <= p.edadMaxima, {
    message: 'La edad máxima debe ser mayor o igual a la mínima.',
    path: ['edadMaxima'],
  });

export async function guardarPrograma(
  id: number | null,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  await requerirAdministrador();

  const valores = leerFormulario(formData);
  const datos = esquemaPrograma.safeParse(valores);
  if (!datos.success) return erroresDeValidacion(datos.error, valores);

  // El precio se guarda como texto en una columna decimal: así no hay errores de redondeo.
  const programa = { ...datos.data, precioMensual: String(datos.data.precioMensual) };

  try {
    if (id === null) {
      await db.orm.public.Programa.create(programa);
    } else {
      const idValido = leerId(id);
      if (!idValido) return { error: 'Programa no válido.', valores };
      await db.orm.public.Programa.where({ id: idValido }).update(programa);
    }
  } catch (error) {
    if (esViolacionUnica(error)) {
      return { errores: { nombre: 'Esa disciplina ya tiene un programa con ese nombre.' }, valores };
    }
    if (esViolacionRelacion(error)) {
      return { errores: { disciplinaId: 'La disciplina elegida no existe.' }, valores };
    }
    throw error;
  }

  revalidatePath('/admin/disciplinas');
  redirect('/admin/disciplinas');
}

export async function cambiarEstadoPrograma(id: number, activo: boolean) {
  await requerirAdministrador();
  const idValido = leerId(id);
  if (!idValido) return;
  await db.orm.public.Programa.where({ id: idValido }).update({ activo: activo === true });
  revalidatePath('/admin/disciplinas');
}