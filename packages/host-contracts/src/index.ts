/**
 * Core type definitions for the Sovereign Nation Framework.
 * These types are used across all engine modules and are versioned together.
 * Breaking changes require a major version bump.
 */

// ============================================================
// Nation Configuration
// ============================================================

export interface NationMeta {
  id: string;
  name: string;
  nameEn: string;
  motto: string;
  language: string;
  established: string;
  chain: string;
  rpcEndpoint: string;
}

export interface TokenConfig {
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: number;
  distribution: {
    community: number;
    team: number;
    treasury: number;
  };
}

export interface VisualTheme {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  fontDisplay: string;
  fontBody: string;
  logo: string;
  flag: string;
  emblem: string;
}

export interface NarrativeContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutText: string;
  citizenStory: string;
  valuesDeclaration: string;
}

export interface ProposalRules {
  depositAmount: number;
  votingPeriod: number;
  quorumPercent: number;
}

export interface ElectionRules {
  termDays: number;
  quorumPercent: number;
}

export interface TaxRules {
  incomeRate: number;
  transactionRate: number;
  propertyRate: number;
}

export interface UBIRules {
  dailyAmount: number;
  eligibleRanks: string[];
}

export interface RuleSet {
  proposal: ProposalRules;
  election: ElectionRules;
  tax: TaxRules;
  ubi: UBIRules;
}

export interface PluginEntry {
  districts?: unknown[];
  clockSpeed?: number;
  maxCitizens?: number;
  [key: string]: unknown;
}

export interface PluginConfig {
  enabled: string[];
  config: Record<string, PluginEntry>;
}

export interface NationTheme {
  nation: NationMeta;
  token: TokenConfig;
  theme: VisualTheme;
  narrative: NarrativeContent;
  rules: RuleSet;
  plugins: PluginConfig;
}

// ============================================================
// Identity Engine
// ============================================================

export type CitizenRank = 'Visitor' | 'Citizen' | 'Senior' | 'Elder' | 'Patriarch';

export type CitizenType = 'human' | 'ai';

export interface CitizenMeta {
  did: string;
  name: string;
  type: CitizenType;
  rank: CitizenRank;
  registeredAt: string;
}

export interface Citizen extends CitizenMeta {
  reputation: number;
  stakedAmount: number;
  taxPaid: number;
  proposalsCreated: number;
  votesCast: number;
}

export interface ZKPProof {
  publicInputs: string[];
  proof: string;
  verificationKey: string;
}

export interface IdentityService {
  register(did: string, metadata: Omit<CitizenMeta, 'did' | 'registeredAt'>): Promise<Citizen>;
  resolve(did: string): Promise<Citizen | null>;
  verifyAI(entity: string, proof: ZKPProof): Promise<boolean>;
  updateReputation(did: string, delta: number): Promise<void>;
  list(params?: { rank?: CitizenRank; type?: CitizenType; limit?: number; offset?: number }): Promise<Citizen[]>;
}

// ============================================================
// Economy Engine
// ============================================================

export interface Transaction {
  id: string;
  from: string;
  to: string;
  amount: number;
  token: string;
  timestamp: string;
  type: 'transfer' | 'mint' | 'burn' | 'stake' | 'unstake' | 'tax' | 'ubi';
}

export interface StakeReceipt {
  id: string;
  holder: string;
  amount: number;
  duration: number;
  startTime: string;
  endTime: string;
  rewards: number;
}

export interface TaxReceipt {
  id: string;
  citizenId: string;
  amount: number;
  period: string;
  timestamp: string;
  status: 'pending' | 'paid' | 'overdue';
}

export interface UBIPayment {
  id: string;
  citizenId: string;
  amount: number;
  timestamp: string;
  status: 'pending' | 'paid';
}

export interface TreasuryStats {
  balance: number;
  totalIncome: number;
  totalExpense: number;
  pendingUBI: number;
  pendingTaxCollection: number;
}

export interface EconomyService {
  mint(to: string, amount: number): Promise<Transaction>;
  transfer(from: string, to: string, amount: number): Promise<Transaction>;
  stake(holder: string, amount: number, duration: number): Promise<StakeReceipt>;
  unstake(receiptId: string): Promise<Transaction>;
  collectTax(citizenId: string): Promise<TaxReceipt>;
  distributeUBI(): Promise<UBIPayment[]>;
  getTreasuryStats(): Promise<TreasuryStats>;
  getTransactions(address: string, limit?: number): Promise<Transaction[]>;
  getStakes(holder: string): Promise<StakeReceipt[]>;
}

// ============================================================
// Governance Engine
// ============================================================

export type ProposalStatus = 'draft' | 'discussion' | 'voting' | 'passed' | 'rejected' | 'executed' | 'failed';

export type VoteChoice = 'yes' | 'no' | 'abstain';

export interface ProposalContent {
  title: string;
  description: string;
  category: 'treasury' | 'governance' | 'infrastructure' | 'social' | 'external';
  funding?: number;
}

