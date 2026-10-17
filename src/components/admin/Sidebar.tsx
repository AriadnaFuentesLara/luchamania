
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const grupos = [
  {
    titulo: "GENERAL",
    enlaces: [
      { nombre: "Dashboard", ruta: "/admin", icono: "▦" },
    ],
  },
  {
    titulo: "GESTIÓN",
    enlaces: [
      { nombre: "Miembros", ruta: "/admin/miembros", icono: "♙" },
      { nombre: "Inscripciones", ruta: "/admin/inscripciones", icono: "▤" },
      { nombre: "Disciplinas", ruta: "/admin/disciplinas", icono: "◈" },
      { nombre: "Horarios", ruta: "/admin/horarios", icono: "◷" },
      { nombre: "Eventos", ruta: "/admin/eventos", icono: "▣" },
    ],
  },
  {
    titulo: "ADMINISTRACIÓN",
    enlaces: [
      { nombre: "Pagos", ruta: "/admin/pagos", icono: "₡" },
      { nombre: "Reportes", ruta: "/admin/reportes", icono: "▥" },
      { nombre: "Usuarios", ruta: "/admin/usuarios", icono: "♧" },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex min-h-screen w-64 shrink-0 flex-col bg-[#171717] text-white">
      <div className="border-b border-white/10 px-6 py-7">
        <Link href="/admin" className="block">
          <p className="text-xs font-bold uppercase tracking-[0.3em] text-yellow-400">
            LUCHAMANÍA
          </p>
          <h2 className="mt-2 text-xl font-black tracking-tight">
            Panel de gestión
          </h2>
          <p className="mt-1 text-xs text-gray-400">
            Costa Rica
          </p>
        </Link>
      </div>

      <nav className="flex-1 space-y-7 px-4 py-6">
        {grupos.map((grupo) => (
          <div key={grupo.titulo}>
            <p className="mb-3 px-3 text-[10px] font-bold tracking-[0.2em] text-gray-500">
              {grupo.titulo}
            </p>

            <div className="space-y-1">
              {grupo.enlaces.map((enlace) => {
                const activo =
                  enlace.ruta === "/admin"
                    ? pathname === "/admin"
                    : pathname === enlace.ruta ||
                      pathname.startsWith(`${enlace.ruta}/`);

                return (
                  <Link
                    key={enlace.ruta}
                    href={enlace.ruta}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                      activo
                        ? "bg-yellow-400 font-bold text-black shadow-lg shadow-yellow-400/10"
                        : "text-gray-300 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <span className="flex h-6 w-6 items-center justify-center text-lg">
                      {enlace.icono}
                    </span>
                    <span>{enlace.nombre}</span>
                    {activo && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-black" />
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <div className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400 font-black text-black">
            LC
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">Administración</p>
            <p className="mt-1 text-xs text-gray-400">Modo demostración</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
