import type {
  SNFPlugin,
  SNFRoute,
  SNFMigration,
  SNFPluginContext,
} from '@sovereign-nation/core';

export type RelationType = 'friendly' | 'neutral' | 'tense' | 'hostile';
export type TreatyStatus = 'proposed' | 'active' | 'expired' | 'rejected';
export type TreatyType = 'trade' | 'military' | 'cultural' | 'mutual-defense' | 'non-aggression';

export interface DiplomaticRelation {
  id: string;
  entity: string;
  relationType: RelationType;
  embassyUrl: string | null;
  treatyCount: number;
  updatedAt: Date;
}

export interface DiplomaticTreaty {
  id: string;
  parties: string[];
  title: string;
  type: TreatyType;
  status: TreatyStatus;
  signedAt: Date | null;
  expiresAt: Date | null;
}

export interface DiplomaticNewsItem {
  id: string;
  title: string;
  summary: string;
  timestamp: Date;
  relatedEntities?: string[];
  treatyId?: string;
}

export interface CreateTreatyRequest {
  parties: string[];
  title: string;
  type: TreatyType;
  expiresInDays?: number;
}

const diplomacyRelationsMigration: SNFMigration = {
  name: 'create_diplomatic_relations',
  up: `
    CREATE TABLE IF NOT EXISTS diplomatic_relations (
      id TEXT PRIMARY KEY,
      entity TEXT NOT NULL UNIQUE,
      relation_type TEXT NOT NULL CHECK (relation_type IN ('friendly', 'neutral', 'tense', 'hostile')),
      embassy_url TEXT,
      treaty_count INTEGER DEFAULT 0,
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE INDEX IF NOT EXISTS idx_diplomatic_relations_entity ON diplomatic_relations(entity);
    CREATE INDEX IF NOT EXISTS idx_diplomatic_relations_type ON diplomatic_relations(relation_type);
  `,
  down: `
    DROP TABLE IF EXISTS diplomatic_relations;
  `,
};

const diplomaticTreatiesMigration: SNFMigration = {
  name: 'create_diplomatic_treaties',
  up: `
    CREATE TABLE IF NOT EXISTS diplomatic_treaties (
      id TEXT PRIMARY KEY,
      parties TEXT NOT NULL,
      title TEXT NOT NULL,
      type TEXT NOT NULL CHECK (type IN ('trade', 'military', 'cultural', 'mutual-defense', 'non-aggression')),
      status TEXT NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'active', 'expired', 'rejected')),
      signed_at TEXT,
      expires_at TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    
    CREATE INDEX IF NOT EXISTS idx_diplomatic_treaties_parties ON diplomatic_treaties(parties);
    CREATE INDEX IF NOT EXISTS idx_diplomatic_treaties_status ON diplomatic_treaties(status);
    CREATE INDEX IF NOT EXISTS idx_diplomatic_treaties_type ON diplomatic_treaties(type);
  `,
  down: `
    DROP TABLE IF EXISTS diplomatic_treaties;
  `,
};

const diplomaticNewsMigration: SNFMigration = {
  name: 'create_diplomatic_news',
  up: `
    CREATE TABLE IF NOT EXISTS diplomatic_news (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      summary TEXT NOT NULL,
      timestamp TEXT NOT NULL DEFAULT (datetime('now')),
      related_entities TEXT,
      treaty_id TEXT,
      FOREIGN KEY (treaty_id) REFERENCES diplomatic_treaties(id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_diplomatic_news_timestamp ON diplomatic_news(timestamp DESC);
  `,
  down: `
    DROP TABLE IF EXISTS diplomatic_news;
  `,
};

async function getDb(context: SNFPluginContext) {
  const db = await context.getDatabase();
  return db;
}

async function listRelations(context: SNFPluginContext) {
  const db = await getDb(context);
  const rows = await db.all<{
    id: string;
    entity: string;
    relation_type: string;
    embassy_url: string | null;
    treaty_count: number;
    updated_at: string;
  }>(`
    SELECT id, entity, relation_type, embassy_url, treaty_count, updated_at
    FROM diplomatic_relations
    ORDER BY entity ASC
  `);

  return rows.map((row) => ({
    id: row.id,
    entity: row.entity,
    relationType: row.relation_type as RelationType,
    embassyUrl: row.embassy_url,
    treatyCount: row.treaty_count,
    updatedAt: new Date(row.updated_at),
  }));
}

async function getEmbassyDetail(
  context: SNFPluginContext,
  entity: string
): Promise<DiplomaticRelation | null> {
  const db = await getDb(context);
  const row = await db.get<{
    id: string;
    entity: string;
    relation_type: string;
    embassy_url: string | null;
    treaty_count: number;
    updated_at: string;
  }>(
    `SELECT id, entity, relation_type, embassy_url, treaty_count, updated_at
     FROM diplomatic_relations
     WHERE entity = ?`,
    [entity]
  );

  if (!row) {
    return null;
  }

  return {
    id: row.id,
    entity: row.entity,
    relationType: row.relation_type as RelationType,
    embassyUrl: row.embassy_url,
    treatyCount: row.treaty_count,
    updatedAt: new Date(row.updated_at),
  };
}

