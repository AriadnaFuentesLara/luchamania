'use client';

import { useActionState } from 'react';
import { BotonesFormulario, Campo, claseEntrada, ErrorGeneral } from '@/components/admin/Campo';
import { DIAS } from '@/lib/formato';
import type { EstadoFormulario } from '@/lib/formularios';

type Inicial = {
  programaId?: number;
  dia?: string;
  horaInicio?: string;
  horaFin?: string;
  lugar?: string;
};

type Props = {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  programas: { id: number; nombre: string; disciplina: { nombre: string } | null }[];
  inicial?: Inicial;
};

export function FormularioHorario({ accion, programas, inicial = {} }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, undefined);
  // La base devuelve "17:00:00"; el campo de hora usa "17:00"
  const valor = (campo: keyof Inicial) => estado?.valores?.[campo] ?? String(inicial[campo] ?? '').slice(0, campo.startsWith('hora') ? 5 : undefined);
  const error = estado?.errores ?? {};

  return (
    <form action={enviar} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <ErrorGeneral mensaje={estado?.error} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo etiqueta="Programa" nombre="programaId" obligatorio error={error.programaId}>
          <select id="programaId" name="programaId" required defaultValue={valor('programaId')} className={claseEntrada}>
            {programas.map((p) => (
              <option key={p.id} value={p.id}>
                {p.disciplina?.nombre} · {p.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Día" nombre="dia" obligatorio error={error.dia}>
          <select id="dia" name="dia" required defaultValue={valor('dia') || 'lunes'} className={claseEntrada}>
            {DIAS.map((d) => (
              <option key={d.valor} value={d.valor}>
                {d.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Hora de inicio" nombre="horaInicio" obligatorio error={error.horaInicio}>
          <input id="horaInicio" name="horaInicio" type="time" required defaultValue={valor('horaInicio')} className={claseEntrada} />
        </Campo>

        <Campo etiqueta="Hora de fin" nombre="horaFin" obligatorio error={error.horaFin}>
          <input id="horaFin" name="horaFin" type="time" required defaultValue={valor('horaFin')} className={claseEntrada} />
        </Campo>

        <div className="sm:col-span-2">
          <Campo etiqueta="Lugar" nombre="lugar" obligatorio error={error.lugar}>
            <input id="lugar" name="lugar" required maxLength={120} defaultValue={valor('lugar') || 'Sede principal'} className={claseEntrada} />
          </Campo>
        </div>
      </div>

      <BotonesFormulario pendiente={pendiente} volverA="/admin/horarios" />
    </form>
  );
}