import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="flex items-center gap-6 bg-black px-6 py-4 text-white">
      <p className="font-bold">Luchamanía</p>

      <Link href="/">Inicio</Link>
      <Link href="/historia">Historia</Link>
      <Link href="/disciplinas">Disciplinas</Link>
      <Link href="/eventos">Eventos</Link>
    </nav>
  );
}