import TarjetaDisciplina from "@/components/TarjetaDisciplina";

const disciplinas = [
  {
    nombre: "Lucha libre",
    descripcion:
      "Entrenamiento orientado al aprendizaje y práctica de lucha libre profesional.",
    horario: "Martes y jueves, 6:00 p. m.",
  },
  {
    nombre: "Acondicionamiento físico",
    descripcion:
      "Preparación física enfocada en mejorar resistencia, fuerza y condición.",
    horario: "Lunes y miércoles, 5:00 p. m.",
  },
];

export default function DisciplinasPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <h1 className="text-4xl font-bold">Disciplinas</h1>

      <p className="mt-4 text-gray-600">
        Conoce las disciplinas y sus horarios de entrenamiento.
      </p>

      <div className="mt-8 grid gap-6 md:grid-cols-2">
        {disciplinas.map((disciplina) => (
          <TarjetaDisciplina
            key={disciplina.nombre}
            nombre={disciplina.nombre}
            descripcion={disciplina.descripcion}
            horario={disciplina.horario}
          />
        ))}
      </div>
    </main>
  );
}