import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const appDir = path.resolve(__dirname, '..');

test('CRM Configuration: Port, Name and Build Target', () => {
  const pkgPath = path.join(appDir, 'package.json');
  assert.ok(fs.existsSync(pkgPath), 'package.json must exist in apps/crm');
  const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

  assert.equal(pkg.name, '@techm4india/crm');
  assert.ok(pkg.scripts.dev.includes('3003'), 'dev script must target dedicated port 3003');
  assert.ok(pkg.scripts.build, 'build script must exist');
});

test('CRM Types & 8 TechM4 Sector Verticals', () => {
  const typesPath = path.join(appDir, 'src/types.ts');
  assert.ok(fs.existsSync(typesPath), 'types.ts must exist');
  const typesContent = fs.readFileSync(typesPath, 'utf8');

  const requiredSectors = [
    'B2C_STUDENT',
    'B2B_SCHOOL',
    'B2B_COLLEGE',
    'B2B_UNIVERSITY',
    'GOVERNMENT',
    'CORPORATE_CSR',
    'INTERNATIONAL',
    'PARTNER_FRANCHISE',
  ];

  for (const sector of requiredSectors) {
    assert.ok(
      typesContent.includes(sector),
      `types.ts must support sector vertical: ${sector}`
    );
  }
});

test('CRM 6-Stage Kanban Pipeline Stages', () => {
  const typesContent = fs.readFileSync(path.join(appDir, 'src/types.ts'), 'utf8');

  const requiredStages = [
    'QUALIFICATION',
    'NEEDS_ANALYSIS',
    'PROPOSAL_QUOTATION',
    'NEGOTIATION_REVIEW',
    'CLOSED_WON',
    'CLOSED_LOST',
  ];

  for (const stage of requiredStages) {
    assert.ok(
      typesContent.includes(stage),
      `types.ts must support DealStage: ${stage}`
    );
  }
});

test('CRM 1-Click Lead Conversion Engine Integrity', () => {
  const apiPath = path.join(appDir, 'src/lib/crm-api.ts');
  assert.ok(fs.existsSync(apiPath), 'crm-api.ts must exist');
  const apiContent = fs.readFileSync(apiPath, 'utf8');

  assert.ok(apiContent.includes('convertLead:'), 'convertLead method must exist');
  assert.ok(apiContent.includes('newAccount: AccountItem'), 'Conversion must produce an Account');
  assert.ok(apiContent.includes('newContact: ContactItem'), 'Conversion must produce a Contact');
  assert.ok(apiContent.includes('newDeal: DealItem'), 'Conversion must produce a Deal');
});

test('CRM to Finance ERP Bridge Integrity', () => {
  const apiContent = fs.readFileSync(path.join(appDir, 'src/lib/crm-api.ts'), 'utf8');
  assert.ok(
    apiContent.includes('pushQuoteToFinance:'),
    'pushQuoteToFinance bridge method must exist'
  );
  assert.ok(
    apiContent.includes('/api/v1/finance/invoices/from-crm-quote'),
    'Must connect to Finance ERP invoices bridge endpoint'
  );
});

test('Zoho UI Components Structure & Dual-Rail Navigation', () => {
  const components = [
    'CrmHeader.tsx',
    'CrmRailAndSidebar.tsx',
    'CrmHomeDashboard.tsx',
    'CrmLeadsView.tsx',
    'CrmAccountsView.tsx',
    'CrmContactsView.tsx',
    'CrmDealsView.tsx',
    'CrmActivitiesView.tsx',
    'CrmQuotesView.tsx',
    'CrmReportsView.tsx',
    'CrmCampaignsView.tsx',
    'CrmConvertLeadModal.tsx',
  ];

  for (const comp of components) {
    const compPath = path.join(appDir, 'src/components', comp);
    assert.ok(fs.existsSync(compPath), `Component ${comp} must exist in apps/crm/src/components`);
  }
});
