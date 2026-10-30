'use client';

import { useActionState } from 'react';
import { BotonesFormulario, Campo, claseEntrada, ErrorGeneral } from '@/components/admin/Campo';
import type { EstadoFormulario } from '@/lib/formularios';

type Inicial = {
  disciplinaId: number;
  nombre?: string;
  publicoMeta?: string | null;
  edadMinima?: number | null;
  edadMaxima?: number | null;
  precioMensual?: string;
};

type Props = {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  disciplinas: { id: number; nombre: string }[];
  inicial: Inicial;
};

export function FormularioPrograma({ accion, disciplinas, inicial }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, undefined);
  const valor = (campo: keyof Inicial) => estado?.valores?.[campo] ?? String(inicial[campo] ?? '');
  const error = estado?.errores ?? {};

  return (
    <form action={enviar} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <ErrorGeneral mensaje={estado?.error} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo etiqueta="Disciplina" nombre="disciplinaId" obligatorio error={error.disciplinaId}>
          <select id="disciplinaId" name="disciplinaId" required defaultValue={valor('disciplinaId')} className={claseEntrada}>
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nombre}
              </option>
            ))}
          </select>
        </Campo>

        <Campo etiqueta="Nombre del programa" nombre="nombre" obligatorio error={error.nombre}>
          <input id="nombre" name="nombre" required maxLength={80} defaultValue={valor('nombre')} className={claseEntrada} />
        </Campo>

        <Campo etiqueta="Público meta" nombre="publicoMeta" error={error.publicoMeta} ayuda="Ejemplo: niños, madres, adultos.">
          <input id="publicoMeta" name="publicoMeta" maxLength={120} defaultValue={valor('publicoMeta')} className={claseEntrada} />
        </Campo>

        <Campo etiqueta="Precio mensual (₡)" nombre="precioMensual" obligatorio error={error.precioMensual}>
          <input id="precioMensual" name="precioMensual" type="number" min={0} step={1} required defaultValue={valor('precioMensual')} className={claseEntrada} />
        </Campo>

        <Campo etiqueta="Edad mínima" nombre="edadMinima" error={error.edadMinima} ayuda="Vacío = sin límite.">
          <input id="edadMinima" name="edadMinima" type="number" min={0} max={120} defaultValue={valor('edadMinima')} className={claseEntrada} />
        </Campo>

        <Campo etiqueta="Edad máxima" nombre="edadMaxima" error={error.edadMaxima} ayuda="Vacío = sin límite.">
          <input id="edadMaxima" name="edadMaxima" type="number" min={0} max={120} defaultValue={valor('edadMaxima')} className={claseEntrada} />
        </Campo>
      </div>

      <BotonesFormulario pendiente={pendiente} volverA="/admin/disciplinas" />
    </form>
  );
}