import { obtenerUsuarioActual } from "@/lib/auth/dal";
import { notFound, redirect } from "next/navigation";

// Módulos que todavía no tienen su propia carpeta. Cualquier otro nombre da 404.
const modulosPendientes = ["reportes", "usuarios"];
const modulosSoloAdmin = ["reportes", "usuarios"];

const estadisticas = [
  { titulo: "Miembros registrados", valor: "128", cambio: "Directorio de miembros", icono: "♙" },
  { titulo: "Inscripciones", valor: "24", cambio: "Solicitudes de demostración", icono: "▤" },
  { titulo: "Próximos eventos", valor: "03", cambio: "Actividades planificadas", icono: "▣" },
  { titulo: "Pagos pendientes", valor: "12", cambio: "Registros de demostración", icono: "₡" },
];

const actividad = [
  { nombre: "María Rodríguez", accion: "Nueva inscripción", fecha: "Hoy", estado: "Pendiente" },
  { nombre: "Carlos Vargas", accion: "Actualización de miembro", fecha: "Ayer", estado: "Completado" },
  { nombre: "Andrea Morales", accion: "Inscripción a disciplina", fecha: "Ayer", estado: "En revisión" },
];

export default async function ModuloPage({
    params,
    }: {
      params: Promise<{ modulo: string }>;
    }) {
    const { modulo } = await params;
        if (!modulosPendientes.includes(modulo)) notFound();
    const usuario = await obtenerUsuarioActual();
    if (modulosSoloAdmin.includes(modulo) && usuario.rol !== "administrador") {
    redirect("/admin?error=sin-permiso");
    }
  return (
    <div className="mx-auto max-w-7xl space-y-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-700">
            CENTRO DE CONTROL
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-[#171717] sm:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Resumen general de la gestión de Luchamanía Costa Rica.
          </p>
        </div>

        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Datos de demostración
        </span>
      </header>

      <section className="relative overflow-hidden rounded-2xl bg-[#171717] p-7 text-white sm:p-9">
        <div className="relative z-10 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-400">
            LUCHAMANÍA COSTA RICA
          </p>
          <h2 className="mt-4 text-3xl font-black leading-tight sm:text-4xl">
            Disciplina, esfuerzo
            <br />
            <span className="text-yellow-400">y comunidad.</span>
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-6 text-gray-300">
            Administra la información de los miembros, organiza las disciplinas
            y mantén las actividades deportivas bajo control.
          </p>
          <a
            href="/admin/miembros"
            className="mt-6 inline-flex rounded-lg bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
          >
            Gestionar miembros <span className="ml-3">→</span>
          </a>
        </div>

        <div className="pointer-events-none absolute -right-12 -top-20 h-72 w-72 rounded-full border-[40px] border-white/[0.04]" />
        <div className="pointer-events-none absolute -bottom-36 right-24 h-72 w-72 rounded-full border-[30px] border-yellow-400/10" />
        <div className="pointer-events-none absolute right-10 top-10 hidden text-8xl font-black text-white/[0.06] lg:block">
          L
        </div>
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">Resumen de gestión</h2>
          <span className="text-xs text-gray-400">Cifras ilustrativas</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {estadisticas.map((item, index) => (
            <article
              key={item.titulo}
              className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-500">{item.titulo}</span>
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-xl text-xl ${
                    index === 0 ? "bg-yellow-100 text-yellow-800" :
                    index === 1 ? "bg-blue-50 text-blue-700" :
                    index === 2 ? "bg-purple-50 text-purple-700" :
                    "bg-orange-50 text-orange-700"
                  }`}
                >
                  {item.icono}
                </span>
              </div>
              <p className="mt-5 text-3xl font-black tracking-tight text-gray-900">
                {item.valor}
              </p>
              <p className="mt-2 text-xs text-gray-500">{item.cambio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-5 py-5">
            <div>
              <h2 className="font-bold text-gray-900">Actividad reciente</h2>
              <p className="mt-1 text-xs text-gray-500">Ejemplos de movimientos del sistema</p>
            </div>
            <span className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-semibold text-gray-600">
              Últimos registros
            </span>
          </div>

          <div className="divide-y divide-gray-100">
            {actividad.map((item) => (
              <div key={item.nombre} className="flex flex-wrap items-center gap-3 px-5 py-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 font-bold text-gray-700">
                  {item.nombre.charAt(0)}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-900">{item.nombre}</p>
                  <p className="mt-1 text-xs text-gray-500">{item.accion}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold text-gray-700">{item.estado}</span>
                  <p className="mt-1 text-xs text-gray-400">{item.fecha}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <h2 className="font-bold text-gray-900">Accesos rápidos</h2>
          <p className="mt-1 text-xs text-gray-500">Ve directamente a una sección.</p>

          <div className="mt-5 space-y-3">
            {[
              ["Registrar miembro", "/admin/miembros", "＋"],
              ["Ver inscripciones", "/admin/inscripciones", "↗"],
              ["Organizar disciplinas", "/admin/disciplinas", "◈"],
              ["Consultar reportes", "/admin/reportes", "▥"],
            ].map(([nombre, ruta, icono]) => (
              <a
                key={ruta}
                href={ruta}
                className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:border-yellow-400 hover:bg-yellow-50/50"
              >
                <span className="flex items-center gap-3 text-sm font-semibold text-gray-800">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 text-lg">
                    {icono}
                  </span>
                  {nombre}
                </span>
                <span className="text-gray-400">→</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t border-gray-200 pt-5 text-xs text-gray-400">
        Luchamanía Costa Rica · Interfaz de demostración para la PES.
      </footer>
    </div>
  );
}
