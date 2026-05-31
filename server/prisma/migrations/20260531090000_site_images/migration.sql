CREATE TABLE "SiteImage" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "url" TEXT,
    "defaultUrl" TEXT NOT NULL,
    "alt" TEXT NOT NULL,
    "ratio" TEXT NOT NULL DEFAULT '',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SiteImage_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "SiteImage_key_key" ON "SiteImage"("key");
