-- Create CaseOrder and migrate legacy RepairOrder rows
CREATE TABLE "CaseOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "trackingCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "phoneModel" TEXT NOT NULL,
    "designType" TEXT NOT NULL,
    "caseSlug" TEXT NOT NULL DEFAULT '',
    "caseTitle" TEXT NOT NULL DEFAULT '',
    "description" TEXT NOT NULL DEFAULT '',
    "imageUrl" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE UNIQUE INDEX "CaseOrder_trackingCode_key" ON "CaseOrder"("trackingCode");

INSERT INTO "CaseOrder" (
    "id",
    "trackingCode",
    "name",
    "phone",
    "phoneModel",
    "designType",
    "caseSlug",
    "caseTitle",
    "description",
    "imageUrl",
    "status",
    "createdAt",
    "updatedAt"
)
SELECT
    "id",
    "trackingCode",
    "name",
    "phone",
    "device",
    'custom',
    '',
    "issue",
    "description",
    "imageUrl",
    "status",
    "createdAt",
    "updatedAt"
FROM "RepairOrder";

DROP TABLE "RepairOrder";
DROP TABLE "OtpSession";
