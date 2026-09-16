-- CreateEnum
CREATE TYPE "HsnSacKind" AS ENUM ('HSN', 'SAC');

-- CreateTable
CREATE TABLE "HsnSacCode" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "code" TEXT NOT NULL,
    "kind" "HsnSacKind" NOT NULL,
    "description" TEXT NOT NULL,
    "defaultRatePercent" DECIMAL(7,4) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HsnSacCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HsnSacCode_organizationId_kind_isActive_idx" ON "HsnSacCode"("organizationId", "kind", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "HsnSacCode_organizationId_code_key" ON "HsnSacCode"("organizationId", "code");

-- AddForeignKey
ALTER TABLE "HsnSacCode" ADD CONSTRAINT "HsnSacCode_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
