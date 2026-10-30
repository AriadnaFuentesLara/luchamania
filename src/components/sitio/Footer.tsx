import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-20 bg-tinta text-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 sm:grid-cols-3 sm:px-6">
        <div>
          <p className="font-display text-2xl font-bold uppercase">
            Luchamania <span className="bg-marca px-1.5 text-tinta">CR</span>
          </p>
          <p className="mt-3 text-sm text-gray-400">Lucha olímpica, artes marciales mixtas y deportes de contacto desde 1990.</p>
        </div>

        <div>
          <p className="font-display text-lg font-bold uppercase text-marca">Dónde estamos</p>
          <p className="mt-3 text-sm text-gray-300">Sabana, San José, Costa Rica</p>
        </div>

        <nav aria-label="Pie de página">
          <p className="font-display text-lg font-bold uppercase text-marca">El sitio</p>
          <ul className="mt-3 space-y-1.5 text-sm text-gray-300">
            <li><Link href="/disciplinas" className="hover:text-white">Disciplinas y programas</Link></li>
            <li><Link href="/horarios" className="hover:text-white">Horarios y lugares</Link></li>
            <li><Link href="/inscripcion" className="hover:text-white">Inscripción en línea</Link></li>
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap justify-between gap-2 px-4 py-4 text-xs text-gray-500 sm:px-6">
          <p>© {new Date().getFullYear()} Luchamanía Costa Rica</p>
          <Link href="/login" className="hover:text-gray-300">Acceso del personal</Link>
        </div>
      </div>
    </footer>
  );
}