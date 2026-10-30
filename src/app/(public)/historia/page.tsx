import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Historia",
  description:
    "La lucha libre llegó a Costa Rica en la década de 1960 con Víctor Hugo Ramírez, quien en 1990 fundó Luchamanía. Conozca nuestra historia, misión y valores.",
};

const valores = [
  { nombre: "Disciplina", texto: "Constancia y compromiso en la práctica deportiva." },
  { nombre: "Respeto", texto: "Trato considerado entre atletas, instructores y miembros de la comunidad." },
  { nombre: "Inclusión", texto: "Apertura a personas de distintas edades y condiciones, con programas infantiles y de zumba." },
  { nombre: "Superación", texto: "Fomento del esfuerzo personal y la mejora continua de cada miembro." },
  { nombre: "Comunidad", texto: "Compromiso con el desarrollo deportivo y social del cantón." },
];

export default function HistoriaPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
      <h1 className="font-display text-5xl font-bold uppercase sm:text-6xl">
        Nuestra <span className="bg-marca px-2">historia</span>
      </h1>

      {/* Texto base tomado del documento del proyecto. Completarlo con la reseña y las fotos que entregue la empresa. */}
      <div className="mt-8 space-y-5 text-lg leading-relaxed">
        <p>
          La lucha libre llegó a Costa Rica en la década de 1960, y su principal figura fue <strong>Víctor Hugo Ramírez</strong>.
          Con los años, ese espectáculo de máscaras, llaves y campeonatos se volvió parte de la historia deportiva del país.
        </p>
        <p>
          En <strong>1990</strong>, Víctor Hugo Ramírez fundó <strong>Luchamanía Costa Rica</strong>, en Sabana, San José, para
          enseñar lucha olímpica, artes marciales mixtas y deportes de contacto. Hoy la escuela abre sus puertas a cualquier
          persona interesada, con entrenamientos regulares, clases para niños de 5 a 13 años y un programa de zumba para
          madres de familia.
        </p>
      </div>

      <section className="mt-14 grid gap-6 sm:grid-cols-2" aria-label="Misión y visión">
        <div className="rounded-2xl bg-tinta p-6 text-white">
          <h2 className="font-display text-2xl font-bold uppercase text-marca">Misión</h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-200">
            Formar y acompañar a personas de todas las edades en la práctica de la lucha olímpica, las artes marciales mixtas y
            los deportes de contacto, brindando un espacio de entrenamiento disciplinado, seguro e inclusivo que promueva el
            desarrollo físico, personal y comunitario de sus miembros.
          </p>
        </div>
        <div className="rounded-2xl border-2 border-tinta bg-superficie p-6">
          <h2 className="font-display text-2xl font-bold uppercase">Visión</h2>
          <p className="mt-3 text-sm leading-relaxed">
            Consolidarse como un referente de la lucha libre y de los deportes de combate en Costa Rica, reconocida por la
            calidad de su formación deportiva y por su aporte social a la comunidad.
          </p>
        </div>
      </section>

      <section className="mt-14" aria-labelledby="titulo-valores">
        <h2 id="titulo-valores" className="font-display text-3xl font-bold uppercase">Nuestros valores</h2>
        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {valores.map((v) => (
            <div key={v.nombre} className="rounded-xl border border-borde bg-superficie p-5">
              <dt className="font-bold">{v.nombre}</dt>
              <dd className="mt-1 text-sm text-suave">{v.texto}</dd>
            </div>
          ))}
        </dl>
      </section>

      <p className="mt-14">
        <Link href="/inscripcion" className="rounded-lg bg-marca px-6 py-3 font-bold uppercase tracking-wide hover:bg-marca-oscuro">
          Sea parte de la historia
        </Link>
      </p>
    </div>
  );
}