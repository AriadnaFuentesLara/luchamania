'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/prisma/db';
import { hashearContrasena, verificarContrasena } from '@/lib/auth/contrasena';
import { borrarSesion, crearSesion } from '@/lib/auth/sesion';

const MAX_INTENTOS = 5;
const MINUTOS_BLOQUEO = 15;
const MENSAJE_GENERICO = 'Correo o contraseña incorrectos.';

const esquemaLogin = z.object({
  correo: z.email('Ingresá un correo válido.').trim().toLowerCase(),
  contrasena: z.string().min(1, 'Ingresá tu contraseña.'),
});

export type EstadoLogin = { error?: string } | undefined;

// Hash de relleno: si el correo no existe, igual se hace una verificación
// para que la respuesta tarde lo mismo (evita adivinar qué correos existen).
let hashDeRelleno: Promise<string> | undefined;

export async function iniciarSesion(_estado: EstadoLogin, formData: FormData): Promise<EstadoLogin> {
  const datos = esquemaLogin.safeParse({
    correo: formData.get('correo'),
    contrasena: formData.get('contrasena'),
  });
  if (!datos.success) {
    return { error: datos.error.issues[0]?.message ?? MENSAJE_GENERICO };
  }
  const { correo, contrasena } = datos.data;

  const usuario = await db.orm.public.Usuario.where({ correo }).first();

  if (!usuario || !usuario.activo) {
    hashDeRelleno ??= hashearContrasena('relleno-para-igualar-tiempos');
    await verificarContrasena(await hashDeRelleno, contrasena);
    return { error: MENSAJE_GENERICO };
  }

  if (usuario.bloqueadoHasta && new Date(usuario.bloqueadoHasta) > new Date()) {
    return { error: `Cuenta bloqueada temporalmente por intentos fallidos. Intentá de nuevo en ${MINUTOS_BLOQUEO} minutos.` };
  }

  const correcta = await verificarContrasena(usuario.contrasenaHash, contrasena);

  if (!correcta) {
    const intentos = usuario.intentosFallidos + 1;
    const bloquear = intentos >= MAX_INTENTOS;
    await db.orm.public.Usuario.where({ id: usuario.id }).update({
      intentosFallidos: bloquear ? 0 : intentos,
      bloqueadoHasta: bloquear
        ? new Date(Date.now() + MINUTOS_BLOQUEO * 60 * 1000).toISOString()
        : usuario.bloqueadoHasta,
    });
    return { error: MENSAJE_GENERICO };
  }

  await db.orm.public.Usuario.where({ id: usuario.id }).update({
    intentosFallidos: 0,
    bloqueadoHasta: null,
    ultimoAcceso: new Date().toISOString(),
  });

  await crearSesion({ usuarioId: usuario.id, rol: usuario.rol });
  redirect('/admin');
}

export async function cerrarSesion() {
  await borrarSesion();
  redirect('/login');
}