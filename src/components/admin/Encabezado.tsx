import Link from "next/link";

type Props = {
  seccion: string;
  titulo: string;
  descripcion?: string;
  accion?: { texto: string; href: string };
};

export function Encabezado({ seccion, titulo, descripcion, accion }: Props) {
  return (
    <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-700">{seccion}</p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-[#171717]">{titulo}</h1>
        {descripcion && <p className="mt-2 text-sm text-gray-500">{descripcion}</p>}
      </div>
      {accion && (
        <Link
          href={accion.href}
          className="inline-flex w-fit items-center rounded-xl bg-yellow-400 px-5 py-3 text-sm font-bold text-black transition hover:bg-yellow-300"
        >
          {accion.texto}
        </Link>
      )}
    </header>
  );
}