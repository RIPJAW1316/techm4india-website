-- Phase 5 project/task metadata and historical membership support
ALTER TABLE "ProjectMember" ADD COLUMN "removedAt" TIMESTAMP(3);
ALTER TABLE "ProjectTask" ADD COLUMN "completedAt" TIMESTAMP(3);
ALTER TABLE "Notification" ADD COLUMN "resourceType" TEXT;
ALTER TABLE "Notification" ADD COLUMN "resourceId" UUID;

CREATE INDEX "ProjectMember_employeeId_removedAt_idx" ON "ProjectMember"("employeeId", "removedAt");
CREATE INDEX "ProjectMember_projectId_removedAt_idx" ON "ProjectMember"("projectId", "removedAt");
CREATE INDEX "Notification_resourceType_resourceId_idx" ON "Notification"("resourceType", "resourceId");
