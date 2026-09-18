/**
 * SNF Defense Plugin
 * Defense & national security — military units, intelligence, civil defense
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

interface DefenseUnit {
  id: string;
  name: string;
  type: 'infantry' | 'armor' | 'aviation' | 'naval' | 'special_ops' | 'civil_defense';
  strength: number;
  readiness: number;
  stationedAt: string;
}

interface IntelReport {
  id: string;
  title: string;
  classification: 'public' | 'confidential' | 'secret' | 'top_secret';
  summary: string;
  issuedAt: string;
}

interface DefenseBranch {
  name: string;
  personnel: number;
  units: number;
  readiness: number;
}

// ============================================================
// Mock Data
// ============================================================

const mockUnits: DefenseUnit[] = [
  {
    id: 'unit_001',
    name: 'Alpha Brigade',
    type: 'infantry',
    strength: 2500,
    readiness: 95,
    stationedAt: 'district_central',
  },
  {
    id: 'unit_002',
    name: 'Sky Guardian Squadron',
    type: 'aviation',
    strength: 200,
    readiness: 88,
    stationedAt: 'air_base_north',
  },
  {
    id: 'unit_003',
    name: 'Coastal Defense Fleet',
    type: 'naval',
    strength: 500,
    readiness: 85,
    stationedAt: 'naval_base_east',
  },
  {
    id: 'unit_004',
    name: 'Thunder Armor Division',
    type: 'armor',
    strength: 800,
    readiness: 92,
    stationedAt: 'military_region_west',
  },
  {
    id: 'unit_005',
    name: 'Shadow Operations Team',
    type: 'special_ops',
    strength: 50,
    readiness: 98,
    stationedAt: 'classified',
  },
  {
    id: 'unit_006',
    name: 'Emergency Response Corps',
    type: 'civil_defense',
    strength: 1200,
    readiness: 80,
    stationedAt: 'national_emergency_center',
  },
  {
    id: 'unit_007',
    name: 'Beta Infantry Regiment',
    type: 'infantry',
    strength: 1800,
    readiness: 90,
    stationedAt: 'district_south',
  },
  {
    id: 'unit_008',
    name: 'Naval Strike Group Alpha',
    type: 'naval',
    strength: 350,
    readiness: 87,
    stationedAt: 'naval_base_west',
  },
];

const mockReports: IntelReport[] = [
  {
    id: 'intel_001',
    title: 'Regional Security Assessment Q2 2026',
    classification: 'secret',
    summary:
      'Regional security situation remains stable. Minor tensions reported in border regions. No immediate threats identified. Intelligence suggests neighboring regions maintaining defensive postures.',
    issuedAt: '2026-05-15T00:00:00Z',
  },
  {
    id: 'intel_002',
    title: 'Economic Intelligence Briefing',
    classification: 'confidential',
    summary:
      'Trade patterns analysis shows positive trends. Key trading partners maintain stable relations. Monitoring for economic disruptions and supply chain vulnerabilities.',
    issuedAt: '2026-05-10T00:00:00Z',
  },
  {
    id: 'intel_003',
    title: 'Technology Security Report',
    classification: 'secret',
    summary:
      'Cybersecurity threat levels remain elevated. Recommended increased monitoring of critical infrastructure. Several attempted intrusions detected and neutralized.',
    issuedAt: '2026-05-08T00:00:00Z',
  },
  {
    id: 'intel_004',
    title: 'Public Health Security Assessment',
    classification: 'public',
    summary:
      'National health security status: Stable. Emergency response capabilities adequate. No significant health threats identified.',
    issuedAt: '2026-05-05T00:00:00Z',
  },
  {
    id: 'intel_005',
    title: 'Infrastructure Vulnerability Analysis',
    classification: 'confidential',
    summary:
      'Critical infrastructure assessment complete. Power grid and communication networks rated as adequately secure. Recommendations for improvement in water treatment facility security.',
    issuedAt: '2026-04-28T00:00:00Z',
  },
  {
    id: 'intel_006',
    title: 'Foreign Relations Summary',
    classification: 'secret',
    summary:
      'Diplomatic relations with key partners stable. Ongoing negotiations in multiple areas. No significant disputes requiring escalation.',
    issuedAt: '2026-04-20T00:00:00Z',
  },
];

const mockBranches: DefenseBranch[] = [
  {
    name: 'Army',
    personnel: 8000,
    units: 20,
    readiness: 92,
  },
  {
    name: 'Navy',
    personnel: 3000,
    units: 10,
    readiness: 85,
  },
  {
    name: 'Air Force',
    personnel: 2500,
    units: 12,
    readiness: 88,
  },
  {
    name: 'Civil Defense',
    personnel: 1500,
    units: 3,
    readiness: 80,
  },
];

// ============================================================
// Route Handlers
// ============================================================

async function handleGetDefenseOverview(
  _req: unknown,
  _res: unknown
): Promise<{
  defenseOverview: {
    overallReadiness: number;
    activePersonnel: number;
    totalUnits: number;
    defenseBudget: number;
    threatLevel: 'low' | 'moderate' | 'high' | 'critical';
    lastUpdated: string;
  };
  branches: DefenseBranch[];
}> {
  const totalPersonnel = mockBranches.reduce((sum, b) => sum + b.personnel, 0);
  const totalUnits = mockBranches.reduce((sum, b) => sum + b.units, 0);
  const avgReadiness =
    mockBranches.reduce((sum, b) => sum + b.readiness, 0) /
    mockBranches.length;

  return {
    defenseOverview: {
      overallReadiness: Math.round(avgReadiness),
      activePersonnel: totalPersonnel,
      totalUnits,
      defenseBudget: 2500000000,
      threatLevel: 'low',
      lastUpdated: new Date().toISOString(),
    },
    branches: mockBranches,
  };
}

interface ListUnitsRequest {
  query?: {
    type?: string;
    readiness_min?: number;
  };
}

async function handleListUnits(
  req: unknown,
  _res: unknown
): Promise<{ units: DefenseUnit[]; total: number }> {
  const request = req as ListUnitsRequest;
  const type = request.query?.type;
  const readinessMin = request.query?.readiness_min ?? 0;

  let filtered = [...mockUnits];

  if (type) {
    filtered = filtered.filter((u) => u.type === type);
  }
  if (readinessMin > 0) {
    filtered = filtered.filter((u) => u.readiness >= readinessMin);
  }

  const total = filtered.length;

  return { units: filtered, total };
}

interface ListIntelRequest {
  query?: {
    classification?: string;
  };
}

async function handleGetIntel(
  req: unknown,
  _res: unknown
): Promise<{ reports: IntelReport[]; total: number }> {
  const request = req as ListIntelRequest;
  const classification = request.query?.classification;

  let filtered = [...mockReports];

  if (classification) {
    filtered = filtered.filter((r) => r.classification === classification);
  }

  const total = filtered.length;

  return { reports: filtered, total };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/nation/defense',
    handler: handleGetDefenseOverview,
  },
  {
    method: 'GET',
    path: '/nation/defense/units',
    handler: handleListUnits,
  },
  {
    method: 'GET',
    path: '/nation/defense/intelligence',
    handler: handleGetIntel,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS defense_units (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        type TEXT NOT NULL,
        strength INTEGER NOT NULL,
        readiness INTEGER DEFAULT 100,
        stationed_at TEXT NOT NULL
      );
    `,
    down: 'DROP TABLE IF EXISTS defense_units;',
  },
  {
    version: '002',
    up: `
      CREATE TABLE IF NOT EXISTS intel_reports (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        classification TEXT NOT NULL,
        summary TEXT NOT NULL,
        issued_at TEXT NOT NULL
      );
    `,
    down: 'DROP TABLE IF EXISTS intel_reports;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createDefensePlugin(): SNFPlugin {
  return {
    name: 'snf-defense',
    version: '1.0.0',
    description:
      'Defense & national security — military units, intelligence, civil defense',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
