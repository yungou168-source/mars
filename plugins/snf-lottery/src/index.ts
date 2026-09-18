/**
 * SNF Lottery Plugin
 * National lottery — weekly draws, prize pools, on-chain transparency
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

interface LotteryDraw {
  id: string;
  drawNumber: number;
  drawDate: string;
  winningNumbers: number[];
  jackpotAmount: number;
  winners: {
    tier: string;
    count: number;
    prizePerWinner: number;
  }[];
  totalTicketSales: number;
  totalPrizePool: number;
  transactionHash: string;
}

interface LotteryTicket {
  id: string;
  purchaserId: string;
  numbers: number[];
  drawId: string;
  purchasedAt: string;
  prizeStatus: 'pending' | 'won' | 'lost';
  prizeAmount: number;
}

interface LotteryPool {
  currentJackpot: number;
  ticketPrice: number;
  weeklySales: number;
  nextDrawDate: string;
  totalPrizesAwarded: number;
  totalParticipants: number;
}

// ============================================================
// Mock Data
// ============================================================

const mockDraws: LotteryDraw[] = [
  {
    id: 'draw_2026_20',
    drawNumber: 20,
    drawDate: '2026-05-18T20:00:00Z',
    winningNumbers: [3, 7, 14, 22, 31, 42],
    jackpotAmount: 85000000,
    winners: [
      { tier: 'jackpot', count: 0, prizePerWinner: 0 },
      { tier: 'second', count: 3, prizePerWinner: 120000 },
      { tier: 'third', count: 47, prizePerWinner: 8500 },
      { tier: 'fourth', count: 312, prizePerWinner: 1200 },
      { tier: 'fifth', count: 5821, prizePerWinner: 150 },
    ],
    totalTicketSales: 145000000,
    totalPrizePool: 72500000,
    transactionHash: '0x7f3e9a1b2c4d5e6f8a1b3c5d7e9f2a4b6c8d0e2f',
  },
  {
    id: 'draw_2026_19',
    drawNumber: 19,
    drawDate: '2026-05-11T20:00:00Z',
    winningNumbers: [5, 12, 19, 28, 33, 41],
    jackpotAmount: 78000000,
    winners: [
      { tier: 'jackpot', count: 1, prizePerWinner: 78000000 },
      { tier: 'second', count: 2, prizePerWinner: 145000 },
      { tier: 'third', count: 38, prizePerWinner: 9200 },
      { tier: 'fourth', count: 289, prizePerWinner: 1100 },
      { tier: 'fifth', count: 5102, prizePerWinner: 160 },
    ],
    totalTicketSales: 138000000,
    totalPrizePool: 69000000,
    transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  },
  {
    id: 'draw_2026_18',
    drawNumber: 18,
    drawDate: '2026-05-04T20:00:00Z',
    winningNumbers: [2, 9, 15, 24, 37, 44],
    jackpotAmount: 72000000,
    winners: [
      { tier: 'jackpot', count: 0, prizePerWinner: 0 },
      { tier: 'second', count: 4, prizePerWinner: 98000 },
      { tier: 'third', count: 55, prizePerWinner: 7800 },
      { tier: 'fourth', count: 341, prizePerWinner: 980 },
      { tier: 'fifth', count: 6340, prizePerWinner: 140 },
    ],
    totalTicketSales: 132000000,
    totalPrizePool: 66000000,
    transactionHash: '0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b',
  },
  {
    id: 'draw_2026_17',
    drawNumber: 17,
    drawDate: '2026-04-27T20:00:00Z',
    winningNumbers: [8, 11, 21, 29, 38, 45],
    jackpotAmount: 65000000,
    winners: [
      { tier: 'jackpot', count: 0, prizePerWinner: 0 },
      { tier: 'second', count: 5, prizePerWinner: 85000 },
      { tier: 'third', count: 62, prizePerWinner: 7200 },
      { tier: 'fourth', count: 398, prizePerWinner: 850 },
      { tier: 'fifth', count: 7102, prizePerWinner: 130 },
    ],
    totalTicketSales: 125000000,
    totalPrizePool: 62500000,
    transactionHash: '0x3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d',
  },
  {
    id: 'draw_2026_16',
    drawNumber: 16,
    drawDate: '2026-04-20T20:00:00Z',
    winningNumbers: [1, 16, 23, 30, 35, 40],
    jackpotAmount: 58000000,
    winners: [
      { tier: 'jackpot', count: 2, prizePerWinner: 29000000 },
      { tier: 'second', count: 1, prizePerWinner: 180000 },
      { tier: 'third', count: 29, prizePerWinner: 11000 },
      { tier: 'fourth', count: 267, prizePerWinner: 1200 },
      { tier: 'fifth', count: 4892, prizePerWinner: 180 },
    ],
    totalTicketSales: 119000000,
    totalPrizePool: 59500000,
    transactionHash: '0x5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
  },
];

const mockTickets: LotteryTicket[] = [
  {
    id: 'ticket_001',
    purchaserId: 'did:example:player1',
    numbers: [3, 7, 14, 22, 31, 42],
    drawId: 'draw_2026_20',
    purchasedAt: '2026-05-17T14:30:00Z',
    prizeStatus: 'won',
    prizeAmount: 150,
  },
  {
    id: 'ticket_002',
    purchaserId: 'did:example:player2',
    numbers: [5, 12, 19, 28, 33, 41],
    drawId: 'draw_2026_20',
    purchasedAt: '2026-05-18T09:15:00Z',
    prizeStatus: 'lost',
    prizeAmount: 0,
  },
  {
    id: 'ticket_003',
    purchaserId: 'did:example:player3',
    numbers: [2, 9, 15, 24, 37, 44],
    drawId: 'draw_2026_19',
    purchasedAt: '2026-05-10T16:45:00Z',
    prizeStatus: 'won',
    prizeAmount: 9200,
  },
];

const poolStatus: LotteryPool = {
  currentJackpot: 92000000,
  ticketPrice: 500,
  weeklySales: 152000000,
  nextDrawDate: '2026-05-25T20:00:00Z',
  totalPrizesAwarded: 1250000000,
  totalParticipants: 304000,
};

// ============================================================
// Route Handlers
// ============================================================

async function handleGetJackpot(
  _req: unknown,
  _res: unknown
): Promise<{ pool: LotteryPool; recentDraws: LotteryDraw[] }> {
  return {
    pool: poolStatus,
    recentDraws: mockDraws.slice(0, 3),
  };
}

interface ListDrawsRequest {
  query?: {
    limit?: number;
    offset?: number;
  };
}

async function handleListDraws(
  req: unknown,
  _res: unknown
): Promise<{ draws: LotteryDraw[]; total: number }> {
  const request = req as ListDrawsRequest;
  const limit = request.query?.limit ?? 10;
  const offset = request.query?.offset ?? 0;

  const total = mockDraws.length;
  const draws = mockDraws.slice(offset, offset + limit);

  return { draws, total };
}

interface GetDrawRequest {
  params: {
    id: string;
  };
}

async function handleGetDraw(
  req: unknown,
  _res: unknown
): Promise<LotteryDraw | null> {
  const { params } = req as GetDrawRequest;
  return mockDraws.find((d) => d.id === params.id) ?? null;
}

interface BuyTicketRequest {
  body: {
    purchaserId: string;
    numbers: number[];
    drawId?: string;
  };
}

async function handleBuyTicket(
  req: unknown,
  _res: unknown
): Promise<{
  ticketId: string;
  numbers: number[];
  drawId: string;
  cost: number;
  status: string;
  message: string;
}> {
  const { body } = req as BuyTicketRequest;

  if (body.numbers.length !== 6) {
    throw new Error('A lottery ticket must have exactly 6 numbers');
  }

  for (const n of body.numbers) {
    if (n < 1 || n > 49) {
      throw new Error('Numbers must be between 1 and 49');
    }
  }

  const duplicate = body.numbers.some(
    (n, i) => body.numbers.indexOf(n) !== i
  );
  if (duplicate) {
    throw new Error('Numbers must be unique');
  }

  const drawId = body.drawId ?? 'draw_2026_21';

  const newTicket: LotteryTicket = {
    id: `ticket_${String(mockTickets.length + 1).padStart(3, '0')}`,
    purchaserId: body.purchaserId,
    numbers: body.numbers,
    drawId,
    purchasedAt: new Date().toISOString(),
    prizeStatus: 'pending',
    prizeAmount: 0,
  };

  mockTickets.push(newTicket);

  return {
    ticketId: newTicket.id,
    numbers: newTicket.numbers,
    drawId: newTicket.drawId,
    cost: poolStatus.ticketPrice,
    status: 'confirmed',
    message: `Ticket purchased successfully. Good luck for the ${drawId} draw!`,
  };
}

interface CheckTicketRequest {
  params: {
    id: string;
  };
}

async function handleCheckTicket(
  req: unknown,
  _res: unknown
): Promise<LotteryTicket | null> {
  const { params } = req as CheckTicketRequest;
  return mockTickets.find((t) => t.id === params.id) ?? null;
}

interface ListMyTicketsRequest {
  query?: {
    purchaserId: string;
    drawId?: string;
    status?: string;
  };
}

async function handleListMyTickets(
  req: unknown,
  _res: unknown
): Promise<{ tickets: LotteryTicket[]; total: number }> {
  const request = req as ListMyTicketsRequest;
  const purchaserId = request.query?.purchaserId;
  const drawId = request.query?.drawId;
  const status = request.query?.status;

  let filtered = [...mockTickets];

  if (purchaserId) {
    filtered = filtered.filter((t) => t.purchaserId === purchaserId);
  }
  if (drawId) {
    filtered = filtered.filter((t) => t.drawId === drawId);
  }
  if (status) {
    filtered = filtered.filter((t) => t.prizeStatus === status);
  }

  return { tickets: filtered, total: filtered.length };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/nation/lottery',
    handler: handleGetJackpot,
  },
  {
    method: 'GET',
    path: '/nation/lottery/draws',
    handler: handleListDraws,
  },
  {
    method: 'GET',
    path: '/nation/lottery/draws/:id',
    handler: handleGetDraw,
  },
  {
    method: 'POST',
    path: '/nation/lottery/tickets',
    handler: handleBuyTicket,
  },
  {
    method: 'GET',
    path: '/nation/lottery/tickets/:id',
    handler: handleCheckTicket,
  },
  {
    method: 'GET',
    path: '/nation/lottery/tickets',
    handler: handleListMyTickets,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS lottery_draws (
        id TEXT PRIMARY KEY,
        draw_number INTEGER NOT NULL,
        draw_date TEXT NOT NULL,
        winning_numbers TEXT NOT NULL,
        jackpot_amount INTEGER NOT NULL,
        total_ticket_sales INTEGER NOT NULL,
        total_prize_pool INTEGER NOT NULL,
        transaction_hash TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT NOW()
      );
    `,
    down: 'DROP TABLE IF EXISTS lottery_draws;',
  },
  {
    version: '002',
    up: `
      CREATE TABLE IF NOT EXISTS lottery_tickets (
        id TEXT PRIMARY KEY,
        purchaser_id TEXT NOT NULL,
        numbers TEXT NOT NULL,
        draw_id TEXT NOT NULL,
        purchased_at TEXT NOT NULL,
        prize_status TEXT DEFAULT 'pending',
        prize_amount INTEGER DEFAULT 0
      );
    `,
    down: 'DROP TABLE IF EXISTS lottery_tickets;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createLotteryPlugin(): SNFPlugin {
  return {
    name: 'snf-lottery',
    version: '0.3.0',
    description:
      'National lottery — weekly draws, prize pools funded by ticket sales, on-chain transparency',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
