import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Resultado de la inscripción",
  robots: { index: false },
};

// Solo se aceptan estos cuatro valores; cualquier otro texto en la dirección muestra "desconocido".
const mensajes = {
  aprobado: {
    titulo: "¡Bienvenido al ring!",
    texto: "Su pago se aprobó y su inscripción quedó activa. Tilopay le envió el comprobante al correo.",
  },
  rechazado: {
    titulo: "El pago no se aprobó",
    texto: "No se hizo ningún cobro. Puede intentarlo de nuevo con otra tarjeta o con SINPE Móvil.",
  },
  pendiente: {
    titulo: "Estamos confirmando su pago",
    texto: "Todavía no tenemos la confirmación de Tilopay. Si ya pagó, el personal lo verificará y su inscripción se activará.",
  },
  desconocido: {
    titulo: "No encontramos esa inscripción",
    texto: "Si cree que es un error, comuníquese con Luchamanía.",
  },
};

export default async function ResultadoPage({ searchParams }: { searchParams: Promise<{ estado?: string }> }) {
  const { estado } = await searchParams;
  const clave = estado && estado in mensajes ? (estado as keyof typeof mensajes) : "desconocido";
  const mensaje = mensajes[clave];

  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6">
      <h1 className="font-display text-5xl font-bold uppercase">{mensaje.titulo}</h1>
      <p className="mt-6 text-lg text-suave">{mensaje.texto}</p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        {clave === "rechazado" && (
          <Link href="/inscripcion" className="rounded-lg bg-marca px-6 py-3 font-bold uppercase tracking-wide hover:bg-marca-oscuro">
            Intentar de nuevo
          </Link>
        )}
        <Link href="/horarios" className="rounded-lg border-2 border-tinta px-6 py-3 font-bold uppercase tracking-wide">
          Ver horarios
        </Link>
      </div>
    </div>
  );
}