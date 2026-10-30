'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/prisma/db';
import { obtenerUsuarioActual } from '@/lib/auth/dal';
import { esViolacionUnica } from '@/lib/errores-db';
import { calcularEdad, hoyEnCostaRica } from '@/lib/formato';
import { erroresDeValidacion, leerFormulario, leerId, type EstadoFormulario } from '@/lib/formularios';

// Texto opcional: vacío se guarda como null.
const opcional = (maximo: number) =>
  z.string().trim().max(maximo, `Máximo ${maximo} caracteres.`).transform((t) => t || null);

// Teléfono de Costa Rica: 8 dígitos. Se guarda siempre como 8888-8888.
const telefono = z
  .string()
  .trim()
  .transform((t) => t.replace(/\D/g, ''))
  .refine((t) => t === '' || /^\d{8}$/.test(t), 'Debe tener 8 dígitos.')
  .transform((t) => (t ? `${t.slice(0, 4)}-${t.slice(4)}` : null));

const esquemaMiembro = z
  .object({
    // Cédula física (1-2345-6789) o DIMEX (11 o 12 dígitos).
    cedula: z
      .string()
      .trim()
      .regex(/^(\d-\d{4}-\d{4}|\d{11,12})$/, 'Formato: 1-2345-6789, o DIMEX de 11 o 12 dígitos.'),
    nombre: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(80, 'Máximo 80 caracteres.'),
    apellidos: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(120, 'Máximo 120 caracteres.'),
    fechaNacimiento: z.iso.date('Fecha no válida.'),
    telefono,
    correo: z
      .string()
      .trim()
      .toLowerCase()
      .refine((t) => t === '' || z.email().safeParse(t).success, 'Correo no válido.')
      .transform((t) => t || null),
    encargadoNombre: opcional(120),
    encargadoTelefono: telefono,
    // Ley 8968: sin consentimiento no se guardan datos personales.
    consentimientoDatos: z.literal(true, 'Se necesita el consentimiento para registrar los datos.'),
  })
  .superRefine((m, ctx) => {
    if (m.fechaNacimiento > hoyEnCostaRica() || m.fechaNacimiento < '1900-01-01') {
      ctx.addIssue({ code: 'custom', path: ['fechaNacimiento'], message: 'Fecha de nacimiento no válida.' });
      return;
    }
    // Las personas menores de edad necesitan una persona encargada.
    if (calcularEdad(m.fechaNacimiento) < 18) {
      if (!m.encargadoNombre) {
        ctx.addIssue({ code: 'custom', path: ['encargadoNombre'], message: 'Obligatorio para menores de edad.' });
      }
      if (!m.encargadoTelefono) {
        ctx.addIssue({ code: 'custom', path: ['encargadoTelefono'], message: 'Obligatorio para menores de edad.' });
      }
    }
  });

export async function guardarMiembro(
  id: number | null,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  // Administrador y asistente pueden gestionar miembros.
  await obtenerUsuarioActual();

  const valores = leerFormulario(formData);
  const datos = esquemaMiembro.safeParse({
    // Para adultos el formulario no muestra los campos del encargado: llegan vacíos.
    encargadoNombre: '',
    encargadoTelefono: '',
    ...valores,
    consentimientoDatos: formData.get('consentimientoDatos') === 'on',
  });
  if (!datos.success) return erroresDeValidacion(datos.error, valores);

  let nuevoId = id;
  try {
    if (id === null) {
      const creado = await db.orm.public.Miembro.select('id').create(datos.data);
      nuevoId = creado.id;
    } else {
      const idValido = leerId(id);
      if (!idValido) return { error: 'Miembro no válido.', valores };
      await db.orm.public.Miembro.where({ id: idValido }).update(datos.data);
    }
  } catch (error) {
    if (esViolacionUnica(error)) {
      return { errores: { cedula: 'Esta cédula ya está registrada para otro miembro.' }, valores };
    }
    throw error;
  }

  revalidatePath('/admin/miembros');
  redirect(`/admin/miembros?guardado=${nuevoId}`);
}

// No se borran miembros: tienen pagos e inscripciones asociados. Se desactivan.
export async function cambiarEstadoMiembro(id: number, activo: boolean) {
  await obtenerUsuarioActual();
  const idValido = leerId(id);
  if (!idValido) return;
  await db.orm.public.Miembro.where({ id: idValido }).update({ activo: activo === true });
  revalidatePath('/admin/miembros');
}