'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import { obtenerUsuarioActual } from '@/lib/auth/dal';
import { esViolacionUnica } from '@/lib/errores-db';
import { esquemaMiembro } from '@/lib/esquemas';
import { erroresDeValidacion, leerFormulario, leerId, type EstadoFormulario } from '@/lib/formularios';

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