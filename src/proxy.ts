import { NextResponse, type NextRequest } from 'next/server';
import { descifrarSesion } from '@/lib/auth/sesion';

// Revisión rápida (optimista): solo mira si la cookie de sesión es válida.
// La revisión segura, contra la base de datos, la hace obtenerUsuarioActual().
export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sesion = await descifrarSesion(request.cookies.get('sesion')?.value);

  if (pathname.startsWith('/admin') && !sesion) {
    return NextResponse.redirect(new URL('/login', request.nextUrl));
  }

  if (pathname === '/login' && sesion) {
    return NextResponse.redirect(new URL('/admin', request.nextUrl));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};