'use client';

import { useActionState, useState } from 'react';
import { BotonesFormulario, Campo, claseEntrada, ErrorGeneral } from '@/components/admin/Campo';
import { calcularEdad } from '@/lib/formato';
import type { EstadoFormulario } from '@/lib/formularios';

type Inicial = {
  cedula: string;
  nombre: string;
  apellidos: string;
  fechaNacimiento: string;
  telefono: string | null;
  correo: string | null;
  encargadoNombre: string | null;
  encargadoTelefono: string | null;
  consentimientoDatos: boolean;
};

type Props = {
  accion: (estado: EstadoFormulario, formData: FormData) => Promise<EstadoFormulario>;
  inicial?: Inicial;
};

export function FormularioMiembro({ accion, inicial }: Props) {
  const [estado, enviar, pendiente] = useActionState(accion, undefined);
  const valor = (campo: Exclude<keyof Inicial, 'consentimientoDatos'>) =>
    estado?.valores?.[campo] ?? inicial?.[campo] ?? '';
  const error = estado?.errores ?? {};

  // Se recalcula al cambiar la fecha, para mostrar u ocultar los datos del encargado.
  const [nacimiento, setNacimiento] = useState(valor('fechaNacimiento'));
  const esMenor = /^\d{4}-\d{2}-\d{2}$/.test(nacimiento) && calcularEdad(nacimiento) < 18;

  return (
    <form action={enviar} className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-8 rounded-2xl border border-gray-200 bg-white p-6 sm:p-8">
        <ErrorGeneral mensaje={estado?.error} />

        <section>
          <h2 className="text-lg font-black uppercase">Datos personales</h2>
          <p className="mt-1 text-sm text-gray-500">Los campos con * son obligatorios.</p>

          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <Campo etiqueta="Cédula" nombre="cedula" obligatorio error={error.cedula} ayuda="Con guiones: 1-2345-6789">
              <input id="cedula" name="cedula" required maxLength={12} defaultValue={valor('cedula')} className={claseEntrada} />
            </Campo>
            <Campo etiqueta="Fecha de nacimiento" nombre="fechaNacimiento" obligatorio error={error.fechaNacimiento}>
              <input
                id="fechaNacimiento"
                name="fechaNacimiento"
                type="date"
                required
                defaultValue={valor('fechaNacimiento')}
                onChange={(e) => setNacimiento(e.target.value)}
                className={claseEntrada}
              />
            </Campo>
            <Campo etiqueta="Nombre" nombre="nombre" obligatorio error={error.nombre}>
              <input id="nombre" name="nombre" required maxLength={80} defaultValue={valor('nombre')} className={claseEntrada} />
            </Campo>
            <Campo etiqueta="Apellidos" nombre="apellidos" obligatorio error={error.apellidos}>
              <input id="apellidos" name="apellidos" required maxLength={120} defaultValue={valor('apellidos')} className={claseEntrada} />
            </Campo>
            <Campo etiqueta="Teléfono" nombre="telefono" error={error.telefono}>
              <input id="telefono" name="telefono" type="tel" maxLength={9} defaultValue={valor('telefono')} className={claseEntrada} />
            </Campo>
            <Campo etiqueta="Correo" nombre="correo" error={error.correo}>
              <input id="correo" name="correo" type="email" maxLength={120} defaultValue={valor('correo')} className={claseEntrada} />
            </Campo>
          </div>
        </section>

        {esMenor && (
          <section>
            <h2 className="flex items-center gap-3 text-lg font-black uppercase">
              Persona encargada
              <span className="rounded-full bg-black px-3 py-1 text-xs font-bold normal-case text-yellow-400">Menor de edad</span>
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2">
              <Campo etiqueta="Nombre del encargado" nombre="encargadoNombre" obligatorio error={error.encargadoNombre}>
                <input id="encargadoNombre" name="encargadoNombre" required maxLength={120} defaultValue={valor('encargadoNombre')} className={claseEntrada} />
              </Campo>
              <Campo etiqueta="Teléfono del encargado" nombre="encargadoTelefono" obligatorio error={error.encargadoTelefono}>
                <input id="encargadoTelefono" name="encargadoTelefono" type="tel" required maxLength={9} defaultValue={valor('encargadoTelefono')} className={claseEntrada} />
              </Campo>
            </div>
          </section>
        )}
      </div>

      <div className="space-y-6">
        <section className="rounded-2xl border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-black uppercase">Consentimiento</h2>
          <label className="mt-4 flex items-start gap-3 text-sm text-gray-700">
            <input
              type="checkbox"
              name="consentimientoDatos"
              defaultChecked={estado?.valores ? estado.valores.consentimientoDatos === 'on' : inicial?.consentimientoDatos}
              className="mt-1 h-4 w-4 accent-yellow-400"
            />
            La persona (o su encargado) autoriza el uso de sus datos personales para la gestión de su membresía, según la
            Ley 8968.
          </label>
          {error.consentimientoDatos && <p className="mt-2 text-xs font-semibold text-red-700">{error.consentimientoDatos}</p>}
        </section>

        <BotonesFormulario pendiente={pendiente} volverA="/admin/miembros" />
      </div>
    </form>
  );
}