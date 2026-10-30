import { redirect } from 'next/navigation';
import type { NextRequest } from 'next/server';
import { resolverOrdenTilopay } from '@/lib/pagos';

// Tilopay manda aquí a la persona que pagó desde el sitio público.
// Igual que el retorno del panel: solo se usa el número de orden, y el resultado
// se le pregunta a Tilopay directamente. El "code" de la dirección se ignora.
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

  redirect(`/inscripcion/resultado?estado=${resultado}`);
}