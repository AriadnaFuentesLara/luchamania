import 'server-only';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import { leerSesion } from './sesion';

export type UsuarioActual = {
  id: number;
  nombre: string;
  rol: 'administrador' | 'asistente';
};

// Verifica la sesión contra la base en cada petición: si el usuario fue
// desactivado o le cambiaron el rol, el cambio aplica de inmediato.
export const obtenerUsuarioActual = cache(async (): Promise<UsuarioActual> => {
  const sesion = await leerSesion();
  if (!sesion) redirect('/login');

  const usuario = await db.orm.public.Usuario.where({ id: sesion.usuarioId })
    .select('id', 'nombre', 'rol', 'activo')
    .first();

    // Cookie válida pero usuario desactivado o borrado: se borra la cookie en /salir.
    // (Si se mandara directo a /login, el proxy vería la cookie y lo devolvería a /admin sin fin.)
    if (!usuario || !usuario.activo) redirect('/salir');

  return { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol };
});

export async function requerirAdministrador() {
  const usuario = await obtenerUsuarioActual();
  if (usuario.rol !== 'administrador') redirect('/admin?error=sin-permiso');
  return usuario;
}