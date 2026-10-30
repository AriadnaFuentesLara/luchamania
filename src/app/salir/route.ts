import { redirect } from 'next/navigation';
import { borrarSesion } from '@/lib/auth/sesion';

// Borra la cookie de sesión y manda al login. La usa obtenerUsuarioActual() cuando
// la cookie es válida pero el usuario ya no existe o fue desactivado: una página no
// puede borrar cookies.
export async function GET() {
  await borrarSesion();
  redirect('/login');
}