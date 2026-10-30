'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { db } from '@/prisma/db';
import { obtenerUsuarioActual } from '@/lib/auth/dal';
import { erroresDeValidacion, leerFormulario, leerId, type EstadoFormulario } from '@/lib/formularios';
import { aprobarPago, resolverOrdenTilopay } from '@/lib/pagos';
import { crearCobro } from '@/lib/tilopay';

const esquemaPago = z.object({
  miembroId: z.coerce.number().int().positive('Elegí un miembro.'),
  inscripcionId: z.preprocess((v) => (v === '' ? null : v), z.coerce.number().int().positive().nullable()),
  metodoPago: z.enum(['efectivo', 'sinpe', 'transferencia', 'tilopay'], 'Elegí el método de pago.'),
  monto: z.preprocess(
    (v) => (v === '' ? undefined : v),
    z.coerce.number('Escribí el monto en números.').positive('El monto debe ser mayor a 0.').max(10_000_000, 'Monto demasiado alto.'),
  ),
  verificado: z.boolean(),
});

export async function registrarPago(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const usuario = await obtenerUsuarioActual();

  const valores = leerFormulario(formData);
  const datos = esquemaPago.safeParse({ ...valores, verificado: formData.get('verificado') === 'on' });
  if (!datos.success) return erroresDeValidacion(datos.error, valores);
  const { miembroId, inscripcionId, metodoPago, monto, verificado } = datos.data;

  const miembro = await db.orm.public.Miembro.where({ id: miembroId, activo: true }).first();
  if (!miembro) return { errores: { miembroId: 'El miembro no existe o está inactivo.' }, valores };

  // La inscripción tiene que ser de ESTE miembro (no se puede mezclar con la de otro).
  if (inscripcionId !== null) {
    const inscripcion = await db.orm.public.Inscripcion.where({ id: inscripcionId, miembroId }).first();
    if (!inscripcion) return { errores: { inscripcionId: 'Esa inscripción no es de este miembro.' }, valores };
  }

  if (metodoPago === 'tilopay' && !miembro.correo) {
    return { errores: { metodoPago: 'Para pagar con Tilopay el miembro necesita un correo. Agregalo en su ficha.' }, valores };
  }

  // Número de orden único para Tilopay. El sufijo evita choques si la base se reinicia
  const orden = metodoPago === 'tilopay' ? `LM-${miembroId}-${Date.now().toString(36)}` : null;

  // Todo pago nace "pendiente". Solo aprobarPago() lo aprueba y extiende la membresía
  const pago = await db.orm.public.Pago.create({
    miembroId,
    inscripcionId,
    metodoPago,
    monto: monto.toFixed(2),
    referenciaTilopay: orden,
    registradoPorId: usuario.id,
  });

  if (orden) {
    let urlTilopay: string;
    try {
      urlTilopay = await crearCobro({
        orden,
        monto: pago.monto,
        nombre: miembro.nombre,
        apellidos: miembro.apellidos,
        correo: miembro.correo!,
        telefono: miembro.telefono ?? miembro.encargadoTelefono ?? '',
        urlRetorno: `${process.env.APP_URL}/api/tilopay/retorno`,
      });
    } catch (error) {
      console.error(error);
      await db.orm.public.Pago.where({ id: pago.id, estado: 'pendiente' }).update({ estado: 'rechazado' });
      return { error: 'No se pudo conectar con Tilopay. Intentá de nuevo o usá otro método.', valores };
    }
    redirect(urlTilopay); // la persona paga en la página de Tilopay
  }

  // Efectivo siempre; SINPE y transferencia solo si ya se revisó el comprobante
  if (metodoPago === 'efectivo' || verificado) await aprobarPago(pago.id);

  revalidatePath('/admin/pagos');
  revalidatePath(`/admin/miembros/${miembroId}`);
  redirect('/admin/pagos');
}

// Para SINPE o transferencia que quedaron pendientes hasta ver el comprobante
export async function aprobarPagoPendiente(id: number) {
  await obtenerUsuarioActual();
  const idValido = leerId(id);
  if (idValido) await aprobarPago(idValido);
  revalidatePath('/admin/pagos');
}

export async function rechazarPago(id: number) {
  await obtenerUsuarioActual();
  const idValido = leerId(id);
  if (idValido) await db.orm.public.Pago.where({ id: idValido, estado: 'pendiente' }).update({ estado: 'rechazado' });
  revalidatePath('/admin/pagos');
}

// Pregunta a Tilopay por un cobro que quedó pendiente (por ejemplo, si se cerró la ventana)
export async function verificarTilopay(orden: string) {
  await obtenerUsuarioActual();
  await resolverOrdenTilopay(String(orden));
  revalidatePath('/admin/pagos');
}