/**
 * SNF Science Plugin
 * Science system — research, patents, grants, science competitions
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

interface ResearchPaper {
  id: string;
  author: string;
  title: string;
  abstract: string;
  citations: number;
  branch: string;
  publishedAt: string;
}

interface ScienceGrant {
  id: string;
  applicant: string;
  amount: number;
  branch: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewedAt: string | null;
}

interface Patent {
  id: string;
  owner: string;
  title: string;
  registrationNumber: string;
  filedAt: string;
  status: 'pending' | 'registered' | 'expired';
}

// ============================================================
// Mock Data
// ============================================================

const mockPapers: ResearchPaper[] = [
  {
    id: 'paper_001',
    author: 'did:example:scientist1',
    title: 'Quantum Computing Applications in Nation Governance',
    abstract: 'This paper explores the application of quantum computing algorithms in optimizing national resource allocation and decision-making processes.',
    citations: 42,
    branch: 'physics',
    publishedAt: '2026-01-15T10:00:00Z',
  },
  {
    id: 'paper_002',
    author: 'did:example:scientist2',
    title: 'Sustainable Energy Systems for Digital Nations',
    abstract: 'Research on renewable energy integration and smart grid technologies for sovereign digital communities.',
    citations: 28,
    branch: 'engineering',
    publishedAt: '2026-02-20T14:30:00Z',
  },
  {
    id: 'paper_003',
    author: 'did:example:scientist3',
    title: 'AI Governance: Ethical Framework Design',
    abstract: 'An examination of ethical frameworks for artificial intelligence governance in decentralized autonomous organizations.',
    citations: 67,
    branch: 'computer-science',
    publishedAt: '2026-03-10T09:00:00Z',
  },
  {
    id: 'paper_004',
    author: 'did:example:scientist4',
    title: 'Cryptographic Identity Systems for Citizens',
    abstract: 'Novel approaches to zero-knowledge proof based identity verification in nation-state contexts.',
    citations: 35,
    branch: 'cryptography',
    publishedAt: '2026-04-05T11:15:00Z',
  },
  {
    id: 'paper_005',
    author: 'did:example:scientist5',
    title: 'Economic Modeling in Token-Based Governance',
    abstract: 'Advanced economic models for token-weighted voting systems and treasury management.',
    citations: 19,
    branch: 'economics',
    publishedAt: '2026-05-01T08:45:00Z',
  },
];

const mockGrants: ScienceGrant[] = [
  {
    id: 'grant_001',
    applicant: 'did:example:scientist6',
    amount: 50000,
    branch: 'biology',
    status: 'approved',
    reviewedAt: '2026-01-20T00:00:00Z',
  },
  {
    id: 'grant_002',
    applicant: 'did:example:scientist7',
    amount: 75000,
    branch: 'physics',
    status: 'pending',
    reviewedAt: null,
  },
  {
    id: 'grant_003',
    applicant: 'did:example:scientist8',
    amount: 30000,
    branch: 'computer-science',
    status: 'approved',
    reviewedAt: '2026-03-15T00:00:00Z',
  },
];

const mockPatents: Patent[] = [
  {
    id: 'patent_001',
    owner: 'did:example:inventor1',
    title: 'Novel Energy Storage Method Using Quantum Coherence',
    registrationNumber: 'PAT-2026-001',
    filedAt: '2026-02-01T00:00:00Z',
    status: 'registered',
  },
  {
    id: 'patent_002',
    owner: 'did:example:inventor2',
    title: 'Distributed Reputation System',
    registrationNumber: 'PAT-2026-002',
    filedAt: '2026-02-15T00:00:00Z',
    status: 'registered',
  },
  {
    id: 'patent_003',
    owner: 'did:example:inventor3',
    title: 'Privacy-Preserving Voting Protocol',
    registrationNumber: 'PAT-2026-003',
    filedAt: '2026-03-10T00:00:00Z',
    status: 'registered',
  },
];

// ============================================================
// Route Handlers
// ============================================================

interface ListPapersRequest {
  query?: {
    branch?: string;
    author?: string;
    limit?: number;
    offset?: number;
  };
}

async function handleListPapers(
  _req: unknown,
  _res: unknown
): Promise<{ papers: ResearchPaper[]; total: number }> {
  const req = _req as ListPapersRequest;
  const branch = req.query?.branch;
  const author = req.query?.author;
  const limit = req.query?.limit ?? 20;
  const offset = req.query?.offset ?? 0;

  let filtered = [...mockPapers];

  if (branch) {
    filtered = filtered.filter((p) => p.branch === branch);
  }
  if (author) {
    filtered = filtered.filter((p) => p.author === author);
  }

  const total = filtered.length;
  const papers = filtered.slice(offset, offset + limit);

  return { papers, total };
}

interface ApplyGrantRequest {
  body: {
    applicant: string;
    amount: number;
    branch: string;
    proposal: string;
  };
}

async function handleApplyGrant(
  req: unknown,
  _res: unknown
): Promise<{ grantId: string; status: string; message: string }> {
  const { body } = req as ApplyGrantRequest;

  const newGrant: ScienceGrant = {
    id: `grant_${String(mockGrants.length + 1).padStart(3, '0')}`,
    applicant: body.applicant,
    amount: body.amount,
    branch: body.branch,
    status: 'pending',
    reviewedAt: null,
  };

  mockGrants.push(newGrant);

  return {
    grantId: newGrant.id,
    status: 'pending',
    message: 'Grant application submitted successfully',
  };
}

interface ListPatentsRequest {
  query?: {
    owner?: string;
    status?: string;
    limit?: number;
    offset?: number;
  };
}

async function handleListPatents(
  req: unknown,
  _res: unknown
): Promise<{ patents: Patent[]; total: number }> {
  const request = req as ListPatentsRequest;
  const owner = request.query?.owner;
  const status = request.query?.status;
  const limit = request.query?.limit ?? 20;
  const offset = request.query?.offset ?? 0;

  let filtered = [...mockPatents];

  if (owner) {
    filtered = filtered.filter((p) => p.owner === owner);
  }
  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  const total = filtered.length;
  const patents = filtered.slice(offset, offset + limit);

  return { patents, total };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/nation/science',
    handler: handleListPapers,
  },
  {
    method: 'POST',
    path: '/nation/science/grant',
    handler: handleApplyGrant,
  },
  {
    method: 'GET',
    path: '/nation/science/patents',
    handler: handleListPatents,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS research_papers (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        title TEXT NOT NULL,
        abstract TEXT,
        citations INTEGER DEFAULT 0,
        branch TEXT NOT NULL,
        published_at TEXT NOT NULL
      );
    `,
    down: 'DROP TABLE IF EXISTS research_papers;',
  },
  {
    version: '002',
    up: `
      CREATE TABLE IF NOT EXISTS science_grants (
        id TEXT PRIMARY KEY,
        applicant TEXT NOT NULL,
        amount INTEGER NOT NULL,
        branch TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        reviewed_at TEXT
      );
    `,
    down: 'DROP TABLE IF EXISTS science_grants;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createSciencePlugin(): SNFPlugin {
  return {
    name: 'snf-science',
    version: '1.0.0',
    description: 'Science system — research, patents, grants, science competitions',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
