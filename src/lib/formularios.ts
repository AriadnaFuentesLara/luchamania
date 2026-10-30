import { z } from 'zod';

// Lo que una acción le devuelve al formulario cuando algo sale mal
// `valores` sirve para volver a llenar los campos y que no se pierda lo escrito
export type EstadoFormulario =
  | {
      error?: string;
      errores?: Record<string, string>;
      valores?: Record<string, string>;
    }
  | undefined;

// Convierte el FormData en un objeto de textos (ignora archivos)
export function leerFormulario(formData: FormData): Record<string, string> {
  const valores: Record<string, string> = {};
  for (const [clave, valor] of formData.entries()) {
    if (typeof valor === 'string' && !clave.startsWith('$')) valores[clave] = valor;
  }
  return valores;
}

// Toma los errores de zod y deja uno por campo, listo para mostrar
export function erroresDeValidacion(error: z.ZodError, valores: Record<string, string>): EstadoFormulario {
  const errores: Record<string, string> = {};
  for (const problema of error.issues) {
    const campo = String(problema.path[0] ?? 'general');
    errores[campo] ??= problema.message;
  }
  return { errores, valores };
}

// Los id llegan como texto (de la URL o del formulario): solo se aceptan enteros positivos
export function leerId(valor: unknown): number | null {
  const id = Number(valor);
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}