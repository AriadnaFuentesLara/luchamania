import 'server-only';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const NOMBRE_COOKIE = 'sesion';
const DURACION_HORAS = 8;

export type DatosSesion = {
  usuarioId: number;
  rol: 'administrador' | 'asistente';
};

function clave() {
  const secreto = process.env.SESSION_SECRET;
  if (!secreto || secreto.length < 32) {
    throw new Error('SESSION_SECRET no está definido o es muy corto (mínimo 32 caracteres).');
  }
  return new TextEncoder().encode(secreto);
}

export async function cifrarSesion(datos: DatosSesion) {
  return new SignJWT(datos)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${DURACION_HORAS}h`)
    .sign(clave());
}

export async function descifrarSesion(token: string | undefined): Promise<DatosSesion | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, clave(), { algorithms: ['HS256'] });
    return { usuarioId: Number(payload.usuarioId), rol: payload.rol as DatosSesion['rol'] };
  } catch {
    return null;
  }
}

export async function crearSesion(datos: DatosSesion) {
  const token = await cifrarSesion(datos);
  const cookieStore = await cookies();
  cookieStore.set(NOMBRE_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: DURACION_HORAS * 60 * 60,
  });
}

export async function leerSesion() {
  const cookieStore = await cookies();
  return descifrarSesion(cookieStore.get(NOMBRE_COOKIE)?.value);
}

export async function borrarSesion() {
  const cookieStore = await cookies();
  cookieStore.delete(NOMBRE_COOKIE);
}