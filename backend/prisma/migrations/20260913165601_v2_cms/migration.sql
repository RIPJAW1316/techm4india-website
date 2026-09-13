-- CreateEnum
CREATE TYPE "CmsContentType" AS ENUM ('PAGE', 'ARTICLE', 'ANNOUNCEMENT', 'FAQ');

-- CreateEnum
CREATE TYPE "CmsContentStatus" AS ENUM ('DRAFT', 'IN_REVIEW', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "CmsPage" (
    "id" UUID NOT NULL,
    "organizationId" UUID NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CmsContentType" NOT NULL DEFAULT 'PAGE',
    "status" "CmsContentStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedRevisionId" UUID,
    "publishedAt" TIMESTAMP(3),
    "archivedAt" TIMESTAMP(3),
    "createdByUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CmsPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CmsRevision" (
    "id" UUID NOT NULL,
    "pageId" UUID NOT NULL,
    "version" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "summary" TEXT,
    "body" TEXT NOT NULL,
    "authorUserId" UUID NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CmsRevision_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CmsPage_organizationId_status_type_idx" ON "CmsPage"("organizationId", "status", "type");

-- CreateIndex
CREATE UNIQUE INDEX "CmsPage_organizationId_slug_key" ON "CmsPage"("organizationId", "slug");

-- CreateIndex
CREATE INDEX "CmsRevision_pageId_idx" ON "CmsRevision"("pageId");

-- CreateIndex
CREATE UNIQUE INDEX "CmsRevision_pageId_version_key" ON "CmsRevision"("pageId", "version");

-- AddForeignKey
ALTER TABLE "CmsPage" ADD CONSTRAINT "CmsPage_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CmsRevision" ADD CONSTRAINT "CmsRevision_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "CmsPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
