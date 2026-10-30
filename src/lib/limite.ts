import 'server-only';
import { headers } from 'next/headers';

// Límite de intentos para formularios públicos (sin sesión): máximo 5 por IP cada 10 minutos.
// Frena bots que llenen la base de datos de registros falsos (OWASP A04, protección contra abuso).
// Se guarda en memoria del servidor: es un freno básico, no reemplaza un firewall.
const VENTANA_MS = 10 * 60_000;
const MAXIMO = 5;
const intentos = new Map<string, number[]>();

export async function permitirIntento(accion: string) {
  const ip = (await headers()).get('x-forwarded-for')?.split(',')[0]?.trim() || 'desconocida';
  const clave = `${accion}:${ip}`;
  const ahora = Date.now();
  const recientes = (intentos.get(clave) ?? []).filter((t) => ahora - t < VENTANA_MS);
  if (recientes.length >= MAXIMO) return false;
  recientes.push(ahora);
  intentos.set(clave, recientes);
  // Limpieza para que el mapa no crezca sin fin.
  if (intentos.size > 5000) intentos.clear();
  return true;
}