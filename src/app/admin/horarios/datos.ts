import 'server-only';
import { db } from '@/prisma/db';

// Programas activos con el nombre de su disciplina, para el menú del formulario
export function programasParaElegir() {
  return db.orm.public.Programa.where({ activo: true })
    .select('id', 'nombre')
    .include('disciplina', (d) => d.select('nombre'))
    .orderBy((p) => p.nombre.asc())
    .all();
}