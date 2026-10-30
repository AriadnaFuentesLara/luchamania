import { ZONA } from "@/lib/formato";

const formatoDia = new Intl.DateTimeFormat("es-CR", { timeZone: ZONA, day: "numeric" });
const formatoMes = new Intl.DateTimeFormat("es-CR", { timeZone: ZONA, month: "short" });
const formatoCompleto = new Intl.DateTimeFormat("es-CR", { timeZone: ZONA, dateStyle: "full", timeStyle: "short" });

type Props = { titulo: string; descripcion: string | null; fecha: string; lugar: string };

export default function TarjetaEvento({ titulo, descripcion, fecha, lugar }: Props) {
  const instante = new Date(fecha);
  return (
    <article className="flex gap-5 rounded-2xl border border-borde bg-superficie p-5">
      <div className="flex h-20 w-20 shrink-0 flex-col items-center justify-center rounded-xl bg-tinta text-marca">
        <span className="font-display text-3xl font-bold leading-none">{formatoDia.format(instante)}</span>
        <span className="text-xs font-bold uppercase">{formatoMes.format(instante).replace(".", "")}</span>
      </div>
      <div className="min-w-0">
        <h3 className="font-display text-xl font-bold uppercase">{titulo}</h3>
        <p className="mt-1 text-sm text-suave">
          <time dateTime={fecha}>{formatoCompleto.format(instante)}</time> · {lugar}
        </p>
        {descripcion && <p className="mt-2 text-sm">{descripcion}</p>}
      </div>
    </article>
  );
}