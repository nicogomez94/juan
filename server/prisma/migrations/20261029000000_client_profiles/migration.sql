ALTER TABLE "ClientOrganization"
  ADD COLUMN "taxId" TEXT,
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "address" TEXT;

ALTER TABLE "PortalUser"
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "position" TEXT;

CREATE UNIQUE INDEX "ClientOrganization_taxId_key" ON "ClientOrganization"("taxId");
