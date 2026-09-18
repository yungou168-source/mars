/**
 * SNF Welfare Plugin
 * Welfare & UBI system — universal basic income distribution, social security, pensions
 */

import type {
  SNFPlugin,
  SNFEngine,
  RouteDefinition,
  DatabaseMigration,
} from '@sovereign-nation/core';

// ============================================================
// Types
// ============================================================

interface WelfareClaim {
  id: string;
  citizenId: string;
  type: string;
  amount: number | null;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt: string;
  processedAt: string | null;
}

interface UBIPayment {
  id: string;
  citizenId: string;
  amount: number;
  period: string;
  status: 'pending' | 'paid';
  paidAt: string | null;
}

interface WelfareProgram {
  name: string;
  beneficiaries: number;
  monthlyAmount: number;
}

interface UBIPaymentStatus {
  eligibleCitizens: number;
  activeRecipients: number;
  pendingPayments: number;
  monthlyRate: number;
  nextDistributionDate: string;
  totalMonthlyBudget: number;
}

// ============================================================
// Mock Data
// ============================================================

const mockClaims: WelfareClaim[] = [
  {
    id: 'claim_001',
    citizenId: 'did:example:citizen1',
    type: 'housing_assistance',
    amount: 8000,
    status: 'approved',
    appliedAt: '2026-04-01T00:00:00Z',
    processedAt: '2026-04-10T00:00:00Z',
  },
  {
    id: 'claim_002',
    citizenId: 'did:example:citizen2',
    type: 'medical_support',
    amount: 15000,
    status: 'pending',
    appliedAt: '2026-05-15T00:00:00Z',
    processedAt: null,
  },
  {
    id: 'claim_003',
    citizenId: 'did:example:citizen3',
    type: 'education_grant',
    amount: 5000,
    status: 'approved',
    appliedAt: '2026-05-10T00:00:00Z',
    processedAt: '2026-05-18T00:00:00Z',
  },
];

const mockUBIPayments: UBIPayment[] = [
  {
    id: 'ubi_001',
    citizenId: 'did:example:citizen1',
    amount: 15000,
    period: '2026-05',
    status: 'paid',
    paidAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'ubi_002',
    citizenId: 'did:example:citizen2',
    amount: 15000,
    period: '2026-05',
    status: 'paid',
    paidAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'ubi_003',
    citizenId: 'did:example:citizen3',
    amount: 15000,
    period: '2026-05',
    status: 'paid',
    paidAt: '2026-05-01T08:00:00Z',
  },
  {
    id: 'ubi_004',
    citizenId: 'did:example:citizen4',
    amount: 15000,
    period: '2026-05',
    status: 'pending',
    paidAt: null,
  },
];

const welfarePrograms: WelfareProgram[] = [
  {
    name: 'Universal Basic Income',
    beneficiaries: 12000,
    monthlyAmount: 15000,
  },
  {
    name: 'Senior Pension',
    beneficiaries: 2400,
    monthlyAmount: 25000,
  },
  {
    name: 'Disability Support',
    beneficiaries: 1020,
    monthlyAmount: 20000,
  },
  {
    name: 'Education Grant',
    beneficiaries: 3500,
    monthlyAmount: 8000,
  },
  {
    name: 'Housing Assistance',
    beneficiaries: 1800,
    monthlyAmount: 12000,
  },
  {
    name: 'Medical Support',
    beneficiaries: 950,
    monthlyAmount: 15000,
  },
  {
    name: 'Childcare Support',
    beneficiaries: 2100,
    monthlyAmount: 6000,
  },
  {
    name: 'Job Training',
    beneficiaries: 500,
    monthlyAmount: 5000,
  },
];

// ============================================================
// Route Handlers
// ============================================================

async function handleGetWelfare(
  _req: unknown,
  _res: unknown
): Promise<{
  totalBeneficiaries: number;
  totalDisbursed: number;
  activePrograms: number;
  programs: WelfareProgram[];
  pendingClaims: number;
}> {
  const totalBeneficiaries = welfarePrograms.reduce(
    (sum, p) => sum + p.beneficiaries,
    0
  );
  const totalDisbursed = welfarePrograms.reduce(
    (sum, p) => sum + p.beneficiaries * p.monthlyAmount,
    0
  );
  const pendingClaims = mockClaims.filter(
    (c) => c.status === 'pending'
  ).length;

  return {
    totalBeneficiaries,
    totalDisbursed,
    activePrograms: welfarePrograms.length,
    programs: welfarePrograms,
    pendingClaims,
  };
}

async function handleGetUBIStatus(
  _req: unknown,
  _res: unknown
): Promise<{
  ubiStatus: UBIPaymentStatus;
  recentPayments: UBIPayment[];
}> {
  const paidPayments = mockUBIPayments.filter((p) => p.status === 'paid');
  const pendingPayments = mockUBIPayments.filter(
    (p) => p.status === 'pending'
  );

  const ubiStatus: UBIPaymentStatus = {
    eligibleCitizens: 15000,
    activeRecipients: paidPayments.length,
    pendingPayments: pendingPayments.length,
    monthlyRate: 15000,
    nextDistributionDate: '2026-06-01T00:00:00Z',
    totalMonthlyBudget: 15000 * 15000,
  };

  return {
    ubiStatus,
    recentPayments: paidPayments.slice(0, 10),
  };
}

interface ClaimBenefitsRequest {
  body: {
    citizenId: string;
    type: string;
    supportingDocuments?: string[];
    reason?: string;
  };
}

async function handleClaimBenefits(
  req: unknown,
  _res: unknown
): Promise<{
  claimId: string;
  status: string;
  estimatedProcessingDays: number;
  message: string;
}> {
  const { body } = req as ClaimBenefitsRequest;

  const newClaim: WelfareClaim = {
    id: `claim_${String(mockClaims.length + 1).padStart(3, '0')}`,
    citizenId: body.citizenId,
    type: body.type,
    amount: null,
    status: 'pending',
    appliedAt: new Date().toISOString(),
    processedAt: null,
  };

  mockClaims.push(newClaim);

  return {
    claimId: newClaim.id,
    status: 'pending',
    estimatedProcessingDays: 14,
    message:
      'Claim submitted successfully. You will be notified once processed.',
  };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/nation/welfare',
    handler: handleGetWelfare,
  },
  {
    method: 'GET',
    path: '/nation/welfare/ubi',
    handler: handleGetUBIStatus,
  },
  {
    method: 'POST',
    path: '/nation/welfare/claim',
    handler: handleClaimBenefits,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS welfare_claims (
        id TEXT PRIMARY KEY,
        citizen_id TEXT NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER,
        status TEXT DEFAULT 'pending',
        applied_at TEXT NOT NULL,
        processed_at TEXT
      );
    `,
    down: 'DROP TABLE IF EXISTS welfare_claims;',
  },
  {
    version: '002',
    up: `
      CREATE TABLE IF NOT EXISTS ubi_payments (
        id TEXT PRIMARY KEY,
        citizen_id TEXT NOT NULL,
        amount INTEGER NOT NULL,
        period TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        paid_at TEXT
      );
    `,
    down: 'DROP TABLE IF EXISTS ubi_payments;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createWelfarePlugin(): SNFPlugin {
  return {
    name: 'snf-welfare',
    version: '1.0.0',
    description:
      'Welfare & UBI system — universal basic income distribution, social security, pensions',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
