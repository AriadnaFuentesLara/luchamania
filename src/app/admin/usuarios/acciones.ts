'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/prisma/db';
import { requerirAdministrador } from '@/lib/auth/dal';
import { hashearContrasena } from '@/lib/auth/contrasena';
import { esViolacionUnica } from '@/lib/errores-db';
import { erroresDeValidacion, leerFormulario, leerId, type EstadoFormulario } from '@/lib/formularios';

// OWASP: mínimo 12 caracteres; máximo 128 para que nadie mande textos enormes al hash.
const contrasenaNueva = z.string().min(12, 'Mínimo 12 caracteres.').max(128, 'Máximo 128 caracteres.');

const esquemaUsuario = z.object({
  nombre: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(80, 'Máximo 80 caracteres.'),
  correo: z.email('Correo no válido.').trim().toLowerCase(),
  rol: z.enum(['administrador', 'asistente'], 'Elegí un rol.'),
  activo: z.boolean(),
  // Al crear es obligatoria. Al editar, vacía = no se cambia.
  contrasena: z.union([z.literal(''), contrasenaNueva]),
});

export async function guardarUsuario(
  id: number | null,
  _estado: EstadoFormulario,
  formData: FormData,
): Promise<EstadoFormulario> {
  const yo = await requerirAdministrador();

  const valores = leerFormulario(formData);
  delete valores.contrasena; // la contraseña nunca se devuelve al navegador, ni siquiera si hubo un error
  const datos = esquemaUsuario.safeParse({
    ...valores,
    contrasena: formData.get('contrasena') ?? '',
    activo: formData.get('activo') === 'on',
  });
  if (!datos.success) return erroresDeValidacion(datos.error, valores);
  const { contrasena, ...usuario } = datos.data;

  if (contrasena && contrasena.toLowerCase().includes(usuario.correo.split('@')[0])) {
    return { errores: { contrasena: 'La contraseña no puede contener el correo.' }, valores };
  }

  try {
    if (id === null) {
      if (!contrasena) return { errores: { contrasena: 'Escribí una contraseña temporal.' }, valores };
      await db.orm.public.Usuario.create({ ...usuario, contrasenaHash: await hashearContrasena(contrasena) });
    } else {
      const idValido = leerId(id);
      if (!idValido) return { error: 'Usuario no válido.', valores };
      // Nadie se puede quitar a sí mismo el rol de administrador ni desactivarse:
      // así siempre queda al menos un administrador activo.
      if (idValido === yo.id && (usuario.rol !== 'administrador' || !usuario.activo)) {
        return { error: 'No podés quitarte el rol de administrador ni desactivar tu propia cuenta.', valores };
      }
      await db.orm.public.Usuario.where({ id: idValido }).update({
        ...usuario,
        ...(contrasena ? { contrasenaHash: await hashearContrasena(contrasena), intentosFallidos: 0, bloqueadoHasta: null } : {}),
      });
    }
  } catch (error) {
    if (esViolacionUnica(error)) return { errores: { correo: 'Ya hay un usuario con ese correo.' }, valores };
    throw error;
  }

  revalidatePath('/admin/usuarios');
  redirect('/admin/usuarios');
}

export async function desbloquearUsuario(id: number) {
  await requerirAdministrador();
  const idValido = leerId(id);
  if (idValido) await db.orm.public.Usuario.where({ id: idValido }).update({ intentosFallidos: 0, bloqueadoHasta: null });
  revalidatePath('/admin/usuarios');
}