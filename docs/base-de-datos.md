
Base de datos de Luchamanía Costa Rica
Documentación técnica de la base de datos del sistema web de gestión administrativa de Luchamanía Costa Rica: diseño, seguridad, reglas de integridad, pruebas y puesta en marcha.

1. Tecnología
Motor: PostgreSQL 18.
ORM: Prisma 8 (@prisma/orm-postgres). El diseño de la base está en src/prisma/contract.prisma. Los archivos contract.json y contract.d.ts se generan con npx prisma contract emit y no se editan a mano.
Migraciones: carpeta migrations/, generada por Prisma. Registra qué versión del diseño tiene la base.
Conexiones:
prisma.config.ts (comandos de Prisma: crear o modificar tablas) usa DATABASE_URL_MIGRACIONES.
src/prisma/db.ts (la página web) usa DATABASE_URL.
Convención de nombres: en el código, camelCase (fechaNacimiento); en la base, snake_case (fecha_nacimiento), mediante @map y @@map.
2. Diagrama entidad-relación
erDiagram
  DISCIPLINA  ||--o{ PROGRAMA    : "tiene"
  PROGRAMA    ||--o{ HORARIO     : "se imparte en"
  MIEMBRO     ||--o{ INSCRIPCION : "realiza"
  PROGRAMA    ||--o{ INSCRIPCION : "recibe"
  MIEMBRO     ||--o{ MEMBRESIA   : "tiene"
  MIEMBRO     ||--o{ PAGO        : "realiza"
  INSCRIPCION |o--o{ PAGO        : "se paga con"
  USUARIO     |o--o{ PAGO        : "registra"

  DISCIPLINA {
    int id PK
    text nombre UK
    boolean activa
  }
  PROGRAMA {
    int id PK
    int disciplina_id FK
    text nombre
    int edad_minima
    int edad_maxima
    numeric precio_mensual
    boolean activo
  }
  HORARIO {
    int id PK
    int programa_id FK
    text dia_semana
    time hora_inicio
    time hora_fin
    text lugar
  }
  MIEMBRO {
    int id PK
    text cedula UK
    text nombre
    text apellidos
    date fecha_nacimiento
    boolean consentimiento_datos
    boolean activo
  }
  INSCRIPCION {
    int id PK
    int miembro_id FK
    int programa_id FK
    date fecha_inscripcion
    boolean activa
  }
  MEMBRESIA {
    int id PK
    int miembro_id FK
    text estado
    date fecha_inicio
    date fecha_vencimiento
  }
  PAGO {
    int id PK
    int miembro_id FK
    int inscripcion_id FK
    int registrado_por_id FK
    numeric monto
    text metodo_pago
    text estado
    text referencia_tilopay UK
  }
  USUARIO {
    int id PK
    text correo UK
    text contrasena_hash
    text rol
    boolean activo
    int intentos_fallidos
  }
  EVENTO {
    int id PK
    text titulo
    timestamptz fecha
    text lugar
    boolean publicado
  }
El diagrama muestra solo las columnas principales. El detalle completo está en src/prisma/contract.prisma y en el diccionario de datos del documento de la PES.

Lectura de las relaciones: ||--o{ significa "uno a cero o muchos" (una disciplina tiene cero o muchos programas). |o--o{ significa que la relación es opcional del lado del padre: un pago puede no estar asociado a una inscripción ni al usuario que lo registró.

3. Tablas
disciplina: deportes que ofrece el gimnasio (por ejemplo, lucha olímpica o MMA). No se borran: se desactivan con activa.
programa: grupos dentro de una disciplina (por ejemplo, "Niños de 5 a 13 años"), con público meta, rango de edad y precio mensual en colones.
horario: días, horas y lugar en que se imparte cada programa. Si se elimina un programa, sus horarios se eliminan con él.
miembro: personas inscritas en el gimnasio. Para menores de edad guarda el nombre y teléfono de la persona encargada.
inscripcion: relación entre un miembro y un programa (un miembro puede estar en varios programas y un programa tiene muchos miembros).
membresia: periodo de vigencia de un miembro, con estado activa, vencida o suspendida.
pago: pagos de los miembros, con monto, método (tilopay, sinpe, efectivo, transferencia), estado (pendiente, aprobado, rechazado), referencia de Tilopay y el usuario del personal que lo registró.
usuario: personal que accede al panel administrativo, con rol administrador o asistente.
evento: actividades de Luchamanía. Solo aparecen en la página pública cuando publicado es verdadero.
Todas las tablas, excepto horario, inscripcion y membresia, tienen las columnas de auditoría creado_en y actualizado_en. inscripcion tiene solo creado_en.

4. Seguridad
La base aplica defensa en profundidad: varias capas de protección independientes, de modo que si una falla, las demás siguen protegiendo los datos.

4.1 Usuarios de base de datos (mínimo privilegio)
Usuario	Uso	Permisos
postgres	Solo administración del servidor	Superusuario. Nunca se usa en el proyecto.
luchamania_owner	Crear y modificar tablas (migraciones)	Dueño de la base y del esquema public.
luchamania_app	Conexión de la página web	Solo SELECT, INSERT, UPDATE y DELETE sobre las tablas.
Se revocaron los permisos por defecto de PUBLIC sobre la base y el esquema public, de modo que ningún otro usuario del servidor puede conectarse ni crear objetos.
Los permisos de luchamania_app se otorgan con ALTER DEFAULT PRIVILEGES, por lo que cada tabla nueva que cree el owner queda disponible para la app sin pasos manuales.
Ninguno de los dos usuarios es superusuario ni puede crear bases de datos o roles.
Si una vulnerabilidad de la página fuera explotada, el atacante quedaría limitado a los permisos de luchamania_app: no podría borrar tablas, crear usuarios ni acceder a otras bases del servidor.
Referencias: OWASP Database Security Cheat Sheet; CIS PostgreSQL Benchmark.

4.2 Contraseñas y datos sensibles
Contraseñas de la base: PostgreSQL las guarda con scram-sha-256 (RFC 7677). Se configuran en el archivo .env, que está excluido de Git mediante .gitignore.
Contraseñas del personal: la tabla usuario no guarda contraseñas, sino su hash (contrasena_hash) generado con Argon2id, el algoritmo recomendado por OWASP Password Storage Cheat Sheet.
Bloqueo por intentos fallidos: intentos_fallidos y bloqueado_hasta permiten bloquear temporalmente una cuenta ante ataques de fuerza bruta (OWASP Authentication Cheat Sheet).
Rol por defecto seguro: un usuario nuevo es asistente salvo que se indique lo contrario (secure by default).
Datos de tarjeta: el sistema no guarda números de tarjeta, fechas de vencimiento ni CVV. Los pagos con tarjeta los procesa Tilopay, y la base solo guarda la referencia de la transacción (referencia_tilopay). Esto reduce el alcance del estándar PCI DSS.
Consultas parametrizadas: Prisma construye las consultas SQL de forma parametrizada, lo que previene la inyección SQL.
4.3 Protección de datos personales (Ley 8968)
La Ley 8968, de Protección de la Persona frente al Tratamiento de sus Datos Personales, exige el consentimiento informado de la persona titular de los datos.

Consentimiento obligatorio: la regla miembro_consentimiento_obligatorio impide guardar un miembro si consentimiento_datos no es verdadero. La regla vive en la base de datos, así que no depende solo de la página.
Menores de edad: el programa infantil atiende a personas de 5 a 13 años. Para ellas, el consentimiento lo otorga el padre, la madre o la persona encargada, cuyos datos de contacto se guardan en encargado_nombre y encargado_telefono.
Minimización de datos: solo se guardan los datos necesarios para la gestión del gimnasio. No se guardan dirección exacta, datos médicos ni datos de tarjeta.
Borrado lógico: miembros, disciplinas, programas y usuarios se desactivan en lugar de borrarse, para conservar el historial de inscripciones y pagos.
5. Reglas de integridad
Las reglas están en la base de datos, de modo que se cumplen aunque los datos se ingresen por un medio distinto a la página.

Tabla	Regla	Qué evita
disciplina	disciplina_nombre_largo	Nombres vacíos, de solo espacios o de más de 80 caracteres.
programa	@@unique([disciplinaId, nombre])	Dos programas con el mismo nombre en la misma disciplina.
programa	programa_precio_no_negativo	Precios negativos (se permite 0 para programas gratuitos).
programa	programa_edad_minima_valida	Edades mínimas negativas.
programa	programa_rango_edad	Que la edad mínima sea mayor que la máxima.
usuario	usuario_correo_minusculas	Correos duplicados que solo difieren en mayúsculas.
usuario	usuario_correo_formato	Correos sin el formato básico algo@dominio.ext.
usuario	usuario_intentos_no_negativos	Contadores de intentos fallidos negativos.
miembro	miembro_consentimiento_obligatorio	Guardar datos personales sin consentimiento (Ley 8968).
miembro	miembro_fecha_nacimiento_valida	Fechas de nacimiento anteriores a 1900 (errores de digitación).
horario	horario_horas_validas	Clases que terminan antes de empezar.
inscripcion	@@unique([miembroId, programaId])	Inscribir dos veces al mismo miembro en el mismo programa.
membresia	membresia_fechas_validas	Membresías que vencen antes de empezar.
pago	pago_monto_positivo	Pagos de cero o negativos.
Además:

Las columnas de tipo enum (rol, estado, metodo_pago, dia_semana) tienen una regla generada automáticamente por Prisma que rechaza cualquier valor fuera de la lista.
Las llaves foráneas usan onDelete: Restrict (no se puede borrar un registro que tiene otros asociados), salvo horario (Cascade) y las relaciones opcionales de pago (SetNull).
Hay índices en las columnas que se consultan con frecuencia: programa.disciplina_id, horario.programa_id, inscripcion.programa_id, membresia.miembro_id, pago.miembro_id y evento (publicado, fecha).
6. Pruebas realizadas
Pruebas ejecutadas en pgAdmin con el usuario luchamania_app, el mismo que usa la página.

#	Prueba	Resultado esperado	Resultado obtenido
A1	DROP TABLE pago	Rechazado	must be owner of table pago
A2	CREATE TABLE prueba	Rechazado	permission denied for schema public
A3	Leer prisma_contract.marker	Rechazado	permission denied for schema prisma_contract
B1	Insertar una disciplina válida	Aceptado	INSERT 0 1
C1	Disciplina con nombre de solo espacios	Rechazado	Viola disciplina_nombre_largo
C2	Programa con precio −1000	Rechazado	Viola programa_precio_no_negativo
C3	Miembro sin consentimiento	Rechazado	Viola miembro_consentimiento_obligatorio
C4	Usuario con correo en mayúsculas	Rechazado	Viola usuario_correo_minusculas
C5	Pago con método bitcoin	Rechazado	Viola pago_metodo_pago_check
7. Cómo crear la base desde cero
No escribir contraseñas reales en este archivo ni en ningún archivo del repositorio.

Crear los usuarios y la base (pgAdmin, Query Tool sobre la base postgres, como superusuario):
CREATE ROLE luchamania_owner LOGIN PASSWORD '<clave-owner>';
CREATE ROLE luchamania_app   LOGIN PASSWORD '<clave-app>';
CREATE DATABASE luchamania OWNER luchamania_owner;
REVOKE ALL ON DATABASE luchamania FROM PUBLIC;
GRANT CONNECT ON DATABASE luchamania TO luchamania_app;
Configurar el esquema (Query Tool sobre la base luchamania):
REVOKE ALL ON SCHEMA public FROM PUBLIC;
ALTER SCHEMA public OWNER TO luchamania_owner;
GRANT USAGE ON SCHEMA public TO luchamania_app;
ALTER DEFAULT PRIVILEGES FOR ROLE luchamania_owner IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO luchamania_app;
ALTER DEFAULT PRIVILEGES FOR ROLE luchamania_owner IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO luchamania_app;
Crear el archivo .env en la carpeta principal (tomar .env.example como plantilla):
DATABASE_URL="postgresql://luchamania_app:<clave-app>@localhost:5432/luchamania"
DATABASE_URL_MIGRACIONES="postgresql://luchamania_owner:<clave-owner>@localhost:5432/luchamania"
Las claves deben tener solo letras y números, para no romper la URL de conexión.
Crear las tablas:
npm install
npx prisma contract emit
npx prisma db init
Verificar en pgAdmin que existen las 9 tablas en luchamania → Schemas → public → Tables.
