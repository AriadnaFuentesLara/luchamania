'use client';

import { useActionState } from 'react';
import { BotonesFormulario, Campo, claseEntrada, ErrorGeneral } from '@/components/admin/Campo';
import type { EstadoFormulario } from '@/lib/formularios';

type Inicial = { nombre: string; correo: string; rol: string; activo: boolean };

type Props = {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  inicial?: Inicial;
};

export function FormularioUsuario({ accion, inicial }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, undefined);
  const valor = (campo: 'nombre' | 'correo' | 'rol') => estado?.valores?.[campo] ?? inicial?.[campo] ?? '';
  const error = estado?.errores ?? {};
  const editando = Boolean(inicial);

  return (
    <form action={enviar} className="space-y-6 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
      <ErrorGeneral mensaje={estado?.error} />

      <div className="grid gap-6 sm:grid-cols-2">
        <Campo etiqueta="Nombre" nombre="nombre" obligatorio error={error.nombre}>
          <input id="nombre" name="nombre" required maxLength={80} defaultValue={valor('nombre')} className={claseEntrada} />
        </Campo>
        <Campo etiqueta="Correo" nombre="correo" obligatorio error={error.correo}>
          <input id="correo" name="correo" type="email" required autoComplete="off" defaultValue={valor('correo')} className={claseEntrada} />
        </Campo>
        <Campo etiqueta="Rol" nombre="rol" obligatorio error={error.rol} ayuda="El asistente no entra a disciplinas, horarios, reportes ni usuarios.">
          <select id="rol" name="rol" defaultValue={valor('rol') || 'asistente'} className={claseEntrada}>
            <option value="asistente">Asistente</option>
            <option value="administrador">Administrador</option>
          </select>
        </Campo>
        <Campo
          etiqueta={editando ? 'Nueva contraseña' : 'Contraseña temporal'}
          nombre="contrasena"
          obligatorio={!editando}
          error={error.contrasena}
          ayuda={editando ? 'Dejala vacía para no cambiarla.' : 'Mínimo 12 caracteres. La persona la cambia en "Mi cuenta".'}
        >
          <input
            id="contrasena"
            name="contrasena"
            type="password"
            autoComplete="new-password"
            required={!editando}
            minLength={12}
            maxLength={128}
            className={claseEntrada}
          />
        </Campo>
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={estado?.valores ? estado.valores.activo === 'on' : (inicial?.activo ?? true)}
          className="h-4 w-4 accent-yellow-400"
        />
        <span>
          <strong>Activo:</strong> si lo desmarcás, la persona no puede entrar y su sesión se cierra en el próximo clic.
        </span>
      </label>

      <BotonesFormulario pendiente={pendiente} volverA="/admin/usuarios" />
    </form>
  );
}