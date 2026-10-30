import { z } from 'zod';
import { calcularEdad, hoyEnCostaRica } from './formato';

// Reglas de los datos de un miembro. Las usan el panel (miembros) y la inscripción en línea,
// así las dos puertas de entrada validan exactamente lo mismo.

// Texto opcional: vacío se guarda como null.
const opcional = (maximo: number) =>
  z.string().trim().max(maximo, `Máximo ${maximo} caracteres.`).transform((t) => t || null);

// Teléfono de Costa Rica: 8 dígitos. Se guarda siempre como 8888-8888.
const telefono = z
  .string()
  .trim()
  .transform((t) => t.replace(/\D/g, ''))
  .refine((t) => t === '' || /^\d{8}$/.test(t), 'Debe tener 8 dígitos.')
  .transform((t) => (t ? `${t.slice(0, 4)}-${t.slice(4)}` : null));

const camposMiembro = z.object({
  // Cédula física (1-2345-6789) o DIMEX (11 o 12 dígitos).
  cedula: z
    .string()
    .trim()
    .regex(/^(\d-\d{4}-\d{4}|\d{11,12})$/, 'Formato: 1-2345-6789, o DIMEX de 11 o 12 dígitos.'),
  nombre: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(80, 'Máximo 80 caracteres.'),
  apellidos: z.string().trim().min(2, 'Mínimo 2 caracteres.').max(120, 'Máximo 120 caracteres.'),
  fechaNacimiento: z.iso.date('Fecha no válida.'),
  telefono,
  correo: z
    .string()
    .trim()
    .toLowerCase()
    .refine((t) => t === '' || z.email().safeParse(t).success, 'Correo no válido.')
    .transform((t) => t || null),
  encargadoNombre: opcional(120),
  encargadoTelefono: telefono,
  // Ley 8968: sin consentimiento no se guardan datos personales.
  consentimientoDatos: z.literal(true, 'Se necesita el consentimiento para registrar los datos.'),
});

type DatosMiembro = z.infer<typeof camposMiembro>;

function reglasMiembro(m: DatosMiembro, ctx: z.RefinementCtx) {
  if (m.fechaNacimiento > hoyEnCostaRica() || m.fechaNacimiento < '1900-01-01') {
    ctx.addIssue({ code: 'custom', path: ['fechaNacimiento'], message: 'Fecha de nacimiento no válida.' });
    return;
  }
  // Las personas menores de edad necesitan una persona encargada.
  if (calcularEdad(m.fechaNacimiento) < 18) {
    if (!m.encargadoNombre) {
      ctx.addIssue({ code: 'custom', path: ['encargadoNombre'], message: 'Obligatorio para menores de edad.' });
    }
    if (!m.encargadoTelefono) {
      ctx.addIssue({ code: 'custom', path: ['encargadoTelefono'], message: 'Obligatorio para menores de edad.' });
    }
  }
}

// Panel: correo y teléfono son opcionales (hay miembros sin correo).
export const esquemaMiembro = camposMiembro.superRefine(reglasMiembro);

// Sitio público: el correo es obligatorio (Tilopay manda ahí el comprobante) y hace falta
// un teléfono para contactar a la persona: el suyo o, si es menor, el de su encargado.
export const esquemaInscripcionEnLinea = camposMiembro
  .extend({
    programaId: z.coerce.number('Elija un programa.').int('Elija un programa.').positive('Elija un programa.'),
    correo: z.email('Correo no válido.').trim().toLowerCase().max(120, 'Máximo 120 caracteres.'),
  })
  .superRefine((m, ctx) => {
    reglasMiembro(m, ctx);
    if (!m.telefono && calcularEdad(m.fechaNacimiento) >= 18) {
      ctx.addIssue({ code: 'custom', path: ['telefono'], message: 'Escriba un teléfono de 8 dígitos.' });
    }
  });