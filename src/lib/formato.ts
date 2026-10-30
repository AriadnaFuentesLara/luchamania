// Todo el sistema muestra fechas y horas en la zona horaria de Costa Rica
export const ZONA = 'America/Costa_Rica';

export const DIAS = [
  { valor: 'lunes', nombre: 'Lunes' },
  { valor: 'martes', nombre: 'Martes' },
  { valor: 'miercoles', nombre: 'Miércoles' },
  { valor: 'jueves', nombre: 'Jueves' },
  { valor: 'viernes', nombre: 'Viernes' },
  { valor: 'sabado', nombre: 'Sábado' },
  { valor: 'domingo', nombre: 'Domingo' },
] as const;

export type Dia = (typeof DIAS)[number]['valor'];

export function colones(monto: string | number) {
  return new Intl.NumberFormat('es-CR', {
    style: 'currency',
    currency: 'CRC',
    maximumFractionDigits: 0,
  }).format(Number(monto));
}

// "2015-03-14" -> "14/03/2015"
export function fechaCorta(fecha: string) {
  const [anio, mes, dia] = fecha.slice(0, 10).split('-');
  return `${dia}/${mes}/${anio}`;
}

// "17:00:00" -> "17:00"
export function hora(texto: string) {
  return texto.slice(0, 5);
}

// Fecha de hoy en Costa Rica, como "2026-10-30"
export function hoyEnCostaRica() {
  return new Intl.DateTimeFormat('en-CA', { timeZone: ZONA }).format(new Date());
}

export function calcularEdad(fechaNacimiento: string, hoy = hoyEnCostaRica()) {
  const edad = Number(hoy.slice(0, 4)) - Number(fechaNacimiento.slice(0, 4));
  // Si todavía no llegó el cumpleaños de este año, tiene un año menos.
  return hoy.slice(5, 10) < fechaNacimiento.slice(5, 10) ? edad - 1 : edad;
}

// Separa un instante guardado en la base en fecha y hora de Costa Rica,
// para llenar los campos <input type="date"> y <input type="time">
export function partesFechaHora(instante: string) {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: ZONA,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(instante));
  const valor = (tipo: string) => partes.find((p) => p.type === tipo)?.value ?? '';
  return {
    fecha: `${valor('year')}-${valor('month')}-${valor('day')}`,
    hora: `${valor('hour')}:${valor('minute')}`,
  };
}

// Une fecha y hora escritas en Costa Rica (UTC-6, sin horario de verano) en un instante
export function instanteCostaRica(fecha: string, horaTexto: string) {
  return new Date(`${fecha}T${horaTexto}:00-06:00`).toISOString();
}

export function fechaLarga(instante: string) {
  return new Intl.DateTimeFormat('es-CR', {
    timeZone: ZONA,
    dateStyle: 'full',
    timeStyle: 'short',
  }).format(new Date(instante));
}