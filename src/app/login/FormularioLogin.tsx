'use client';

import { useActionState } from 'react';
import { iniciarSesion } from './acciones';

export default function FormularioLogin() {
  const [estado, accion, enviando] = useActionState(iniciarSesion, undefined);

  return (
    <form action={accion} className="mt-8 space-y-5">
      <div>
        <label htmlFor="correo" className="block text-sm font-semibold text-gray-700">
          Correo
        </label>
        <input
          id="correo"
          name="correo"
          type="email"
          autoComplete="username"
          required
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
        />
      </div>

      <div>
        <label htmlFor="contrasena" className="block text-sm font-semibold text-gray-700">
          Contraseña
        </label>
        <input
          id="contrasena"
          name="contrasena"
          type="password"
          autoComplete="current-password"
          required
          className="mt-2 w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200"
        />
      </div>

      {estado?.error && (
        <p role="alert" className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {estado.error}
        </p>
      )}

      <button
        type="submit"
        disabled={enviando}
        className="w-full rounded-lg bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300 disabled:opacity-60"
      >
        {enviando ? 'Verificando...' : 'Iniciar sesión'}
      </button>
    </form>
  );
}