import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load .env if present
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'apps/api/.env') });

const prisma = new PrismaClient();

function maskUrl(url?: string): string {
  if (!url) return 'Not configured';
  try {
    const parsed = new URL(url);
    if (parsed.password) {
      parsed.password = '****';
    }
    return parsed.toString();
  } catch {
    return 'postgresql://****';
  }
}

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || '--write-and-cleanup';
  const targetProbeId = args[1];

  const rawUrl = process.env.DATABASE_URL;
  if (!rawUrl) {
    console.error('❌ Error: DATABASE_URL is not set in environment or .env');
    process.exit(1);
  }

  console.log('====================================================');
  console.log('🔍 TECHM4INDIA ERP — SHARED DATABASE VERIFICATION');
  console.log('====================================================');
  console.log(`📡 Target URL (Masked): ${maskUrl(rawUrl)}`);

  // 1. Connectivity and Database Identity Check
  let dbInfo: { database: string; user: string; version: string; ssl: boolean };
  try {
    const rows: any = await prisma.$queryRaw`
      SELECT 
        current_database() AS "database",
        current_user AS "user",
        version() AS "version";
    `;
    const basic = rows[0] || {};

    let isSsl = false;
    try {
      const sslRows: any = await prisma.$queryRaw`
        SELECT ssl FROM pg_stat_ssl WHERE pid = pg_backend_pid();
      `;
      isSsl = Boolean(sslRows[0]?.ssl);
    } catch {
      isSsl = false;
    }

    dbInfo = {
      database: basic.database,
      user: basic.user,
      version: basic.version,
      ssl: isSsl,
    };

    console.log(`✅ Connection established successfully.`);
    console.log(`📦 Database Name:       ${dbInfo.database}`);
    console.log(`👤 Database User:       ${dbInfo.user}`);
    console.log(`🔒 SSL Active:          ${dbInfo.ssl ? 'YES' : 'NO'}`);
    console.log(`ℹ️ Server Version:      ${dbInfo.version.split(' on ')[0]}`);
  } catch (error) {
    console.error('❌ Database connectivity failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }

  // 2. Count Existing Baseline Records (Preservation Check)
  const [orgCount, roleCount, permCount, appCount, userCount] = await Promise.all([
    prisma.organization.count(),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.application.count(),
    prisma.user.count(),
  ]);

  console.log('----------------------------------------------------');
  console.log('📊 Current Database Baseline Counts:');
  console.log(`   - Organizations:  ${orgCount}`);
  console.log(`   - Roles:          ${roleCount}`);
  console.log(`   - Permissions:    ${permCount}`);
  console.log(`   - Applications:   ${appCount}`);
  console.log(`   - Users:          ${userCount}`);
  console.log('----------------------------------------------------');

  // 3. Execution Modes
  if (command === '--create-probe') {
    const probeId = `probe-crossenv-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const record = await prisma.auditLog.create({
      data: {
        action: 'SHARED_DB_CROSS_ENV_VERIFICATION',
        entity: 'SYSTEM_VERIFICATION_PROBE',
        entityId: probeId,
        details: {
          probeId,
          sourceEnv: process.env.NODE_ENV || 'local',
          createdAt: new Date().toISOString(),
          note: 'Temporary probe to verify shared database visibility from other environments.',
        },
      },
    });

    console.log(`🚀 Probe Created in Shared Database!`);
    console.log(`   Probe ID:      ${probeId}`);
    console.log(`   Audit Log ID:  ${record.id}`);
    console.log(`   Timestamp:     ${record.createdAt.toISOString()}`);
    console.log('');
    console.log(`To verify visibility from the other environment, execute:`);
    console.log(`   npm run db:verify -- --verify-probe ${probeId} --delete`);
  } else if (command === '--verify-probe') {
    if (!targetProbeId) {
      console.error('❌ Error: Please specify a probe ID. Example: npm run db:verify -- --verify-probe probe-xxx');
      process.exit(1);
    }

    console.log(`🔎 Searching for Probe: ${targetProbeId}...`);
    const record = await prisma.auditLog.findFirst({
      where: {
        entity: 'SYSTEM_VERIFICATION_PROBE',
        entityId: targetProbeId,
      },
    });

    if (!record) {
      console.error(`❌ Probe [${targetProbeId}] NOT FOUND in database "${dbInfo.database}".`);
      console.error('   Ensure both environments are connected to the exact same database instance.');
      process.exit(1);
    }

    console.log(`✅ Probe DETECTED successfully in shared database!`);
    console.log(`   Audit Log ID:  ${record.id}`);
    console.log(`   Created At:    ${record.createdAt.toISOString()}`);
    console.log(`   Payload:       ${JSON.stringify(record.details)}`);

    if (args.includes('--delete')) {
      await prisma.auditLog.delete({ where: { id: record.id } });
      console.log(`🧹 Probe [${targetProbeId}] deleted cleanly. Zero residual test data.`);
    } else {
      console.log(`ℹ️ Probe retained. To delete it, re-run with: --verify-probe ${targetProbeId} --delete`);
    }
  } else if (command === '--write-and-cleanup') {
    const probeId = `probe-temp-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    console.log(`🧪 Executing Reversible Probe Write-Read-Delete Test...`);

    // Write
    const created = await prisma.auditLog.create({
      data: {
        action: 'SHARED_DB_SELF_VERIFICATION',
        entity: 'SYSTEM_VERIFICATION_PROBE',
        entityId: probeId,
        details: { probeId, timestamp: new Date().toISOString() },
      },
    });
    console.log(`   [1/3] Probe inserted (ID: ${created.id}, probeId: ${probeId})`);

    // Read back
    const fetched = await prisma.auditLog.findUnique({
      where: { id: created.id },
    });
    if (!fetched || fetched.entityId !== probeId) {
      throw new Error('Verification failed: Inserted probe could not be retrieved.');
    }
    console.log(`   [2/3] Probe read-back verified with matching entityId.`);

    // Delete
    await prisma.auditLog.delete({
      where: { id: created.id },
    });
    console.log(`   [3/3] Probe removed cleanly.`);
    console.log(`✅ Safe round-trip verification succeeded! No baseline data was modified.`);
  } else if (command === '--cleanup-all-probes') {
    const result = await prisma.auditLog.deleteMany({
      where: { entity: 'SYSTEM_VERIFICATION_PROBE' },
    });
    console.log(`🧹 Cleaned up ${result.count} verification probe(s).`);
  } else {
    console.log(`Unknown command: ${command}`);
    console.log('Available commands:');
    console.log('   --write-and-cleanup       (Default: local write/read/delete probe test)');
    console.log('   --create-probe            (Creates probe to be checked by online backend)');
    console.log('   --verify-probe <id> [--delete] (Verifies probe from other backend)');
    console.log('   --cleanup-all-probes      (Removes all temporary probe records)');
  }

  // 4. Final Baseline Counts Verification
  const [postOrg, postRole, postPerm, postApp, postUser] = await Promise.all([
    prisma.organization.count(),
    prisma.role.count(),
    prisma.permission.count(),
    prisma.application.count(),
    prisma.user.count(),
  ]);

  if (
    orgCount !== postOrg ||
    roleCount !== postRole ||
    permCount !== postPerm ||
    appCount !== postApp ||
    userCount !== postUser
  ) {
    console.warn('⚠️ Warning: Baseline entity counts changed during verification!');
  } else {
    console.log('🔒 Baseline entity integrity confirmed (0 production entities changed).');
  }
  console.log('====================================================');
}

main()
  .catch((e) => {
    console.error('Fatal error during verification:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
