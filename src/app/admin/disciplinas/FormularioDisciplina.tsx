'use client';

import { useActionState } from 'react';
import { BotonesFormulario, Campo, claseEntrada, ErrorGeneral } from '@/components/admin/Campo';
import type { EstadoFormulario } from '@/lib/formularios';

type Props = {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  inicial?: { nombre: string; descripcion: string | null };
};

export function FormularioDisciplina({ accion, inicial }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, undefined);
  // Si hubo un error, se muestra lo que la persona escribió; si no, lo que ya estaba guardado
  const valor = (campo: 'nombre' | 'descripcion') => estado?.valores?.[campo] ?? inicial?.[campo] ?? '';

  return (
    <form action={enviar} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <ErrorGeneral mensaje={estado?.error} />

      <Campo etiqueta="Nombre" nombre="nombre" obligatorio error={estado?.errores?.nombre}>
        <input id="nombre" name="nombre" required maxLength={80} defaultValue={valor('nombre')} className={claseEntrada} />
      </Campo>

      <Campo etiqueta="Descripción" nombre="descripcion" error={estado?.errores?.descripcion}>
        <textarea id="descripcion" name="descripcion" rows={4} maxLength={500} defaultValue={valor('descripcion')} className={claseEntrada} />
      </Campo>

      <BotonesFormulario pendiente={pendiente} volverA="/admin/disciplinas" />
    </form>
  );
}