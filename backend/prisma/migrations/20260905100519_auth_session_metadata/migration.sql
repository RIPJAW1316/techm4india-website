-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "ipAddress" VARCHAR(64),
ADD COLUMN     "userAgent" VARCHAR(512);

-- AlterTable
ALTER TABLE "RefreshSession" ADD COLUMN     "ipAddress" VARCHAR(64),
ADD COLUMN     "userAgent" VARCHAR(512);
