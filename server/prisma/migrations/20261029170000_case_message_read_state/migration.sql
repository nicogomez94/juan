ALTER TABLE "CaseComment"
ADD COLUMN "readByClientAt" TIMESTAMP(3),
ADD COLUMN "readByKadimaAt" TIMESTAMP(3);

CREATE INDEX "CaseComment_caseId_authorRole_readByClientAt_idx"
ON "CaseComment"("caseId", "authorRole", "readByClientAt");

CREATE INDEX "CaseComment_caseId_authorRole_readByKadimaAt_idx"
ON "CaseComment"("caseId", "authorRole", "readByKadimaAt");
