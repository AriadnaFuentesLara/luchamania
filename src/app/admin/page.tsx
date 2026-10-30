
import Link from "next/link";
import { obtenerUsuarioActual } from "@/lib/auth/dal";

const estadisticas = [
  {
    titulo: "Miembros activos",
    valor: "128",
    detalle: "Personas registradas",
    icono: "01",
  },
  {
    titulo: "Inscripciones",
    valor: "24",
    detalle: "En proceso de gestión",
    icono: "02",
  },
  {
    titulo: "Próximos eventos",
    valor: "03",
    detalle: "Actividades programadas",
    icono: "03",
  },
  {
    titulo: "Pagos pendientes",
    valor: "12",
    detalle: "Requieren revisión",
    icono: "04",
  },
];

const accesos = [
  {
    titulo: "Gestionar miembros",
    descripcion: "Consultar y administrar los miembros.",
    href: "/admin/miembros",
    numero: "01",
  },
  {
    titulo: "Inscripciones",
    descripcion: "Revisar las inscripciones registradas.",
    href: "/admin/inscripciones",
    numero: "02",
  },
  {
    titulo: "Disciplinas y horarios",
    descripcion: "Organizar disciplinas y entrenamientos.",
    href: "/admin/disciplinas",
    numero: "03",
  },
  {
    titulo: "Reportes",
    descripcion: "Consultar información administrativa.",
    href: "/admin/reportes",
    numero: "04",
  },
];

export default async function AdminPage({
  searchParams,
    }: {
      searchParams: Promise<{ error?: string }>;
    }) {
  await obtenerUsuarioActual();
  const { error } = await searchParams;
  return (
    <div className="min-h-screen bg-[#f5f5f3] text-[#171717]">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-black/10 bg-white px-6 py-5 md:px-10">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-yellow-600">
            LUCHAMANÍA COSTA RICA
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">
            Panel administrativo
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
          <span className="text-sm text-gray-500">
            Entorno de demostración
          </span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8 md:px-10 md:py-10">
                {error === "sin-permiso" && (
                 <p role="alert" className="mb-6 rounded-xl bg-red-50 px-5 py-4 text-sm font-semibold text-red-700">
                 Tu rol no tiene permiso para entrar a esa sección.
                </p>
                  )}
        <section className="relative overflow-hidden rounded-3xl bg-[#171717] p-7 text-white md:p-10">
          <div className="absolute -right-12 -top-20 h-64 w-64 rounded-full border-[35px] border-yellow-400/10" />
          <div className="absolute -bottom-24 right-32 h-48 w-48 rounded-full bg-yellow-400/10 blur-2xl" />

          <div className="relative max-w-2xl">
            <span className="inline-block rounded-full bg-yellow-400 px-3 py-1 text-xs font-black uppercase tracking-wider text-black">
              Centro de control
            </span>

            <h2 className="mt-5 text-3xl font-black leading-tight md:text-5xl">
              Todo Luchamanía.
              <br />
              <span className="text-yellow-400">En un solo lugar.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-6 text-gray-300 md:text-base">
              Administrá miembros, inscripciones, entrenamientos, eventos y
              pagos desde una sola plataforma.
            </p>

            <Link
              href="/admin/miembros"
              className="mt-7 inline-flex items-center gap-3 rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black transition hover:bg-yellow-300"
            >
              Gestionar miembros <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>

        <section className="mt-9">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-2">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
                Resumen general
              </p>
              <h2 className="mt-1 text-xl font-black">Estado del sistema</h2>
            </div>
            <p className="text-xs text-gray-500">
              Datos ilustrativos para la presentación
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {estadisticas.map((item) => (
              <article
                key={item.titulo}
                className="rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">
                    {item.titulo}
                  </span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-yellow-100 text-xs font-black text-yellow-800">
                    {item.icono}
                  </span>
                </div>
                <p className="mt-5 text-4xl font-black tracking-tight">
                  {item.valor}
                </p>
                <p className="mt-2 text-sm text-gray-500">{item.detalle}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500">
              Accesos directos
            </p>
            <h2 className="mt-1 text-xl font-black">Gestión administrativa</h2>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {accesos.map((item) => (
              <Link
                key={item.numero}
                href={item.href}
                className="group flex items-center gap-5 rounded-2xl border border-black/5 bg-white p-5 shadow-sm transition hover:border-yellow-400 hover:shadow-md"
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#171717] text-sm font-black text-yellow-400 transition group-hover:bg-yellow-400 group-hover:text-black">
                  {item.numero}
                </span>

                <div className="min-w-0 flex-1">
                  <h3 className="font-bold">{item.titulo}</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {item.descripcion}
                  </p>
                </div>

                <span className="text-xl text-gray-400 transition group-hover:translate-x-1 group-hover:text-black">
                  →
                </span>
              </Link>
            ))}
          </div>
        </section>

        <footer className="mt-10 border-t border-black/10 py-5 text-xs text-gray-500">
          Luchamanía Costa Rica · Sistema de gestión administrativa · Versión
          de demostración
        </footer>
      </main>
    </div>
  );
}
