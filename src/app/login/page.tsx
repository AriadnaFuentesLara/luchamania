import type { Metadata } from 'next';
import FormularioLogin from './FormularioLogin';

export const metadata: Metadata = {
  title: 'Iniciar sesión | Luchamanía Costa Rica',
  robots: { index: false, follow: false },
};

export default function PaginaLogin() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f5f3] px-6">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-600">
          Luchamanía Costa Rica
        </p>
        <h1 className="mt-2 text-3xl font-black">Panel administrativo</h1>
        <p className="mt-2 text-sm text-gray-500">Acceso solo para personal autorizado.</p>
        <FormularioLogin />
      </div>
    </main>
  );
}