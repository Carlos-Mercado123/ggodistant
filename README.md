# CGO Distancia Huancayo — Panel de Speeches

Panel administrativo para el equipo comercial: propuestas de valor de la
Universidad, de la modalidad a distancia y argumentos de venta por carrera,
cada uno con su speech comercial copiable, tags de segmentación (tipo de
cliente / objeción) y enlaces de referencia.

Reemplaza al prototipo HTML de un solo archivo (`localStorage`, sin backend
compartido) por una app Next.js con datos persistidos en SQLite compartidos
por todo el equipo, y acceso protegido por login.

## Primeros pasos

```bash
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

La base de datos (`data/app.db`) se crea y se siembra automáticamente la
primera vez que arranca el servidor, con el contenido de referencia
(`lib/seed/propuesta-valor.json`).

## Credenciales y configuración

Variables en `.env.local` (no se sube al repositorio):

- `SESSION_SECRET` — clave para firmar la sesión de login.
- `ADMIN_USERNAME` / `ADMIN_PASSWORD` — credenciales del usuario admin que se
  crea la primera vez que se siembra la base de datos. Cámbialas antes del
  primer arranque en producción.

Si necesitas reiniciar todo desde cero (perder los cambios y volver a los
datos de referencia), borra la carpeta `data/` y vuelve a arrancar el
servidor.

## Estructura

- `lib/db.ts` — conexión SQLite, esquema y siembra inicial.
- `lib/data.ts` — acceso a datos (tarjetas, carreras, tags).
- `lib/session.ts` / `lib/dal.ts` — sesión de login (cookie firmada) y
  verificación de sesión en cada acción/página.
- `app/panel/` — el panel en sí (Universidad, Modalidad, Carreras).
- `app/panel/actions.ts` — Server Actions para crear/editar/eliminar.

## Producción

```bash
npm run build
npm run start
```

Este proyecto asume un servidor Node.js persistente (no un despliegue
serverless/estático), porque la base de datos vive en el sistema de archivos
del servidor.
