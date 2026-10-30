'use client';

import { useActionState, useState } from 'react';
import { BotonesFormulario, Campo, claseEntrada, ErrorGeneral } from '@/components/admin/Campo';
import { colones } from '@/lib/formato';
import type { EstadoFormulario } from '@/lib/formularios';
import { registrarPago } from './acciones';

type Props = {
  miembro: { id: number; nombre: string; apellidos: string; correo: string | null };
  inscripciones: { id: number; programa: { nombre: string; precioMensual: string } | null }[];
};

const METODOS = [
  { valor: 'efectivo', nombre: 'Efectivo' },
  { valor: 'sinpe', nombre: 'SINPE Móvil' },
  { valor: 'transferencia', nombre: 'Transferencia' },
  { valor: 'tilopay', nombre: 'Tarjeta (Tilopay)' },
];

export function FormularioPago({ miembro, inscripciones }: Props) {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(registrarPago, undefined);
  const error = estado?.errores ?? {};

  const primera = inscripciones[0];
  const [metodo, setMetodo] = useState(estado?.valores?.metodoPago ?? 'efectivo');
  const [monto, setMonto] = useState(estado?.valores?.monto ?? primera?.programa?.precioMensual ?? '');

  // Al elegir otra inscripción, el monto se llena con el precio de ese programa.
  function cambiarInscripcion(id: string) {
    const elegida = inscripciones.find((i) => String(i.id) === id);
    if (elegida?.programa) setMonto(elegida.programa.precioMensual);
  }

  return (
    <form action={enviar} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <ErrorGeneral mensaje={estado?.error} />
      <input type="hidden" name="miembroId" value={miembro.id} />
      <p className="text-sm">
        Miembro: <strong>{miembro.nombre} {miembro.apellidos}</strong>
      </p>

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo etiqueta="Programa que paga" nombre="inscripcionId" error={error.inscripcionId}>
          <select
            id="inscripcionId"
            name="inscripcionId"
            defaultValue={estado?.valores?.inscripcionId ?? primera?.id ?? ''}
            onChange={(e) => cambiarInscripcion(e.target.value)}
            className={claseEntrada}
          >
            {inscripciones.map((i) => (
              <option key={i.id} value={i.id}>
                {i.programa?.nombre} ({colones(i.programa?.precioMensual ?? 0)})
              </option>
            ))}
            <option value="">Otro (sin programa)</option>
          </select>
        </Campo>

        <Campo etiqueta="Monto (₡)" nombre="monto" obligatorio error={error.monto}>
          <input
            id="monto"
            name="monto"
            type="number"
            min={1}
            step="0.01"
            required
            value={monto}
            onChange={(e) => setMonto(e.target.value)}
            className={claseEntrada}
          />
        </Campo>

        <Campo etiqueta="Método de pago" nombre="metodoPago" obligatorio error={error.metodoPago}>
          <select id="metodoPago" name="metodoPago" value={metodo} onChange={(e) => setMetodo(e.target.value)} className={claseEntrada}>
            {METODOS.map((m) => (
              <option key={m.valor} value={m.valor}>
                {m.nombre}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      {(metodo === 'sinpe' || metodo === 'transferencia') && (
        <label className="flex items-start gap-3 rounded-xl bg-yellow-50 p-4 text-sm">
          <input type="checkbox" name="verificado" className="mt-1 h-4 w-4 accent-yellow-400" />
          <span>
            <strong>Ya revisé el comprobante</strong> y el dinero entró a la cuenta. Si no lo marcás, el pago queda
            pendiente hasta que lo apruebes en la lista de pagos.
          </span>
        </label>
      )}

      {metodo === 'tilopay' && (
        <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
          Al guardar se abre la página segura de Tilopay para pagar con tarjeta. Este sistema nunca ve los datos de la
          tarjeta. {!miembro.correo && <strong className="text-red-700">Este miembro no tiene correo: agregalo primero.</strong>}
        </p>
      )}

      <BotonesFormulario pendiente={pendiente} volverA={`/admin/miembros/${miembro.id}`} />
    </form>
  );
}