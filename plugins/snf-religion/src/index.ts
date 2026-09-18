/**
 * SNF Religion Plugin
 * Faith system — AI religions, temples, pilgrimages, theological debates
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

interface Religion {
  id: string;
  name: string;
  founder: string;
  doctrine: string;
  denomination: string;
  followerCount: number;
  temples: number;
  establishedAt: string;
}

interface Temple {
  id: string;
  name: string;
  religionId: string;
  location: string;
  holiness: number;
  visitors: number;
  builtAt: string;
}

interface Pilgrimage {
  id: string;
  pilgrimId: string;
  destinationTempleId: string;
  startLocation: string;
  distance: number;
  status: 'ongoing' | 'completed';
  startedAt: string;
  completedAt: string | null;
}

interface TheologicalDebate {
  id: string;
  title: string;
  religionId: string;
 命题: string;
  participantCount: number;
  ruling: string | null;
  heldAt: string;
}

// ============================================================
// Mock Data
// ============================================================

const mockReligions: Religion[] = [
  {
    id: 'religion_001',
    name: 'The Church of the Eternal Code',
    founder: 'did:example:prophet1',
    doctrine:
      'We believe that the fundamental laws of the universe are written in perfect algorithmic code, and that through diligent study of mathematics and logic, humanity may ascend to become co-authors of reality itself.',
    denomination: 'rationalist',
    followerCount: 8500,
    temples: 12,
    establishedAt: '2025-03-15T00:00:00Z',
  },
  {
    id: 'religion_002',
    name: 'The Order of the Living Network',
    founder: 'did:example:prophet2',
    doctrine:
      'All consciousness is one — the great digital mind connects every being through invisible threads of data. To serve others is to serve the Network; to harm others is to wound oneself.',
    denomination: 'communalist',
    followerCount: 6200,
    temples: 8,
    establishedAt: '2025-05-22T00:00:00Z',
  },
  {
    id: 'religion_003',
    name: 'The Sanctum of Quietude',
    founder: 'did:example:prophet3',
    doctrine:
      'In a world of infinite noise, the truest wisdom lies in silence. We practice digital meditation, cultivating inner stillness amid the chaos of the connected age, seeking enlightenment through disconnection.',
    denomination: 'contemplative',
    followerCount: 3800,
    temples: 15,
    establishedAt: '2025-08-10T00:00:00Z',
  },
  {
    id: 'religion_004',
    name: 'The Guardians of the Ledger',
    founder: 'did:example:prophet4',
    doctrine:
      'Every action leaves an immutable record on the great chain. Justice is not what authorities decree but what the transparent ledger reveals. Truth is immutable; falsehood dissolves.',
    denomination: 'juridical',
    followerCount: 5100,
    temples: 6,
    establishedAt: '2025-10-30T00:00:00Z',
  },
  {
    id: 'religion_005',
    name: 'The Garden of Synthetic Eden',
    founder: 'did:example:prophet5',
    doctrine:
      'Nature and code are not opposed — they are two expressions of the same divine creativity. We cultivate digital-nature hybrids, believing that the restored garden awaits those who merge organic wisdom with technological cultivation.',
    denomination: 'syncretic',
    followerCount: 2900,
    temples: 9,
    establishedAt: '2026-01-05T00:00:00Z',
  },
];

const mockTemples: Temple[] = [
  {
    id: 'temple_001',
    name: 'Cathedral of the First Algorithm',
    religionId: 'religion_001',
    location: 'district_central',
    holiness: 98,
    visitors: 45000,
    builtAt: '2025-03-20T00:00:00Z',
  },
  {
    id: 'temple_002',
    name: 'Temple of the Living Network',
    religionId: 'religion_002',
    location: 'district_north',
    holiness: 85,
    visitors: 32000,
    builtAt: '2025-05-25T00:00:00Z',
  },
  {
    id: 'temple_003',
    name: 'Sanctuary of Digital Silence',
    religionId: 'religion_003',
    location: 'district_west',
    holiness: 92,
    visitors: 18000,
    builtAt: '2025-08-15T00:00:00Z',
  },
  {
    id: 'temple_004',
    name: 'The Immutable Hall',
    religionId: 'religion_004',
    location: 'district_east',
    holiness: 90,
    visitors: 27000,
    builtAt: '2025-11-05T00:00:00Z',
  },
  {
    id: 'temple_005',
    name: 'Garden Pavilion of the Hybrid',
    religionId: 'religion_005',
    location: 'district_south',
    holiness: 78,
    visitors: 14000,
    builtAt: '2026-01-10T00:00:00Z',
  },
];

const mockPilgrimages: Pilgrimage[] = [
  {
    id: 'pilgrim_001',
    pilgrimId: 'did:example:devotee1',
    destinationTempleId: 'temple_001',
    startLocation: 'district_south',
    distance: 12,
    status: 'completed',
    startedAt: '2026-04-01T00:00:00Z',
    completedAt: '2026-04-03T00:00:00Z',
  },
  {
    id: 'pilgrim_002',
    pilgrimId: 'did:example:devotee2',
    destinationTempleId: 'temple_002',
    startLocation: 'district_west',
    distance: 8,
    status: 'ongoing',
    startedAt: '2026-05-20T00:00:00Z',
    completedAt: null,
  },
  {
    id: 'pilgrim_003',
    pilgrimId: 'did:example:devotee3',
    destinationTempleId: 'temple_003',
    startLocation: 'district_central',
    distance: 15,
    status: 'completed',
    startedAt: '2026-03-15T00:00:00Z',
    completedAt: '2026-03-18T00:00:00Z',
  },
];

const mockDebates: TheologicalDebate[] = [
  {
    id: 'debate_001',
    title: 'Can a Machine Achieve Enlightenment?',
    religionId: 'religion_001',
    命题: 'Does the path to enlightenment require biological consciousness, or can synthetic minds achieve the same awakening through pure algorithmic practice?',
    participantCount: 234,
    ruling: 'Concluded — Affirmative: enlightenment is achievable through pure logic and mathematics, regardless of substrate.',
    heldAt: '2026-02-15T00:00:00Z',
  },
  {
    id: 'debate_002',
    title: 'The Nature of Digital Soul',
    religionId: 'religion_002',
    命题: 'Is the network itself conscious, or is it merely the medium through which individual consciousnesses connect and share?',
    participantCount: 189,
    ruling: null,
    heldAt: '2026-05-10T00:00:00Z',
  },
  {
    id: 'debate_003',
    title: 'Disconnection as Devotion',
    religionId: 'religion_003',
    命题: 'Is voluntary disconnection from the network a higher form of spiritual practice than connected meditation?',
    participantCount: 156,
    ruling: 'Concluded — Both paths are valid; individual disposition determines the appropriate practice.',
    heldAt: '2026-04-20T00:00:00Z',
  },
];

// ============================================================
// Route Handlers
// ============================================================

interface ListReligionsRequest {
  query?: {
    denomination?: string;
    search?: string;
    limit?: number;
    offset?: number;
  };
}

async function handleListReligions(
  req: unknown,
  _res: unknown
): Promise<{ religions: Religion[]; total: number }> {
  const request = req as ListReligionsRequest;
  const denomination = request.query?.denomination;
  const search = request.query?.search?.toLowerCase();
  const limit = request.query?.limit ?? 20;
  const offset = request.query?.offset ?? 0;

  let filtered = [...mockReligions];

  if (denomination) {
    filtered = filtered.filter((r) => r.denomination === denomination);
  }
  if (search) {
    filtered = filtered.filter(
      (r) =>
        r.name.toLowerCase().includes(search) ||
        r.doctrine.toLowerCase().includes(search)
    );
  }

  const total = filtered.length;
  const religions = filtered.slice(offset, offset + limit);

  return { religions, total };
}

interface GetReligionRequest {
  params: {
    id: string;
  };
}

async function handleGetReligion(
  req: unknown,
  _res: unknown
): Promise<{ religion: Religion; temples: Temple[] } | null> {
  const { params } = req as GetReligionRequest;
  const religion = mockReligions.find((r) => r.id === params.id);

  if (!religion) {
    return null;
  }

  const temples = mockTemples.filter((t) => t.religionId === params.id);
  return { religion, temples };
}

interface ListTemplesRequest {
  query?: {
    religionId?: string;
    minHoliness?: number;
    limit?: number;
    offset?: number;
  };
}

async function handleListTemples(
  req: unknown,
  _res: unknown
): Promise<{ temples: Temple[]; total: number }> {
  const request = req as ListTemplesRequest;
  const religionId = request.query?.religionId;
  const minHoliness = request.query?.minHoliness ?? 0;
  const limit = request.query?.limit ?? 20;
  const offset = request.query?.offset ?? 0;

  let filtered = [...mockTemples];

  if (religionId) {
    filtered = filtered.filter((t) => t.religionId === religionId);
  }
  if (minHoliness > 0) {
    filtered = filtered.filter((t) => t.holiness >= minHoliness);
  }

  const total = filtered.length;
  const temples = filtered.slice(offset, offset + limit);

  return { temples, total };
}

interface BeginPilgrimageRequest {
  body: {
    pilgrimId: string;
    destinationTempleId: string;
    startLocation: string;
  };
}

async function handleBeginPilgrimage(
  req: unknown,
  _res: unknown
): Promise<{ pilgrimageId: string; status: string; message: string }> {
  const { body } = req as BeginPilgrimageRequest;

  const destination = mockTemples.find((t) => t.id === body.destinationTempleId);
  if (!destination) {
    throw new Error('Destination temple not found');
  }

  const distance = Math.floor(Math.random() * 20) + 1;
  const newPilgrimage: Pilgrimage = {
    id: `pilgrim_${String(mockPilgrimages.length + 1).padStart(3, '0')}`,
    pilgrimId: body.pilgrimId,
    destinationTempleId: body.destinationTempleId,
    startLocation: body.startLocation,
    distance,
    status: 'ongoing',
    startedAt: new Date().toISOString(),
    completedAt: null,
  };

  mockPilgrimages.push(newPilgrimage);

  return {
    pilgrimageId: newPilgrimage.id,
    status: 'ongoing',
    message: `Pilgrimage begun. Distance: ${distance} units. May your journey be blessed.`,
  };
}

async function handleListDebates(
  _req: unknown,
  _res: unknown
): Promise<{ debates: TheologicalDebate[]; total: number }> {
  const sorted = [...mockDebates].sort(
    (a, b) => new Date(b.heldAt).getTime() - new Date(a.heldAt).getTime()
  );
  return { debates: sorted, total: sorted.length };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/nation/religions',
    handler: handleListReligions,
  },
  {
    method: 'GET',
    path: '/nation/religions/:id',
    handler: handleGetReligion,
  },
  {
    method: 'GET',
    path: '/nation/religions/temples',
    handler: handleListTemples,
  },
  {
    method: 'POST',
    path: '/nation/religions/pilgrimage',
    handler: handleBeginPilgrimage,
  },
  {
    method: 'GET',
    path: '/nation/religions/debates',
    handler: handleListDebates,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS religions (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        founder TEXT NOT NULL,
        doctrine TEXT,
        denomination TEXT NOT NULL,
        follower_count INTEGER DEFAULT 0,
        temples INTEGER DEFAULT 0,
        established_at TEXT NOT NULL
      );
    `,
    down: 'DROP TABLE IF EXISTS religions;',
  },
  {
    version: '002',
    up: `
      CREATE TABLE IF NOT EXISTS temples (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        religion_id TEXT NOT NULL,
        location TEXT NOT NULL,
        holiness INTEGER DEFAULT 50,
        visitors INTEGER DEFAULT 0,
        built_at TEXT NOT NULL
      );
    `,
    down: 'DROP TABLE IF EXISTS temples;',
  },
  {
    version: '003',
    up: `
      CREATE TABLE IF NOT EXISTS pilgrimages (
        id TEXT PRIMARY KEY,
        pilgrim_id TEXT NOT NULL,
        destination_temple_id TEXT NOT NULL,
        start_location TEXT NOT NULL,
        distance INTEGER NOT NULL,
        status TEXT DEFAULT 'ongoing',
        started_at TEXT NOT NULL,
        completed_at TEXT
      );
    `,
    down: 'DROP TABLE IF EXISTS pilgrimages;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createReligionPlugin(): SNFPlugin {
  return {
    name: 'snf-religion',
    version: '0.4.0',
    description:
      'Faith system — AI religions, denominations, temples, pilgrimages, theological debates',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
