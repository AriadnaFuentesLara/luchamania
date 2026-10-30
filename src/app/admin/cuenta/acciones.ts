'use server';

import { z } from 'zod';
import { db } from '@/prisma/db';
import { obtenerUsuarioActual } from '@/lib/auth/dal';
import { hashearContrasena, verificarContrasena } from '@/lib/auth/contrasena';
import { erroresDeValidacion, type EstadoFormulario } from '@/lib/formularios';

const esquemaCambio = z
  .object({
    actual: z.string().min(1, 'Escribí tu contraseña actual.').max(128),
    nueva: z.string().min(12, 'Mínimo 12 caracteres.').max(128, 'Máximo 128 caracteres.'),
    confirmacion: z.string(),
  })
  .refine((d) => d.nueva === d.confirmacion, { message: 'Las contraseñas no coinciden.', path: ['confirmacion'] })
  .refine((d) => d.nueva !== d.actual, { message: 'La nueva tiene que ser distinta a la actual.', path: ['nueva'] });

export async function cambiarContrasena(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const yo = await obtenerUsuarioActual();

  // Ninguna contraseña se devuelve al formulario: si hay error, se vuelven a escribir.
  const datos = esquemaCambio.safeParse({
    actual: formData.get('actual') ?? '',
    nueva: formData.get('nueva') ?? '',
    confirmacion: formData.get('confirmacion') ?? '',
  });
  if (!datos.success) return erroresDeValidacion(datos.error, {});

  const usuario = await db.orm.public.Usuario.where({ id: yo.id }).select('correo', 'contrasenaHash').first();
  if (!usuario || !(await verificarContrasena(usuario.contrasenaHash, datos.data.actual))) {
    return { errores: { actual: 'La contraseña actual no es correcta.' } };
  }
  if (datos.data.nueva.toLowerCase().includes(usuario.correo.split('@')[0])) {
    return { errores: { nueva: 'La contraseña no puede contener tu correo.' } };
  }

  await db.orm.public.Usuario.where({ id: yo.id }).update({ contrasenaHash: await hashearContrasena(datos.data.nueva) });
  return { valores: { listo: 'si' } };
}