ALTER TABLE "Document"
ADD COLUMN "replacesDocumentId" TEXT,
ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN "isCurrent" BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX "Document_replacesDocumentId_idx" ON "Document"("replacesDocumentId");
CREATE INDEX "Document_isCurrent_idx" ON "Document"("isCurrent");
