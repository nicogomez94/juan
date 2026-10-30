ALTER TABLE "Equipo"
ADD COLUMN "contenido" TEXT NOT NULL DEFAULT '';

UPDATE "Equipo"
SET
  "contenido" = "descripcion",
  "descripcion" = LEFT(
    TRIM(REGEXP_REPLACE("descripcion", '<[^>]+>', ' ', 'g')),
    240
  );
