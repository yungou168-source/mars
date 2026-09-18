/**
 * SNF Party Plugin
 * Political party system — party formation, manifestos, member management
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

interface PoliticalParty {
  id: string;
  name: string;
  leader: string;
  manifesto: string;
  memberCount: number;
  createdAt: string;
}

interface PartyMember {
  partyId: string;
  citizenId: string;
  role: 'leader' | 'executive' | 'officer' | 'member';
  joinedAt: string;
}

// ============================================================
// Mock Data
// ============================================================

const mockParties: PoliticalParty[] = [
  {
    id: 'party_001',
    name: 'Progressive Future Party',
    leader: 'did:example:leader1',
    manifesto:
      'Building a sustainable future through innovation, education, and inclusive growth. We advocate for technological advancement while maintaining social cohesion and environmental responsibility.',
    memberCount: 2500,
    createdAt: '2025-06-15T00:00:00Z',
  },
  {
    id: 'party_002',
    name: 'National Unity Coalition',
    leader: 'did:example:leader2',
    manifesto:
      'Unity and prosperity for all citizens. We believe in strong communities, economic stability, and maintaining traditional values while embracing necessary progress.',
    memberCount: 1850,
    createdAt: '2025-08-20T00:00:00Z',
  },
  {
    id: 'party_003',
    name: 'Liberty Forward Movement',
    leader: 'did:example:leader3',
    manifesto:
      'Defending individual liberties, free markets, and limited government. We champion personal responsibility and economic freedom as the foundations of a thriving society.',
    memberCount: 1200,
    createdAt: '2025-10-05T00:00:00Z',
  },
  {
    id: 'party_004',
    name: 'Green Horizon Alliance',
    leader: 'did:example:leader4',
    manifesto:
      'Environmental stewardship and sustainable development are our core priorities. We advocate for green policies, renewable energy, and ecological preservation.',
    memberCount: 980,
    createdAt: '2025-11-12T00:00:00Z',
  },
  {
    id: 'party_005',
    name: 'Digital Republic Party',
    leader: 'did:example:leader5',
    manifesto:
      'Modernizing governance through technology. We support digital identity, transparent governance, and leveraging technology for citizen empowerment.',
    memberCount: 750,
    createdAt: '2026-01-20T00:00:00Z',
  },
];

const mockMembers: PartyMember[] = [
  {
    partyId: 'party_001',
    citizenId: 'did:example:member1',
    role: 'executive',
    joinedAt: '2025-06-16T00:00:00Z',
  },
  {
    partyId: 'party_001',
    citizenId: 'did:example:member2',
    role: 'officer',
    joinedAt: '2025-06-20T00:00:00Z',
  },
  {
    partyId: 'party_001',
    citizenId: 'did:example:member3',
    role: 'member',
    joinedAt: '2025-07-01T00:00:00Z',
  },
  {
    partyId: 'party_002',
    citizenId: 'did:example:member4',
    role: 'executive',
    joinedAt: '2025-08-21T00:00:00Z',
  },
];

// ============================================================
// Route Handlers
// ============================================================

interface ListPartiesRequest {
  query?: {
    search?: string;
    limit?: number;
    offset?: number;
  };
}

async function handleListParties(
  req: unknown,
  _res: unknown
): Promise<{ parties: PoliticalParty[]; total: number }> {
  const request = req as ListPartiesRequest;
  const search = request.query?.search?.toLowerCase();
  const limit = request.query?.limit ?? 20;
  const offset = request.query?.offset ?? 0;

  let filtered = [...mockParties];

  if (search) {
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(search) ||
        p.manifesto.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const parties = filtered.slice(offset, offset + limit);

  return { parties, total };
}

interface RegisterPartyRequest {
  body: {
    name: string;
    leader: string;
    manifesto: string;
  };
}

async function handleRegisterParty(
  req: unknown,
  _res: unknown
): Promise<{
  partyId: string;
  name: string;
  status: string;
  message: string;
}> {
  const { body } = req as RegisterPartyRequest;

  const newParty: PoliticalParty = {
    id: `party_${String(mockParties.length + 1).padStart(3, '0')}`,
    name: body.name,
    leader: body.leader,
    manifesto: body.manifesto,
    memberCount: 1,
    createdAt: new Date().toISOString(),
  };

  mockParties.push(newParty);

  return {
    partyId: newParty.id,
    name: newParty.name,
    status: 'registered',
    message: 'Party registered successfully',
  };
}

interface GetPartyDetailRequest {
  params: {
    id: string;
  };
}

async function handleGetPartyDetail(
  req: unknown,
  _res: unknown
): Promise<{ party: PoliticalParty & { members: PartyMember[] } } | null> {
  const { params } = req as GetPartyDetailRequest;
  const party = mockParties.find((p) => p.id === params.id);

  if (!party) {
    return null;
  }

  const members = mockMembers.filter((m) => m.partyId === params.id);

  return { party: { ...party, members } };
}

interface JoinPartyRequest {
  params: {
    id: string;
  };
  body: {
    citizenId: string;
  };
}

async function handleJoinParty(
  req: unknown,
  _res: unknown
): Promise<{
  status: string;
  partyId: string;
  memberId: string;
  joinedAt: string;
  message: string;
}> {
  const { params, body } = req as JoinPartyRequest;

  const party = mockParties.find((p) => p.id === params.id);
  if (!party) {
    throw new Error('Party not found');
  }

  const existingMember = mockMembers.find(
    (m) => m.partyId === params.id && m.citizenId === body.citizenId
  );
  if (existingMember) {
    throw new Error('Already a member of this party');
  }

  const newMember: PartyMember = {
    partyId: params.id,
    citizenId: body.citizenId,
    role: 'member',
    joinedAt: new Date().toISOString(),
  };

  mockMembers.push(newMember);
  party.memberCount += 1;

  return {
    status: 'success',
    partyId: params.id,
    memberId: body.citizenId,
    joinedAt: newMember.joinedAt,
    message: `Successfully joined ${party.name}`,
  };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/nation/parties',
    handler: handleListParties,
  },
  {
    method: 'POST',
    path: '/nation/parties',
    handler: handleRegisterParty,
  },
  {
    method: 'GET',
    path: '/nation/parties/:id',
    handler: handleGetPartyDetail,
  },
  {
    method: 'POST',
    path: '/nation/parties/:id/join',
    handler: handleJoinParty,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS political_parties (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        leader TEXT NOT NULL,
        manifesto TEXT,
        member_count INTEGER DEFAULT 0,
        created_at TEXT NOT NULL
      );
    `,
    down: 'DROP TABLE IF EXISTS political_parties;',
  },
  {
    version: '002',
    up: `
      CREATE TABLE IF NOT EXISTS party_members (
        party_id TEXT NOT NULL,
        citizen_id TEXT NOT NULL,
        role TEXT DEFAULT 'member',
        joined_at TEXT NOT NULL,
        PRIMARY KEY (party_id, citizen_id)
      );
    `,
    down: 'DROP TABLE IF EXISTS party_members;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createPartyPlugin(): SNFPlugin {
  return {
    name: 'snf-party',
    version: '1.0.0',
    description:
      'Political party system — party formation, manifestos, member management',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
