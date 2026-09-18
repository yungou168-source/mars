/**
 * SNF Bounty Plugin
 * Bounty board — post bounties, claim tasks, earn rewards
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

type BountyCategory = 'bug' | 'mission' | 'research' | 'creative' | 'security' | 'community';
type BountyStatus = 'open' | 'in_progress' | 'completed' | 'expired' | 'cancelled';
type BountyDifficulty = 'easy' | 'medium' | 'hard' | 'legendary';

interface Bounty {
  id: string;
  title: string;
  description: string;
  category: BountyCategory;
  difficulty: BountyDifficulty;
  reward: number;
  deadline: string;
  status: BountyStatus;
  posterId: string;
  assigneeId: string | null;
  tags: string[];
  createdAt: string;
  completedAt: string | null;
}

interface BountySubmission {
  id: string;
  bountyId: string;
  submitterId: string;
  content: string;
  proof: string;
  status: 'submitted' | 'approved' | 'rejected';
  reviewedAt: string | null;
  reviewNote: string | null;
}

interface BountyHunter {
  citizenId: string;
  completedBounties: number;
  totalEarnings: number;
  reputation: number;
  rank: string;
  specialties: BountyCategory[];
}

// ============================================================
// Mock Data
// ============================================================

const mockBounties: Bounty[] = [
  {
    id: 'bounty_001',
    title: 'Critical: Fix Identity Verification Race Condition',
    description: 'The identity verification endpoint has a race condition that allows duplicate registrations. Must be fixed in production within 48 hours. Requires detailed reproduction steps and a patch.',
    category: 'bug',
    difficulty: 'hard',
    reward: 150000,
    deadline: '2026-05-24T00:00:00Z',
    status: 'open',
    posterId: 'did:example:security_council',
    assigneeId: null,
    tags: ['security', 'critical', 'urgent'],
    createdAt: '2026-05-21T00:00:00Z',
    completedAt: null,
  },
  {
    id: 'bounty_002',
    title: 'Document Election Smart Contract API',
    description: 'Write comprehensive API documentation for the election smart contract. Include all methods, events, error codes, and integration examples in both TypeScript and Python.',
    category: 'research',
    difficulty: 'medium',
    reward: 45000,
    deadline: '2026-05-30T00:00:00Z',
    status: 'open',
    posterId: 'did:example:gov_team',
    assigneeId: null,
    tags: ['docs', 'api', 'smart-contract'],
    createdAt: '2026-05-19T00:00:00Z',
    completedAt: null,
  },
  {
    id: 'bounty_003',
    title: 'Citizen Mission: Distribute Welfare Materials',
    description: 'Distribute welfare enrollment information flyers to 50 households in District South. Document distribution with photos and household confirmations.',
    category: 'mission',
    difficulty: 'easy',
    reward: 8000,
    deadline: '2026-05-28T00:00:00Z',
    status: 'open',
    posterId: 'did:example:welfare_ministry',
    assigneeId: null,
    tags: ['community', 'outreach'],
    createdAt: '2026-05-20T00:00:00Z',
    completedAt: null,
  },
  {
    id: 'bounty_004',
    title: 'Design National Day Celebration Assets',
    description: 'Create digital assets for National Day celebration: hero banner (1920x600), social media cards (5 variants), animated loading indicator. Style must match the Jupiter Federation theme.',
    category: 'creative',
    difficulty: 'medium',
    reward: 35000,
    deadline: '2026-06-10T00:00:00Z',
    status: 'in_progress',
    posterId: 'did:example:design_council',
    assigneeId: 'did:example:artist1',
    tags: ['design', 'assets', 'national-day'],
    createdAt: '2026-05-15T00:00:00Z',
    completedAt: null,
  },
  {
    id: 'bounty_005',
    title: 'Penetration Test: Treasury Infrastructure',
    description: 'Conduct a comprehensive penetration test of the treasury smart contracts and associated APIs. Submit a detailed vulnerability report with CVSS scoring. Critical/High findings will qualify for bonus rewards.',
    category: 'security',
    difficulty: 'legendary',
    reward: 500000,
    deadline: '2026-06-15T00:00:00Z',
    status: 'open',
    posterId: 'did:example:security_council',
    assigneeId: null,
    tags: ['security', 'pentest', 'smart-contract', 'treasury'],
    createdAt: '2026-05-18T00:00:00Z',
    completedAt: null,
  },
  {
    id: 'bounty_006',
    title: 'Community Translation: Platform to 10 Languages',
    description: 'Translate the citizen-facing platform interface (UI strings only, ~5000 words) into 10 supported languages. Must maintain tone and context. Native speaker verification required.',
    category: 'community',
    difficulty: 'hard',
    reward: 120000,
    deadline: '2026-06-01T00:00:00Z',
    status: 'completed',
    posterId: 'did:example:outreach_team',
    assigneeId: 'did:example:translator1',
    tags: ['i18n', 'translation', 'community'],
    createdAt: '2026-05-01T00:00:00Z',
    completedAt: '2026-05-20T00:00:00Z',
  },
];

const mockSubmissions: BountySubmission[] = [
  {
    id: 'sub_001',
    bountyId: 'bounty_001',
    submitterId: 'did:example:hunter1',
    content: 'Detailed reproduction steps and proposed patch attached. The race condition occurs when two registration requests are processed concurrently...',
    proof: 'https://evidence.example.com/bounty_001_fix.patch',
    status: 'submitted',
    reviewedAt: null,
    reviewNote: null,
  },
  {
    id: 'sub_002',
    bountyId: 'bounty_006',
    submitterId: 'did:example:translator1',
    content: 'Complete translation package with all 10 languages. Each file includes source string, translated string, and reviewer notes.',
    proof: 'https://evidence.example.com/translations_v1.zip',
    status: 'approved',
    reviewedAt: '2026-05-19T00:00:00Z',
    reviewNote: 'Excellent quality across all languages. Approved for payment.',
  },
];

const mockHunters: BountyHunter[] = [
  {
    citizenId: 'did:example:hunter1',
    completedBounties: 28,
    totalEarnings: 850000,
    reputation: 95,
    rank: 'Elite Hunter',
    specialties: ['security', 'bug'],
  },
  {
    citizenId: 'did:example:hunter2',
    completedBounties: 45,
    totalEarnings: 1200000,
    reputation: 98,
    rank: 'Legendary Hunter',
    specialties: ['research', 'bug', 'security'],
  },
  {
    citizenId: 'did:example:hunter3',
    completedBounties: 15,
    totalEarnings: 320000,
    reputation: 82,
    rank: 'Skilled Hunter',
    specialties: ['creative', 'community'],
  },
  {
    citizenId: 'did:example:translator1',
    completedBounties: 8,
    totalEarnings: 180000,
    reputation: 88,
    rank: 'Skilled Hunter',
    specialties: ['community', 'research'],
  },
];

// ============================================================
// Route Handlers
// ============================================================

interface ListBountiesRequest {
  query?: {
    category?: BountyCategory;
    difficulty?: BountyDifficulty;
    status?: BountyStatus;
    minReward?: number;
    limit?: number;
    offset?: number;
  };
}

async function handleListBounties(
  req: unknown,
  _res: unknown
): Promise<{ bounties: Bounty[]; total: number }> {
  const request = req as ListBountiesRequest;
  const category = request.query?.category;
  const difficulty = request.query?.difficulty;
  const status = request.query?.status;
  const minReward = request.query?.minReward ?? 0;
  const limit = request.query?.limit ?? 20;
  const offset = request.query?.offset ?? 0;

  let filtered = [...mockBounties];

  if (category) filtered = filtered.filter((b) => b.category === category);
  if (difficulty) filtered = filtered.filter((b) => b.difficulty === difficulty);
  if (status) filtered = filtered.filter((b) => b.status === status);
  if (minReward > 0) filtered = filtered.filter((b) => b.reward >= minReward);

  const total = filtered.length;
  const bounties = filtered.slice(offset, offset + limit);

  return { bounties, total };
}

interface GetBountyRequest {
  params: {
    id: string;
  };
}

async function handleGetBounty(
  req: unknown,
  _res: unknown
): Promise<{ bounty: Bounty; submissions: BountySubmission[] } | null> {
  const { params } = req as GetBountyRequest;
  const bounty = mockBounties.find((b) => b.id === params.id);

  if (!bounty) return null;

  const submissions = mockSubmissions.filter((s) => s.bountyId === params.id);
  return { bounty, submissions };
}

interface CreateBountyRequest {
  body: {
    posterId: string;
    title: string;
    description: string;
    category: BountyCategory;
    difficulty: BountyDifficulty;
    reward: number;
    deadline: string;
    tags?: string[];
  };
}

async function handleCreateBounty(
  req: unknown,
  _res: unknown
): Promise<{ bountyId: string; status: string; message: string }> {
  const { body } = req as CreateBountyRequest;

  const newBounty: Bounty = {
    id: `bounty_${String(mockBounties.length + 1).padStart(3, '0')}`,
    title: body.title,
    description: body.description,
    category: body.category,
    difficulty: body.difficulty,
    reward: body.reward,
    deadline: body.deadline,
    status: 'open',
    posterId: body.posterId,
    assigneeId: null,
    tags: body.tags ?? [],
    createdAt: new Date().toISOString(),
    completedAt: null,
  };

  mockBounties.push(newBounty);

  return {
    bountyId: newBounty.id,
    status: 'open',
    message: `Bounty posted successfully. Reward: ${body.reward} tokens.`,
  };
}

interface ClaimBountyRequest {
  params: {
    id: string;
  };
  body: {
    hunterId: string;
  };
}

async function handleClaimBounty(
  req: unknown,
  _res: unknown
): Promise<{ bountyId: string; hunterId: string; status: string; message: string }> {
  const { params, body } = req as ClaimBountyRequest;

  const bounty = mockBounties.find((b) => b.id === params.id);
  if (!bounty) throw new Error('Bounty not found');
  if (bounty.status !== 'open') throw new Error('Bounty is not open for claiming');

  bounty.assigneeId = body.hunterId;
  bounty.status = 'in_progress';

  return {
    bountyId: params.id,
    hunterId: body.hunterId,
    status: 'in_progress',
    message: 'Bounty claimed successfully. Good luck!',
  };
}

interface SubmitBountyRequest {
  params: {
    id: string;
  };
  body: {
    hunterId: string;
    content: string;
    proof: string;
  };
}

async function handleSubmitBounty(
  req: unknown,
  _res: unknown
): Promise<{ submissionId: string; status: string; message: string }> {
  const { params, body } = req as SubmitBountyRequest;

  const bounty = mockBounties.find((b) => b.id === params.id);
  if (!bounty) throw new Error('Bounty not found');

  const newSubmission: BountySubmission = {
    id: `sub_${String(mockSubmissions.length + 1).padStart(3, '0')}`,
    bountyId: params.id,
    submitterId: body.hunterId,
    content: body.content,
    proof: body.proof,
    status: 'submitted',
    reviewedAt: null,
    reviewNote: null,
  };

  mockSubmissions.push(newSubmission);

  return {
    submissionId: newSubmission.id,
    status: 'submitted',
    message: 'Submission received. Review pending.',
  };
}

interface ReviewSubmissionRequest {
  params: {
    id: string;
  };
  body: {
    approved: boolean;
    note: string;
  };
}

async function handleReviewSubmission(
  req: unknown,
  _res: unknown
): Promise<{ submissionId: string; status: string; message: string }> {
  const { params, body } = req as ReviewSubmissionRequest;

  const submission = mockSubmissions.find((s) => s.id === params.id);
  if (!submission) throw new Error('Submission not found');

  submission.status = body.approved ? 'approved' : 'rejected';
  submission.reviewedAt = new Date().toISOString();
  submission.reviewNote = body.note;

  if (body.approved) {
    const bounty = mockBounties.find((b) => b.id === submission.bountyId);
    if (bounty) {
      bounty.status = 'completed';
      bounty.completedAt = new Date().toISOString();
    }
  }

  return {
    submissionId: params.id,
    status: body.approved ? 'approved' : 'rejected',
    message: body.approved
      ? 'Submission approved. Reward will be disbursed.'
      : 'Submission rejected. Please review the feedback.',
  };
}

async function handleGetLeaderboard(
  _req: unknown,
  _res: unknown
): Promise<{ hunters: BountyHunter[]; total: number }> {
  const sorted = [...mockHunters].sort((a, b) => b.reputation - a.reputation);
  return { hunters: sorted, total: sorted.length };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/nation/bounties',
    handler: handleListBounties,
  },
  {
    method: 'GET',
    path: '/nation/bounties/:id',
    handler: handleGetBounty,
  },
  {
    method: 'POST',
    path: '/nation/bounties',
    handler: handleCreateBounty,
  },
  {
    method: 'POST',
    path: '/nation/bounties/:id/claim',
    handler: handleClaimBounty,
  },
  {
    method: 'POST',
    path: '/nation/bounties/:id/submit',
    handler: handleSubmitBounty,
  },
  {
    method: 'POST',
    path: '/nation/bounties/submissions/:id/review',
    handler: handleReviewSubmission,
  },
  {
    method: 'GET',
    path: '/nation/bounties/leaderboard',
    handler: handleGetLeaderboard,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS bounties (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        category TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        reward INTEGER NOT NULL,
        deadline TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        poster_id TEXT NOT NULL,
        assignee_id TEXT,
        tags TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT
      );
    `,
    down: 'DROP TABLE IF EXISTS bounties;',
  },
  {
    version: '002',
    up: `
      CREATE TABLE IF NOT EXISTS bounty_submissions (
        id TEXT PRIMARY KEY,
        bounty_id TEXT NOT NULL,
        submitter_id TEXT NOT NULL,
        content TEXT NOT NULL,
        proof TEXT,
        status TEXT DEFAULT 'submitted',
        reviewed_at TEXT,
        review_note TEXT
      );
    `,
    down: 'DROP TABLE IF EXISTS bounty_submissions;',
  },
  {
    version: '003',
    up: `
      CREATE TABLE IF NOT EXISTS bounty_hunters (
        citizen_id TEXT PRIMARY KEY,
        completed_bounties INTEGER DEFAULT 0,
        total_earnings INTEGER DEFAULT 0,
        reputation INTEGER DEFAULT 0,
        rank TEXT,
        specialties TEXT
      );
    `,
    down: 'DROP TABLE IF EXISTS bounty_hunters;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createBountyPlugin(): SNFPlugin {
  return {
    name: 'snf-bounty',
    version: '0.5.0',
    description:
      'Bounty board — post bounties, claim tasks, earn rewards. Bug bounties to citizen missions.',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
