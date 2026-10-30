import 'server-only';

// Integración con Tilopay (pasarela de pago de Costa Rica).
// Documentación: https://tilopay.com/developers
// Las credenciales salen del portal de Tilopay > Integraciones y van SOLO en el .env.
// El modo prueba / producción se cambia en la cuenta de Tilopay, no en el código.

const URL_BASE = process.env.TILOPAY_URL ?? 'https://app.tilopay.com';

function credenciales() {
  const apiuser = process.env.TILOPAY_API_USER;
  const password = process.env.TILOPAY_API_PASSWORD;
  const key = process.env.TILOPAY_API_KEY;
  if (!apiuser || !password || !key) {
    throw new Error('Faltan TILOPAY_API_USER, TILOPAY_API_PASSWORD o TILOPAY_API_KEY en el .env');
  }
  return { apiuser, password, key };
}

// El token dura 24 h; se guarda en memoria y se pide otro un rato antes de que venza.
let tokenGuardado: { valor: string; venceEn: number } | undefined;

async function obtenerToken() {
  if (tokenGuardado && tokenGuardado.venceEn > Date.now()) return tokenGuardado.valor;
  const { apiuser, password } = credenciales();
  const respuesta = await fetch(`${URL_BASE}/api/v1/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ apiuser, password }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!respuesta.ok) throw new Error(`Tilopay rechazó el inicio de sesión (${respuesta.status}).`);
  const datos = (await respuesta.json()) as { access_token: string; expires_in: number };
  tokenGuardado = { valor: datos.access_token, venceEn: Date.now() + (datos.expires_in - 300) * 1000 };
  return datos.access_token;
}

async function llamar<T>(ruta: string, cuerpo: Record<string, unknown>): Promise<T> {
  const respuesta = await fetch(`${URL_BASE}${ruta}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      Authorization: `bearer ${await obtenerToken()}`,
    },
    body: JSON.stringify({ key: credenciales().key, ...cuerpo }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!respuesta.ok) throw new Error(`Tilopay respondió ${respuesta.status} en ${ruta}.`);
  return (await respuesta.json()) as T;
}

type DatosCobro = {
  orden: string;
  monto: string;
  nombre: string;
  apellidos: string;
  correo: string;
  telefono: string;
  urlRetorno: string;
};

// Crea el cobro y devuelve la dirección de la página de pago de Tilopay.
// La tarjeta se escribe en la página de Tilopay: este sistema nunca la ve (PCI DSS).
export async function crearCobro(cobro: DatosCobro) {
  const datos = await llamar<{ type: string | number; url?: string; message?: string }>('/api/v1/processPayment', {
    amount: Number(cobro.monto).toFixed(2),
    currency: 'CRC',
    orderNumber: cobro.orden,
    redirect: cobro.urlRetorno,
    capture: '1',
    subscription: '0',
    platform: 'api',
    billToFirstName: cobro.nombre,
    billToLastName: cobro.apellidos,
    billToEmail: cobro.correo,
    billToTelephone: cobro.telefono,
    billToAddress: 'San José',
    billToAddress2: '',
    billToCity: 'San José',
    billToState: 'SJ',
    billToZipPostCode: '10101',
    billToCountry: 'CR',
  });
  if (!datos.url) throw new Error(`Tilopay no creó el cobro: ${datos.message ?? datos.type}`);
  return datos.url;
}

export type ResultadoOrden = { aprobado: boolean; monto: number; moneda: string };

// Pregunta a Tilopay, servidor a servidor, cómo terminó una orden.
// Es la ÚNICA fuente de verdad: los datos que vienen en la dirección de retorno
// (code=1, etc.) los puede escribir cualquiera, así que no se usan para aprobar.
export async function consultarOrden(orden: string): Promise<ResultadoOrden | null> {
  const datos = await llamar<{ response?: { orderNumber: string; code: string; amount: string; currency: string }[] }>(
    '/api/v1/consult',
    { orderNumber: orden },
  );
  const transaccion = datos.response?.find((t) => t.orderNumber === orden);
  if (!transaccion) return null;
  return {
    aprobado: String(transaccion.code) === '1',
    monto: Number(transaccion.amount),
    moneda: transaccion.currency,
  };
}