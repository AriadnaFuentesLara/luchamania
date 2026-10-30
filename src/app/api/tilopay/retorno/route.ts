import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { resolverOrdenTilopay } from '@/lib/pagos';

// Tilopay manda a la persona aquí cuando termina de pagar: /api/tilopay/retorno?order=...&code=...
// Del enlace solo se usa el número de orden. Si el pago se aprobó o no, se le pregunta
// directamente a Tilopay (resolverOrdenTilopay), porque el "code=1" lo puede escribir cualquiera.
export async function GET(request: NextRequest) {
  const orden = request.nextUrl.searchParams.get('order') ?? '';

  let resultado = 'desconocido';
  if (/^LM-\d+-[a-z0-9]+$/.test(orden)) {
    try {
      resultado = await resolverOrdenTilopay(orden);
    } catch (error) {
      console.error(error);
      resultado = 'pendiente';
    }
  }

  redirect(`/admin/pagos?tilopay=${resultado}`);
}