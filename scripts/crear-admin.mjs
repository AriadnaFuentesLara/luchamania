// Crea el primer usuario administrador del panel.
// Uso: node scripts/crear-admin.mjs
import 'dotenv/config';
import { createInterface } from 'node:readline/promises';
import { stdin, stdout } from 'node:process';
import { hash } from '@node-rs/argon2';
import postgres from '@prisma/orm-postgres/runtime';
import contractJson from '../src/prisma/contract.json' with { type: 'json' };

const db = postgres({ contractJson, url: process.env.DATABASE_URL });
const consola = createInterface({ input: stdin, output: stdout });
const lineas = consola[Symbol.asyncIterator]();

async function preguntar(texto) {
  stdout.write(texto);
  const { value } = await lineas.next();
  return value ?? '';
}

try {
  const nombre = (await preguntar('Nombre: ')).trim();
  const correo = (await preguntar('Correo: ')).trim().toLowerCase();
  const contrasena = await preguntar('Contraseña (mínimo 12 caracteres): ');

  if (contrasena.length < 12) {
    throw new Error('La contraseña debe tener al menos 12 caracteres.');
  }

  const contrasenaHash = await hash(contrasena, {
    algorithm: 2, // Argon2id
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });

  const usuario = await db.orm.public.Usuario.create({
    nombre,
    correo,
    contrasenaHash,
    rol: 'administrador',
  });

  console.log(`\nAdministrador creado: ${usuario.correo} (id ${usuario.id})`);
  console.log('Por seguridad, borrá o limpiá la terminal: la contraseña quedó visible en pantalla.');
} catch (error) {
  console.error('\nNo se pudo crear el administrador:', error.message);
  process.exitCode = 1;
} finally {
  consola.close();
  await db.close();
}