type TarjetaDisciplinaProps = {
  nombre: string;
  descripcion: string;
  horario: string;
};

export default function TarjetaDisciplina({
  nombre,
  descripcion,
  horario
}: 
TarjetaDisciplinaProps) {
  return (
    <div className="rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-2xl font-bold">{nombre}</h2>

      <p className="mt-3 text-gray-600">
        {descripcion}
      </p>

     <p className="mt-4 font-semibold">
        Horario: {horario}
      </p>
    </div>
  );
}