async function listTreaties(
  context: SNFPluginContext,
  filters?: { status?: TreatyStatus; type?: TreatyType }
): Promise<DiplomaticTreaty[]> {
  const db = await getDb(context);
  let query = 'SELECT id, parties, title, type, status, signed_at, expires_at FROM diplomatic_treaties WHERE 1=1';
  const params: (string | number)[] = [];

  if (filters?.status) {
    query += ' AND status = ?';
    params.push(filters.status);
  }

  if (filters?.type) {
    query += ' AND type = ?';
    params.push(filters.type);
  }

  query += ' ORDER BY created_at DESC';

  const rows = await db.all<{
    id: string;
    parties: string;
    title: string;
    type: string;
    status: string;
    signed_at: string | null;
    expires_at: string | null;
  }>(query, params);

  return rows.map((row) => ({
    id: row.id,
    parties: JSON.parse(row.parties),
    title: row.title,
    type: row.type as TreatyType,
    status: row.status as TreatyStatus,
    signedAt: row.signed_at ? new Date(row.signed_at) : null,
    expiresAt: row.expires_at ? new Date(row.expires_at) : null,
  }));
}

async function proposeTreaty(
  context: SNFPluginContext,
  request: CreateTreatyRequest
): Promise<DiplomaticTreaty> {
  const db = await getDb(context);
  const id = context.generateId();
  const expiresAt = request.expiresInDays
    ? new Date(Date.now() + request.expiresInDays * 24 * 60 * 60 * 1000)
    : null;

  await db.run(
    `INSERT INTO diplomatic_treaties (id, parties, title, type, status, expires_at)
     VALUES (?, ?, ?, ?, 'proposed', ?)`,
    [id, JSON.stringify(request.parties), request.title, request.type, expiresAt?.toISOString() ?? null]
  );

  const treaty: DiplomaticTreaty = {
    id,
    parties: request.parties,
    title: request.title,
    type: request.type,
    status: 'proposed',
    signedAt: null,
    expiresAt,
  };

  for (const party of request.parties) {
    const existingRelation = await db.get<{ id: string }>(
      'SELECT id FROM diplomatic_relations WHERE entity = ?',
      [party]
    );

    if (!existingRelation) {
      const relId = context.generateId();
      await db.run(
        `INSERT INTO diplomatic_relations (id, entity, relation_type, treaty_count)
         VALUES (?, ?, 'neutral', 1)`,
        [relId, party]
      );
    } else {
      await db.run(
        `UPDATE diplomatic_relations SET treaty_count = treaty_count + 1 WHERE entity = ?`,
        [party]
      );
    }
  }

  return treaty;
}

async function listNews(
  context: SNFPluginContext,
  limit = 20
): Promise<DiplomaticNewsItem[]> {
  const db = await getDb(context);
  const rows = await db.all<{
    id: string;
    title: string;
    summary: string;
    timestamp: string;
    related_entities: string | null;
    treaty_id: string | null;
  }>(
    `SELECT id, title, summary, timestamp, related_entities, treaty_id
     FROM diplomatic_news
     ORDER BY timestamp DESC
     LIMIT ?`,
    [limit]
  );

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    summary: row.summary,
    timestamp: new Date(row.timestamp),
    relatedEntities: row.related_entities ? JSON.parse(row.related_entities) : undefined,
    treatyId: row.treaty_id ?? undefined,
  }));
}

function createRoutes(context: SNFPluginContext): SNFRoute[] {
  return [
    {
      method: 'GET',
      path: '/diplomacy',
      handler: async () => {
        const relations = await listRelations(context);
        return {
          status: 200,
          body: { relations },
        };
      },
    },
    {
      method: 'GET',
      path: '/diplomacy/embassy/:entity',
      handler: async ({ params }) => {
        const embassy = await getEmbassyDetail(context, params.entity);
        if (!embassy) {
          return {
            status: 404,
            body: { error: 'Embassy not found for entity' },
          };
        }
        return {
          status: 200,
          body: { embassy },
        };
      },
    },
    {
      method: 'GET',
      path: '/diplomacy/treaties',
      handler: async ({ query }) => {
        const status = query.status as TreatyStatus | undefined;
        const type = query.type as TreatyType | undefined;
        const treaties = await listTreaties(context, { status, type });
        return {
          status: 200,
          body: { treaties },
        };
      },
    },
    {
      method: 'POST',
      path: '/diplomacy/treaties',
      handler: async ({ body }) => {
        const request = body as CreateTreatyRequest;
        if (!request.parties || !request.title || !request.type) {
          return {
            status: 400,
            body: { error: 'Missing required fields: parties, title, type' },
          };
        }
        const treaty = await proposeTreaty(context, request);
        return {
          status: 201,
          body: { treaty },
        };
      },
    },
    {
      method: 'GET',
      path: '/diplomacy/news',
      handler: async ({ query }) => {
        const limit = query.limit ? parseInt(query.limit as string, 10) : 20;
        const news = await listNews(context, limit);
        return {
          status: 200,
          body: { news },
        };
      },
    },
  ];
}

export function createDiplomacyPlugin(): SNFPlugin {
  return {
    name: 'snf-diplomacy',
    version: '1.0.0',
    migrations: [
      diplomacyRelationsMigration,
      diplomaticTreatiesMigration,
      diplomaticNewsMigration,
    ],
    routes: (context: SNFPluginContext) => createRoutes(context),
  };
}

export { listRelations, getEmbassyDetail, listTreaties, proposeTreaty, listNews };
