import type { SNFPlugin, Migration } from '@sovereign-nation/core';

interface Court {
  id: string;
  name: string;
  jurisdiction: string;
  establishedAt: Date;
}

interface CourtCase {
  id: string;
  caseNumber: string;
  plaintiff: string;
  defendant: string;
  courtId: string;
  status: 'filed' | 'hearing' | 'deliberation' | 'decided' | 'appealed';
  verdict?: string;
  sentence?: string;
  filedAt: Date;
  decidedAt?: Date;
}

interface CourtSession {
  id: string;
  caseId: string;
  judge: string;
  recordedAt: Date;
  transcript: string;
}

interface CreateCaseInput {
  plaintiff: string;
  defendant: string;
  courtId: string;
  description: string;
}

export function createJusticePlugin(): SNFPlugin {
  return {
    name: 'snf-justice',
    version: '1.0.0',

    routes: [
      {
        method: 'GET',
        path: '/nation/courts',
        handler: async (ctx) => {
          const db = ctx.database;
          const result = await db.query<Court>(
            'SELECT id, name, jurisdiction, established_at as "establishedAt" FROM courts ORDER BY name'
          );
          return ctx.json({ courts: result.rows });
        },
      },
      {
        method: 'GET',
        path: '/nation/courts/:id',
        handler: async (ctx) => {
          const { id } = ctx.params;
          const db = ctx.database;
          const result = await db.query<Court>(
            'SELECT id, name, jurisdiction, established_at as "establishedAt" FROM courts WHERE id = $1',
            [id]
          );
          if (result.rows.length === 0) {
            return ctx.json({ error: 'Court not found' }, 404);
          }
          return ctx.json({ court: result.rows[0] });
        },
      },
      {
        method: 'POST',
        path: '/nation/courts/:courtId/cases',
        handler: async (ctx) => {
          const { courtId } = ctx.params;
          const body = ctx.body as CreateCaseInput;
          const db = ctx.database;

          const caseNumber = `CASE-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;

          const result = await db.query<CourtCase>(
            `INSERT INTO court_cases (case_number, plaintiff, defendant, court_id, status, filed_at)
             VALUES ($1, $2, $3, $4, 'filed', NOW())
             RETURNING id, case_number as "caseNumber", plaintiff, defendant, court_id as "courtId",
                       status, verdict, sentence, filed_at as "filedAt", decided_at as "decidedAt"`,
            [caseNumber, body.plaintiff, body.defendant, courtId]
          );

          return ctx.json({ case: result.rows[0] }, 201);
        },
      },
      {
        method: 'GET',
        path: '/nation/courts/:courtId/cases',
        handler: async (ctx) => {
          const { courtId } = ctx.params;
          const db = ctx.database;
          const result = await db.query<CourtCase>(
            `SELECT id, case_number as "caseNumber", plaintiff, defendant, court_id as "courtId",
                    status, verdict, sentence, filed_at as "filedAt", decided_at as "decidedAt"
             FROM court_cases
             WHERE court_id = $1
             ORDER BY filed_at DESC`,
            [courtId]
          );
          return ctx.json({ cases: result.rows });
        },
      },
    ],

    migrations: [
      {
        name: 'create_court_cases',
        up: `
          CREATE TABLE IF NOT EXISTS court_cases (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            case_number VARCHAR(50) UNIQUE NOT NULL,
            plaintiff TEXT NOT NULL,
            defendant TEXT NOT NULL,
            court_id UUID NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'filed',
            verdict TEXT,
            sentence TEXT,
            filed_at TIMESTAMP NOT NULL DEFAULT NOW(),
            decided_at TIMESTAMP
          );

          CREATE INDEX idx_court_cases_court_id ON court_cases(court_id);
          CREATE INDEX idx_court_cases_status ON court_cases(status);
        `,
        down: 'DROP TABLE IF EXISTS court_cases;',
      } as Migration,
      {
        name: 'create_court_sessions',
        up: `
          CREATE TABLE IF NOT EXISTS court_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            case_id UUID NOT NULL REFERENCES court_cases(id) ON DELETE CASCADE,
            judge TEXT NOT NULL,
            recorded_at TIMESTAMP NOT NULL DEFAULT NOW(),
            transcript TEXT NOT NULL
          );

          CREATE INDEX idx_court_sessions_case_id ON court_sessions(case_id);
        `,
        down: 'DROP TABLE IF EXISTS court_sessions;',
      } as Migration,
    ],

    hooks: [
      {
        event: 'proposal.passed',
        handler: async (ctx, event) => {
          const db = ctx.database;
          const proposal = event.data;

          await db.query(
            `INSERT INTO court_cases (case_number, plaintiff, defendant, court_id, status, filed_at)
             VALUES ($1, $2, $3, $4, 'filed', NOW())`,
            [
              `AMEND-${Date.now()}`,
              'Constitutional Review Board',
              `Amendment #${proposal.id}`,
              ctx.config.courts?.constitutionalCourtId || '00000000-0000-0000-0000-000000000000',
            ]
          );

          ctx.logger.info(`Created constitutional amendment review for proposal ${proposal.id}`);
        },
      },
    ],
  };
}

export type { Court, CourtCase, CourtSession, CreateCaseInput };
