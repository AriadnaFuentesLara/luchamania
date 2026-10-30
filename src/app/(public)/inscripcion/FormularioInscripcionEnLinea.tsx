'use client';

import { useActionState, useState } from 'react';
import { Campo, claseEntrada, ErrorGeneral } from '@/components/admin/Campo';
import { calcularEdad, colones } from '@/lib/formato';
import type { EstadoFormulario } from '@/lib/formularios';
import { inscribirEnLinea } from './acciones';

type Props = { programaId: number; precio: string };

export function FormularioInscripcionEnLinea({ programaId, precio }: Props) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(inscribirEnLinea, undefined);
  const valor = (campo: string) => estado?.valores?.[campo] ?? '';
  const error = estado?.errores ?? {};

  // Si la persona es menor de edad, aparecen los datos de su encargado.
  const [nacimiento, setNacimiento] = useState(valor('fechaNacimiento'));
  const esMenor = /^\d{4}-\d{2}-\d{2}$/.test(nacimiento) && calcularEdad(nacimiento) < 18;

  return (
    <form action={enviar} className="space-y-6 rounded-2xl border border-borde bg-superficie p-6 sm:p-8">
      <p className="flex items-center gap-3 text-sm text-suave">
        <span className="rounded-full bg-marca px-3 py-1 text-xs font-bold uppercase text-tinta">Paso 2 de 3</span>
        Datos de la persona que entrena
      </p>

      {/* programaId no tiene campo visible: si viene mal, su error se muestra arriba. */}
      <ErrorGeneral mensaje={estado?.error ?? error.programaId} />
      <input type="hidden" name="programaId" value={programaId} />

      {/* Trampa para bots: escondida para las personas, los bots la llenan. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor="sitioWeb">No llenar</label>
        <input id="sitioWeb" name="sitioWeb" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Campo etiqueta="Nombre" nombre="nombre" obligatorio error={error.nombre}>
          <input id="nombre" name="nombre" required maxLength={80} autoComplete="given-name" defaultValue={valor('nombre')} className={claseEntrada} />
        </Campo>
        <Campo etiqueta="Apellidos" nombre="apellidos" obligatorio error={error.apellidos}>
          <input id="apellidos" name="apellidos" required maxLength={120} autoComplete="family-name" defaultValue={valor('apellidos')} className={claseEntrada} />
        </Campo>
        <Campo etiqueta="Cédula" nombre="cedula" obligatorio error={error.cedula} ayuda="Con guiones: 1-2345-6789, o DIMEX">
          <input id="cedula" name="cedula" required maxLength={12} defaultValue={valor('cedula')} className={claseEntrada} />
        </Campo>
        <Campo etiqueta="Fecha de nacimiento" nombre="fechaNacimiento" obligatorio error={error.fechaNacimiento}>
          <input
            id="fechaNacimiento"
            name="fechaNacimiento"
            type="date"
            required
            autoComplete="bday"
            defaultValue={valor('fechaNacimiento')}
            onChange={(e) => setNacimiento(e.target.value)}
            className={claseEntrada}
          />
        </Campo>
        <Campo etiqueta="Teléfono" nombre="telefono" obligatorio={!esMenor} error={error.telefono}>
          <input id="telefono" name="telefono" type="tel" maxLength={9} required={!esMenor} autoComplete="tel" defaultValue={valor('telefono')} className={claseEntrada} />
        </Campo>
        <Campo etiqueta="Correo" nombre="correo" obligatorio error={error.correo} ayuda="Aquí le llega el comprobante del pago">
          <input id="correo" name="correo" type="email" required maxLength={120} autoComplete="email" defaultValue={valor('correo')} className={claseEntrada} />
        </Campo>
        {esMenor && (
          <>
            <Campo etiqueta="Encargado (menores)" nombre="encargadoNombre" obligatorio error={error.encargadoNombre}>
              <input id="encargadoNombre" name="encargadoNombre" required maxLength={120} defaultValue={valor('encargadoNombre')} className={claseEntrada} />
            </Campo>
            <Campo etiqueta="Teléfono del encargado" nombre="encargadoTelefono" obligatorio error={error.encargadoTelefono}>
              <input id="encargadoTelefono" name="encargadoTelefono" type="tel" required maxLength={9} defaultValue={valor('encargadoTelefono')} className={claseEntrada} />
            </Campo>
          </>
        )}
      </div>

      <div>
        <label className="flex items-start gap-3 text-sm">
          <input type="checkbox" name="consentimientoDatos" required className="mt-0.5 h-5 w-5 accent-yellow-400" />
          <span>
            Autorizo el uso de mis datos personales para gestionar la inscripción (Ley 8968).
            <span className="mt-1 block text-xs text-suave">
              Responsable: Luchamanía Costa Rica. Los datos se usan solo para la inscripción, la membresía y los pagos, y solo se
              comparten con Tilopay para procesar el pago. Puede pedir verlos, corregirlos o eliminarlos en el gimnasio.
            </span>
          </span>
        </label>
        {error.consentimientoDatos && <p className="mt-1 text-xs font-semibold text-red-700">{error.consentimientoDatos}</p>}
      </div>

      <div className="flex flex-wrap items-end justify-between gap-4 border-t border-borde pt-6">
        <p>
          <span className="block text-sm text-suave">Total a pagar</span>
          <span className="font-display text-4xl font-bold">{colones(precio)}</span>
        </p>
        <button
          type="submit"
          disabled={pendiente}
          className="rounded-lg bg-marca px-6 py-3 font-bold uppercase tracking-wide transition-colors hover:bg-marca-oscuro disabled:opacity-60"
        >
          {pendiente ? 'Un momento...' : 'Continuar al pago →'}
        </button>
      </div>
      <p className="text-xs text-suave">
        Paso 3: el pago se hace en la página segura de Tilopay, con tarjeta o SINPE Móvil. Luchamanía nunca ve los datos de su tarjeta.
      </p>
    </form>
  );
}