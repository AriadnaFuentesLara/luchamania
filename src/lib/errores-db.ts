// Códigos de error de PostgreSQL que vale la pena explicar al usuario
// https://www.postgresql.org/docs/current/errcodes-appendix.html
function codigo(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'sqlState' in error) {
    return String((error as { sqlState: unknown }).sqlState);
  }
  return undefined;
}

// 23505: ya existe un registro con ese valor único (por ejemplo, la cédula)
export const esViolacionUnica = (error: unknown) => codigo(error) === '23505';

// 23503: el registro está relacionado con otro (por ejemplo, un programa que no existe)
export const esViolacionRelacion = (error: unknown) => codigo(error) === '23503';