import 'server-only';
import { db } from '@/prisma/db';

// Consultas del sitio público. Solo devuelven lo que se puede mostrar a cualquiera:
// nunca datos de miembros ni de pagos

// Programas activos de disciplinas activas, con lo necesario para mostrarlos.
export async function programasPublicos() {
  const programas = await db.orm.public.Programa.where({ activo: true })
    .select('id', 'nombre', 'publicoMeta', 'edadMinima', 'edadMaxima', 'precioMensual', 'disciplinaId')
    .include('disciplina', (d) => d.select('nombre', 'descripcion', 'activa'))
    .orderBy((p) => p.nombre.asc())
    .all();
  return programas.filter((p) => p.disciplina?.activa);
}

// Todos los horarios de programas activos, ordenados por hora.
export async function horariosPublicos() {
  const horarios = await db.orm.public.Horario.select('id', 'dia', 'horaInicio', 'horaFin', 'lugar', 'programaId')
    .include('programa', (p) =>
      p.select('nombre', 'activo').include('disciplina', (d) => d.select('nombre', 'activa')),
    )
    .orderBy((h) => h.horaInicio.asc())
    .all();
  return horarios.filter((h) => h.programa?.activo && h.programa.disciplina?.activa);
}

// Solo eventos marcados como publicados en el panel.
export function proximosEventos(cantidad = 20) {
  return db.orm.public.Evento.where({ publicado: true })
    .where((e) => e.fecha.gte(new Date().toISOString()))
    .select('id', 'titulo', 'descripcion', 'fecha', 'lugar')
    .orderBy((e) => e.fecha.asc())
    .limit(cantidad)
    .all();
}

export function eventosAnteriores(cantidad = 6) {
  return db.orm.public.Evento.where({ publicado: true })
    .where((e) => e.fecha.lt(new Date().toISOString()))
    .select('id', 'titulo', 'descripcion', 'fecha', 'lugar')
    .orderBy((e) => e.fecha.desc())
    .limit(cantidad)
    .all();
}

// "5 a 13 años", "desde 18 años", "todas las edades"
export function rangoEdad(minima: number | null, maxima: number | null) {
  if (minima !== null && maxima !== null) return `${minima} a ${maxima} años`;
  if (minima !== null) return `Desde ${minima} años`;
  if (maxima !== null) return `Hasta ${maxima} años`;
  return 'Todas las edades';
}