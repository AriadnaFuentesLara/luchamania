'use client';

import { useActionState } from 'react';
import { Campo, claseEntrada } from '@/components/admin/Campo';
import type { EstadoFormulario } from '@/lib/formularios';
import { cambiarContrasena } from './acciones';

export function FormularioContrasena() {
  const [estado, enviar, pendiente] = useActionState<EstadoFormulario, FormData>(cambiarContrasena, undefined);
  const error = estado?.errores ?? {};

  return (
    <form action={enviar} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      {estado?.valores?.listo && (
        <p role="status" className="rounded-lg bg-green-50 px-4 py-3 text-sm font-semibold text-green-800">
          Contraseña cambiada.
        </p>
      )}
      <Campo etiqueta="Contraseña actual" nombre="actual" obligatorio error={error.actual}>
        <input id="actual" name="actual" type="password" required autoComplete="current-password" className={claseEntrada} />
      </Campo>
      <Campo etiqueta="Nueva contraseña" nombre="nueva" obligatorio error={error.nueva} ayuda="Mínimo 12 caracteres. Una frase es más fácil de recordar.">
        <input id="nueva" name="nueva" type="password" required minLength={12} maxLength={128} autoComplete="new-password" className={claseEntrada} />
      </Campo>
      <Campo etiqueta="Repetí la nueva contraseña" nombre="confirmacion" obligatorio error={error.confirmacion}>
        <input id="confirmacion" name="confirmacion" type="password" required autoComplete="new-password" className={claseEntrada} />
      </Campo>
      <div className="flex justify-end">
        <button type="submit" disabled={pendiente} className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold uppercase tracking-wider text-black disabled:opacity-60">
          {pendiente ? "Guardando..." : "Cambiar contraseña"}
        </button>
      </div>
    </form>
  );
}