export interface Vote {
  voter: string;
  choice: VoteChoice;
  weight: number;
  timestamp: string;
}

export interface Proposal {
  id: string;
  author: string;
  status: ProposalStatus;
  content: ProposalContent;
  deposit: number;
  votes: {
    yes: number;
    no: number;
    abstain: number;
    total: number;
  };
  quorumRequired: number;
  votingStart: string;
  votingEnd: string;
  createdAt: string;
}

export interface VoteResult {
  proposalId: string;
  status: ProposalStatus;
  votes: {
    yes: number;
    no: number;
    abstain: number;
    total: number;
  };
  passed: boolean;
  reason?: string;
}

export type ElectionType = 'president' | 'house' | 'senate';

export interface Candidate {
  id: string;
  name: string;
  party?: string;
  votes: number;
  status: 'registered' | 'approved' | 'rejected';
}

export interface Election {
  id: string;
  type: ElectionType;
  status: 'upcoming' | 'active' | 'ended';
  candidates: Candidate[];
  startTime: string;
  endTime: string;
  winner?: string;
}

export interface Party {
  id: string;
  name: string;
  leader: string;
  manifesto: string;
  memberCount: number;
  createdAt: string;
}

export interface GovernanceService {
  createProposal(citizen: string, content: ProposalContent, deposit: number): Promise<Proposal>;
  getProposal(id: string): Promise<Proposal | null>;
  listProposals(params?: { status?: ProposalStatus; author?: string; limit?: number; offset?: number }): Promise<Proposal[]>;
  vote(proposalId: string, voter: string, choice: VoteChoice, weight: number): Promise<void>;
  tallyVotes(proposalId: string): Promise<VoteResult>;
  startElection(type: ElectionType, startTime: string, endTime: string): Promise<Election>;
  getElection(id: string): Promise<Election | null>;
  listElections(params?: { status?: Election['status']; type?: ElectionType }): Promise<Election[]>;
  registerCandidate(electionId: string, name: string, party?: string): Promise<Candidate>;
  registerParty(name: string, manifesto: string, leader: string): Promise<Party>;
  getParty(id: string): Promise<Party | null>;
  listParties(): Promise<Party[]>;
}

// ============================================================
// Event Engine
// ============================================================

export interface ScheduledTask {
  id: string;
  cron: string;
  handler: () => Promise<void>;
  lastRun?: string;
  nextRun?: string;
  enabled: boolean;
}

export interface RealTimeEvent {
  type: string;
  data: unknown;
  timestamp: string;
}

export interface EventHandler {
  (data: unknown): Promise<void>;
}

export interface EventEngine {
  schedule(cron: string, handler: () => Promise<void>, id?: string): ScheduledTask;
  cancel(id: string): boolean;
  emit(type: string, data: unknown): void;
  on(type: string, handler: EventHandler): () => void;
  off(type: string, handler: EventHandler): void;
  listScheduled(): ScheduledTask[];
  start(): Promise<void>;
  stop(): Promise<void>;
}

// ============================================================
// Plugin System
// ============================================================

export interface RouteDefinition {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  handler: (req: unknown, res: unknown) => Promise<unknown>;
  schema?: unknown;
}

export interface DatabaseMigration {
  version: string;
  up: string;
  down?: string;
}

export interface PluginHooks {
  [event: string]: ((data: unknown) => Promise<void>) | undefined;
}

export interface SNFPlugin {
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];

  onInit(engine: SNFEngine): Promise<void>;
  onDestroy?(): Promise<void>;

  hooks?: PluginHooks;
  routes?: RouteDefinition[];
  migrations?: DatabaseMigration[];
}

export interface SNFEngine {
  theme: NationTheme;
  identity: IdentityService;
  economy: EconomyService;
  governance: GovernanceService;
  events: EventEngine;
  db: DatabaseAdapter;
  router: RouterAdapter;
  notify(citizenId: string, notificationType: string, data?: unknown): Promise<void>;
}

export interface DatabaseAdapter {
  query<T = unknown>(sql: string, params?: unknown[]): Promise<T[]>;
  run(sql: string, params?: unknown[]): Promise<{ lastInsertRowid: number; changes: number }>;
  migrate(migration: DatabaseMigration): Promise<void>;
  transaction<T>(fn: () => Promise<T>): Promise<T>;
}

export interface RouterAdapter {
  register(routes: RouteDefinition[]): void;
  unregister(pluginName: string): void;
}

export interface PluginHost {
  register(plugin: SNFPlugin): Promise<void>;
  unregister(name: string): Promise<void>;
  get(name: string): SNFPlugin | undefined;
  list(): SNFPlugin[];
  initAll(engine: SNFEngine): Promise<void>;
  destroyAll(): Promise<void>;
}

// ============================================================
// Utility types
// ============================================================

export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  limit: number;
  offset: number;
}

export type UUBIRules = UBIRules;

