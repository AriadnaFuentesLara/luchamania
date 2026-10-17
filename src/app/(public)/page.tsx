import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <section className="flex min-h-[80vh] flex-col items-center justify-center px-6 text-center">
        <h1 className="text-5xl font-bold text-black">
          Luchamanía Costa Rica
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-gray-600">
          Sistema web para la gestión administrativa, promoción institucional
          y organización de actividades de Luchamanía Costa Rica.
        </p>

        <div className="mt-8 flex gap-4">
          <Link
            href="/disciplinas"
            className="rounded-lg bg-yellow-400 px-6 py-3 font-bold text-black"
          >
            Ver disciplinas
          </Link>

          <Link
            href="/eventos"
            className="rounded-lg border border-black px-6 py-3 font-bold text-black"
          >
            Ver eventos
          </Link>
        </div>
      </section>
    </main>
  );
}