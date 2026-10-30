'use server';

import { redirect } from 'next/navigation';
import { db } from '@/prisma/db';
import { esViolacionUnica } from '@/lib/errores-db';
import { esquemaInscripcionEnLinea } from '@/lib/esquemas';
import { calcularEdad } from '@/lib/formato';
import { erroresDeValidacion, leerFormulario, type EstadoFormulario } from '@/lib/formularios';
import { permitirIntento } from '@/lib/limite';
import { crearCobro } from '@/lib/tilopay';

const CEDULA_REGISTRADA =
  'Esta cédula ya está registrada. Use el mismo correo con el que se inscribió, o comuníquese con Luchamanía.';

// Inscripción desde el sitio público: cualquiera puede llamar a esta acción (no hay sesión),
// así que se valida TODO en el servidor y nunca se confía en lo que manda el navegador.
export async function inscribirEnLinea(_estado: EstadoFormulario, formData: FormData): Promise<EstadoFormulario> {
  const valores = leerFormulario(formData);

  // Trampa para bots: un campo oculto que las personas no ven y por lo tanto dejan vacío.
  if (valores.sitioWeb) return { error: 'No se pudo procesar la inscripción.', valores };
  delete valores.sitioWeb;

  if (!(await permitirIntento('inscripcion'))) {
    return { error: 'Demasiados intentos seguidos. Espere unos minutos y vuelva a intentarlo.', valores };
  }

  const datos = esquemaInscripcionEnLinea.safeParse({
    encargadoNombre: '',
    encargadoTelefono: '',
    ...valores,
    consentimientoDatos: formData.get('consentimientoDatos') === 'on',
  });
  if (!datos.success) return erroresDeValidacion(datos.error, valores);
  const { programaId, ...persona } = datos.data;

  // El precio sale de la base de datos, nunca del formulario: así nadie puede cambiar el monto.
  const programa = await db.orm.public.Programa.where({ id: programaId, activo: true })
    .include('disciplina', (d) => d.select('activa'))
    .first();
  if (!programa || !programa.disciplina?.activa) return { error: 'Ese programa ya no está disponible.', valores };

  // Si la cédula ya existe (por ejemplo, un intento anterior que no se pagó, o una renovación),
  // se usa ese miembro SOLO si el correo coincide, y sus datos no se cambian desde aquí.
  // Así nadie puede modificar ni ver los datos de otra persona escribiendo su cédula.
  const existente = await db.orm.public.Miembro.where({ cedula: persona.cedula }).first();
  if (existente && (!existente.activo || existente.correo !== persona.correo)) {
    return { errores: { cedula: CEDULA_REGISTRADA }, valores };
  }
  const miembro = existente ?? persona;

  // Misma regla que en el panel: la edad tiene que estar dentro del rango del programa.
  const edad = calcularEdad(miembro.fechaNacimiento);
  if ((programa.edadMinima !== null && edad < programa.edadMinima) || (programa.edadMaxima !== null && edad > programa.edadMaxima)) {
    return {
      errores: { fechaNacimiento: `Este programa es de ${programa.edadMinima ?? 0} a ${programa.edadMaxima ?? 'más'} años.` },
      valores,
    };
  }

  // Miembro, inscripción y pago se crean juntos: si algo falla, no queda nada a medias.
  let registro: { miembroId: number; pagoId: number; orden: string };
  try {
    registro = await db.transaction(async (tx) => {
      const miembroId = existente?.id ?? (await tx.orm.public.Miembro.select('id').create(persona)).id;

      // La inscripción nace inactiva y se activa cuando se aprueba el pago (aprobarPago).
      const inscripcion =
        (await tx.orm.public.Inscripcion.where({ miembroId, programaId }).select('id').first()) ??
        (await tx.orm.public.Inscripcion.select('id').create({ miembroId, programaId, activa: false }));

      const orden = `LM-${miembroId}-${Date.now().toString(36)}`;
      const pago = await tx.orm.public.Pago.select('id').create({
        miembroId,
        inscripcionId: inscripcion.id,
        metodoPago: 'tilopay',
        monto: Number(programa.precioMensual).toFixed(2),
        referenciaTilopay: orden,
        registradoPorId: null, // null = lo hizo la persona desde el sitio, no el personal
      });
      return { miembroId, pagoId: pago.id, orden };
    });
  } catch (error) {
    // Dos envíos al mismo tiempo con la misma cédula: el segundo choca con el UNIQUE.
    if (esViolacionUnica(error)) return { errores: { cedula: CEDULA_REGISTRADA }, valores };
    throw error;
  }

  let urlTilopay: string;
  try {
    urlTilopay = await crearCobro({
      orden: registro.orden,
      monto: programa.precioMensual,
      nombre: miembro.nombre,
      apellidos: miembro.apellidos,
      correo: persona.correo,
      telefono: miembro.telefono ?? miembro.encargadoTelefono ?? '',
      urlRetorno: `${process.env.APP_URL}/inscripcion/retorno`,
    });
  } catch (error) {
    console.error(error);
    await db.orm.public.Pago.where({ id: registro.pagoId, estado: 'pendiente' }).update({ estado: 'rechazado' });
    return { error: 'No pudimos conectar con la página de pago. Intente de nuevo en unos minutos.', valores };
  }

  redirect(urlTilopay); // la persona paga en la página segura de Tilopay
}