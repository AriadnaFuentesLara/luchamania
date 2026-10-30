import 'server-only';
import { hash, verify } from '@node-rs/argon2';

// Parámetros mínimos recomendados por OWASP (Password Storage Cheat Sheet) para Argon2id
const OPCIONES = {
  algorithm: 2, // 2 = Argon2id
  memoryCost: 19456, // 19 MiB
  timeCost: 2,
  parallelism: 1,
} as const;

export function hashearContrasena(contrasena: string) {
  return hash(contrasena, OPCIONES);
}

export async function verificarContrasena(hashGuardado: string, contrasena: string) {
  try {
    return await verify(hashGuardado, contrasena);
  } catch {
    return false;
  }
}