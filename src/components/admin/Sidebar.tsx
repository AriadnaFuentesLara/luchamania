
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cerrarSesion } from "@/app/login/acciones";

type Enlace = { nombre: string; ruta: string; icono: string; soloAdmin?: boolean };

const grupos: { titulo: string; enlaces: Enlace[] }[] = [
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
      { nombre: "Disciplinas", ruta: "/admin/disciplinas", icono: "◈", soloAdmin: true },
      { nombre: "Horarios", ruta: "/admin/horarios", icono: "◷", soloAdmin: true },
      { nombre: "Eventos", ruta: "/admin/eventos", icono: "▣" },
    ],
  },
  {
    titulo: "ADMINISTRACIÓN",
    enlaces: [
      { nombre: "Pagos", ruta: "/admin/pagos", icono: "₡" },
      { nombre: "Reportes", ruta: "/admin/reportes", icono: "▥", soloAdmin: true },
      { nombre: "Usuarios", ruta: "/admin/usuarios", icono: "♧", soloAdmin: true },
    ],
  },
];

type Props = {
  nombre: string;
  rol: "administrador" | "asistente";
};

export default function Sidebar({ nombre, rol }: Props) {
  const pathname = usePathname();

  // Esto solo esconde los enlaces. La protección real está en cada página.
  const gruposVisibles = grupos
    .map((grupo) => ({
      ...grupo,
      enlaces: grupo.enlaces.filter((e) => !e.soloAdmin || rol === "administrador"),
    }))
    .filter((grupo) => grupo.enlaces.length > 0);

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
        {gruposVisibles.map((grupo) => (
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
            {nombre.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{nombre}</p>
            <p className="mt-1 text-xs capitalize text-gray-400">{rol}</p>
          </div>
        </div>
             <Link
                 href="/admin/cuenta"
                 className="mt-3 block rounded-xl px-3 py-2 text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                  >
                 Mi cuenta
                 </Link>
                 <form action={cerrarSesion}>
                 <button
                 type="submit"
                 className="w-full rounded-xl px-3 py-2 text-left text-sm text-gray-300 transition hover:bg-white/10 hover:text-white"
                 >
            Cerrar sesión
          </button>
        </form>
      </div>
    </aside>
  );
}
