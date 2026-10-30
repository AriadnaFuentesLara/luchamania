import 'server-only';
import { db } from '@/prisma/db';
import { hoyEnCostaRica } from './formato';
import { sumarMeses } from './membresias';
import { consultarOrden } from './tilopay';

// Aprueba un pago pendiente y extiende la membresía un mes, todo junto:
// si algo falla, no queda ni el pago aprobado ni la membresía extendida
// Devuelve false si el pago ya no estaba pendiente (así nunca se cobra dos veces)
export function aprobarPago(pagoId: number) {
  return db.transaction(async (tx) => {
    // El "where estado = pendiente" hace que dos aprobaciones al mismo tiempo no dupliquen el mes
    const pago = await tx.orm.public.Pago.where({ id: pagoId, estado: 'pendiente' }).update({ estado: 'aprobado' });
    if (!pago) return false;

    const hoy = hoyEnCostaRica();
    const actual = await tx.orm.public.Membresia.where({ miembroId: pago.miembroId })
      .orderBy((m) => m.fechaVencimiento.desc())
      .first();

    if (actual && actual.fechaVencimiento >= hoy) {
      // Todavía vigente (o suspendida pero sin vencer): se suma un mes a partir del vencimiento
      await tx.orm.public.Membresia.where({ id: actual.id }).update({
        estado: 'activa',
        fechaVencimiento: sumarMeses(actual.fechaVencimiento, 1),
      });
    } else {
      // Sin membresía o ya vencida: empieza hoy.
      await tx.orm.public.Membresia.create({
        miembroId: pago.miembroId,
        estado: 'activa',
        fechaInicio: hoy,
        fechaVencimiento: sumarMeses(hoy, 1),
      });
    }
    return true;
  });
}

// Revisa con Tilopay cómo terminó una orden y actualiza el pago
// La usan la página de retorno de Tilopay y el botón "Verificar" de la lista de pagos
export async function resolverOrdenTilopay(orden: string) {
  const pago = await db.orm.public.Pago.where({ referenciaTilopay: orden }).first();
  if (!pago) return 'desconocido';
  if (pago.estado !== 'pendiente') return pago.estado;

  const resultado = await consultarOrden(orden);
  if (!resultado) return 'pendiente'; // la persona no terminó de pagar

  if (!resultado.aprobado) {
    await db.orm.public.Pago.where({ id: pago.id, estado: 'pendiente' }).update({ estado: 'rechazado' });
    return 'rechazado';
  }

  // Aprobado por Tilopay: se confirma que el monto y la moneda sean los que se cobraron
  if (resultado.moneda !== 'CRC' || Math.abs(resultado.monto - Number(pago.monto)) > 0.009) {
    console.error(`Tilopay: la orden ${orden} no coincide con el pago ${pago.id}. Revisar a mano.`);
    return 'pendiente';
  }
  await aprobarPago(pago.id);
  return 'aprobado';
}