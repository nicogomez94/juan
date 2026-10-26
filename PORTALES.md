# Portales privados de Kadima

## Funciones

- **Estudiantes:** acceso individual, cursos asignados, módulos, fechas de encuentro, enlaces HTTPS de Zoom/Meet, bibliografía privada y avance.
- **Clientes:** acceso individual vinculado a una obra social o prepaga; creación de casos de medicamentos o prótesis con pedido médico; mensajes por caso; publicación conjunta de tres cotizaciones; descarga; carga de autorización firmada; cierre por administración.
- **Administración:** alta y bloqueo de instituciones y usuarios, cambio de credenciales, asignación de cursos, gestión de módulos y bibliografía, seguimiento de casos, cotizaciones y respuestas.

## Configuración

Los portales reales requieren PostgreSQL, `DATABASE_URL`, `JWT_SECRET`, `ADMIN_USER`, `ADMIN_PASSWORD` y `PORTAL_DOCUMENT_KEY` (32 bytes expresados como 64 caracteres hexadecimales). La clave de documentos se genera con `openssl rand -hex 32`; guardarla en un gestor seguro y no cambiarla después de cargar documentos, porque se usa para descifrarlos.

Instalar dependencias y aplicar las migraciones desde `server/`:

```sh
npm ci
npx prisma migrate deploy --schema prisma/schema.prisma
npx prisma generate --schema prisma/schema.prisma
```

Después, iniciar el servidor y crear instituciones, usuarios, cursos y módulos desde el panel `/admin`. Las credenciales se entregan de forma privada a cada persona. Los documentos y textos de los casos se guardan cifrados en PostgreSQL y se descargan mediante rutas autenticadas; nunca van a `/uploads`.

Para poblar una base **local** con una institución, un estudiante, un caso y materiales completamente ficticios, ejecutar desde `server/`:

```sh
PORTAL_SEED_DEMO=true node prisma/seedPortals.js
```

La carga es idempotente y no publica contraseñas. El administrador puede asignar una nueva contraseña desde el panel para probar esos accesos.

Si falta la configuración privada, el sitio público mantiene la interfaz del portal con datos ficticios en memoria. Esos cambios se pierden al recargar la página y no se envían archivos. No usar esa instancia para información clínica real.

El catálogo de cursos y su eventual sistema de pago son independientes de la asignación de cursos del portal; la compra online sigue fuera del alcance de esta etapa.
