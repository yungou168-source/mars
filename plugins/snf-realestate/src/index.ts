/**
 * SNF Real Estate Plugin
 * NFT property trading — land ownership, property management, marketplace
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

type PropertyType = 'residential' | 'commercial' | 'industrial' | 'agricultural' | 'mixed_use' | 'heritage';
type ListingStatus = 'active' | 'sold' | 'withdrawn' | 'expired';
type Currency = 'TOKEN' | 'NFT';

interface Property {
  id: string;
  name: string;
  description: string;
  propertyType: PropertyType;
  location: string;
  district: string;
  size: number;
  price: number;
  currency: Currency;
  ownerId: string;
  listingStatus: ListingStatus;
  tokenId: string;
  features: string[];
  yearBuilt: number;
  listedAt: string;
  soldAt: string | null;
  transactionHash: string | null;
}

interface PropertyListing {
  id: string;
  propertyId: string;
  sellerId: string;
  askingPrice: number;
  currency: Currency;
  status: 'active' | 'pending' | 'sold' | 'withdrawn';
  views: number;
  inquiries: number;
  expiresAt: string;
  createdAt: string;
}

interface Rental {
  id: string;
  propertyId: string;
  landlordId: string;
  tenantId: string;
  monthlyRent: number;
  deposit: number;
  status: 'active' | 'expired' | 'terminated';
  startDate: string;
  endDate: string | null;
  nextPaymentDue: string;
}

interface MarketStats {
  totalListings: number;
  totalVolume: number;
  averagePrice: number;
  medianPrice: number;
  pricePerSqm: number;
  transactionsThisMonth: number;
  topDistrict: string;
}

// ============================================================
// Mock Data
// ============================================================

const mockProperties: Property[] = [
  {
    id: 'prop_001',
    name: 'The Obsidian Tower',
    description: 'A towering 40-story mixed-use skyscraper in the heart of Central District. Features retail on the first three floors, office spaces from floors 4-25, and luxury residences from floor 26 upward. panoramic city views.',
    propertyType: 'mixed_use',
    location: 'Central District, Block A-7',
    district: 'central',
    size: 28000,
    price: 450000000,
    currency: 'TOKEN',
    ownerId: 'did:example:owner1',
    listingStatus: 'active',
    tokenId: 'NFT-REAL-000001',
    features: ['gym', 'rooftop_garden', 'underground_parking', '24h_security', 'smart_home', 'concierge'],
    yearBuilt: 2024,
    listedAt: '2026-05-01T00:00:00Z',
    soldAt: null,
    transactionHash: null,
  },
  {
    id: 'prop_002',
    name: 'The Verdant Farms Estate',
    description: 'A sprawling 50-hectare agricultural estate with fertile soil, advanced irrigation systems, and three residential farmhouses. Certified organic operation with established supply contracts.',
    propertyType: 'agricultural',
    location: 'Southern Farmlands, Sector 12',
    district: 'south',
    size: 500000,
    price: 125000000,
    currency: 'TOKEN',
    ownerId: 'did:example:owner2',
    listingStatus: 'active',
    tokenId: 'NFT-REAL-000002',
    features: ['irrigation_system', 'greenhouses', 'barn', 'residence', 'organic_certified', 'solar_panels'],
    yearBuilt: 2020,
    listedAt: '2026-04-15T00:00:00Z',
    soldAt: null,
    transactionHash: null,
  },
  {
    id: 'prop_003',
    name: 'Heritage Silk Merchant House',
    description: 'A meticulously restored 18th-century heritage building in the Cultural Quarter. Original architectural features preserved while incorporating modern amenities. Ideal for boutique hotel or cultural center.',
    propertyType: 'heritage',
    location: 'Cultural Quarter, Riverside Lane 14',
    district: 'east',
    size: 3200,
    price: 85000000,
    currency: 'TOKEN',
    ownerId: 'did:example:owner3',
    listingStatus: 'active',
    tokenId: 'NFT-REAL-000003',
    features: ['original_facade', 'courtyard', 'restored_interior', 'heritage_listed', 'events_space'],
    yearBuilt: 1805,
    listedAt: '2026-05-10T00:00:00Z',
    soldAt: null,
    transactionHash: null,
  },
  {
    id: 'prop_004',
    name: 'Northgate Industrial Complex',
    description: 'A modern light industrial facility with 10,000 sqm of warehouse space, loading docks, and administrative offices. High-speed internet and 3-phase power. Excellent logistics location near the northern interchange.',
    propertyType: 'industrial',
    location: 'Northgate Industrial Zone, Lot 23',
    district: 'north',
    size: 10000,
    price: 68000000,
    currency: 'TOKEN',
    ownerId: 'did:example:owner4',
    listingStatus: 'active',
    tokenId: 'NFT-REAL-000004',
    features: ['loading_docks', 'warehouse', 'offices', '3_phase_power', 'high_speed_internet', 'security_fenced'],
    yearBuilt: 2022,
    listedAt: '2026-05-05T00:00:00Z',
    soldAt: null,
    transactionHash: null,
  },
  {
    id: 'prop_005',
    name: 'Azure Waterside Residence',
    description: 'An exclusive waterfront villa with private dock access and unobstructed views of the marina. Modern minimalist design with floor-to-ceiling windows, home automation, and a private garden with pool.',
    propertyType: 'residential',
    location: 'Marina Bay, Waterfront Crescent 8',
    district: 'west',
    size: 850,
    price: 35000000,
    currency: 'TOKEN',
    ownerId: 'did:example:owner5',
    listingStatus: 'active',
    tokenId: 'NFT-REAL-000005',
    features: ['private_dock', 'pool', 'smart_home', 'home_cinema', 'wine_cellar', 'marina_views', 'private_garden'],
    yearBuilt: 2023,
    listedAt: '2026-05-18T00:00:00Z',
    soldAt: null,
    transactionHash: null,
  },
  {
    id: 'prop_006',
    name: 'Tech Hub Innovation Center',
    description: 'A state-of-the-art commercial building purpose-built for technology startups and R&D facilities. Includes server rooms, collaboration spaces, a makerspace, and rooftop event venue.',
    propertyType: 'commercial',
    location: 'Innovation District, Block Tech-4',
    district: 'central',
    size: 6000,
    price: 92000000,
    currency: 'TOKEN',
    ownerId: 'did:example:owner6',
    listingStatus: 'sold',
    tokenId: 'NFT-REAL-000006',
    features: ['server_rooms', 'makerspace', 'event_venue', 'collaboration_labs', 'rooftop_terrace', 'bike_storage'],
    yearBuilt: 2025,
    listedAt: '2026-03-01T00:00:00Z',
    soldAt: '2026-04-20T00:00:00Z',
    transactionHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b',
  },
];

const mockListings: PropertyListing[] = [
  {
    id: 'listing_001',
    propertyId: 'prop_001',
    sellerId: 'did:example:owner1',
    askingPrice: 450000000,
    currency: 'TOKEN',
    status: 'active',
    views: 1243,
    inquiries: 28,
    expiresAt: '2026-06-01T00:00:00Z',
    createdAt: '2026-05-01T00:00:00Z',
  },
  {
    id: 'listing_002',
    propertyId: 'prop_002',
    sellerId: 'did:example:owner2',
    askingPrice: 125000000,
    currency: 'TOKEN',
    status: 'active',
    views: 567,
    inquiries: 12,
    expiresAt: '2026-05-30T00:00:00Z',
    createdAt: '2026-04-15T00:00:00Z',
  },
  {
    id: 'listing_003',
    propertyId: 'prop_003',
    sellerId: 'did:example:owner3',
    askingPrice: 85000000,
    currency: 'TOKEN',
    status: 'active',
    views: 892,
    inquiries: 19,
    expiresAt: '2026-06-10T00:00:00Z',
    createdAt: '2026-05-10T00:00:00Z',
  },
];

const mockRentals: Rental[] = [
  {
    id: 'rental_001',
    propertyId: 'prop_006',
    landlordId: 'did:example:owner6',
    tenantId: 'did:example:tenant1',
    monthlyRent: 450000,
    deposit: 900000,
    status: 'active',
    startDate: '2026-04-20T00:00:00Z',
    endDate: null,
    nextPaymentDue: '2026-06-20T00:00:00Z',
  },
];

const marketStats: MarketStats = {
  totalListings: 12,
  totalVolume: 1850000000,
  averagePrice: 125000000,
  medianPrice: 85000000,
  pricePerSqm: 4500,
  transactionsThisMonth: 5,
  topDistrict: 'central',
};

// ============================================================
// Route Handlers
// ============================================================

interface ListPropertiesRequest {
  query?: {
    type?: PropertyType;
    district?: string;
    minPrice?: number;
    maxPrice?: number;
    status?: ListingStatus;
    limit?: number;
    offset?: number;
  };
}

async function handleListProperties(
  req: unknown,
  _res: unknown
): Promise<{ properties: Property[]; total: number }> {
  const request = req as ListPropertiesRequest;
  const type = request.query?.type;
  const district = request.query?.district;
  const minPrice = request.query?.minPrice ?? 0;
  const maxPrice = request.query?.maxPrice ?? Infinity;
  const status = request.query?.status;
  const limit = request.query?.limit ?? 20;
  const offset = request.query?.offset ?? 0;

  let filtered = [...mockProperties];

  if (type) filtered = filtered.filter((p) => p.propertyType === type);
  if (district) filtered = filtered.filter((p) => p.district === district);
  if (minPrice > 0) filtered = filtered.filter((p) => p.price >= minPrice);
  if (maxPrice < Infinity) filtered = filtered.filter((p) => p.price <= maxPrice);
  if (status) filtered = filtered.filter((p) => p.listingStatus === status);

  const total = filtered.length;
  const properties = filtered.slice(offset, offset + limit);

  return { properties, total };
}

interface GetPropertyRequest {
  params: {
    id: string;
  };
}

async function handleGetProperty(
  req: unknown,
  _res: unknown
): Promise<Property | null> {
  const { params } = req as GetPropertyRequest;
  return mockProperties.find((p) => p.id === params.id) ?? null;
}

interface ListMarketRequest {
  query?: {
    district?: string;
    propertyType?: PropertyType;
    sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular';
  };
}

async function handleListMarket(
  req: unknown,
  _res: unknown
): Promise<{ listings: (PropertyListing & { property: Property })[]; stats: MarketStats }> {
  const request = req as ListMarketRequest;
  const district = request.query?.district;
  const propertyType = request.query?.propertyType;
  const sortBy = request.query?.sortBy ?? 'newest';

  let enriched = mockListings
    .filter((l) => l.status === 'active')
    .map((l) => ({
      ...l,
      property: mockProperties.find((p) => p.id === l.propertyId)!,
    }))
    .filter((l) => l.property != null);

  if (district) enriched = enriched.filter((l) => l.property.district === district);
  if (propertyType) enriched = enriched.filter((l) => l.property.propertyType === propertyType);

  switch (sortBy) {
    case 'price_asc':
      enriched.sort((a, b) => a.askingPrice - b.askingPrice);
      break;
    case 'price_desc':
      enriched.sort((a, b) => b.askingPrice - a.askingPrice);
      break;
    case 'popular':
      enriched.sort((a, b) => b.views - a.views);
      break;
    case 'newest':
    default:
      enriched.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  return { listings: enriched, stats: marketStats };
}

interface ListOwnerPropertiesRequest {
  query?: {
    ownerId: string;
  };
}

async function handleListOwnerProperties(
  req: unknown,
  _res: unknown
): Promise<{ properties: Property[]; total: number }> {
  const request = req as ListOwnerPropertiesRequest;
  const ownerId = request.query?.ownerId;
  if (!ownerId) throw new Error('ownerId is required');

  const properties = mockProperties.filter((p) => p.ownerId === ownerId);
  return { properties, total: properties.length };
}

interface ListRentalsRequest {
  query?: {
    status?: 'active' | 'expired' | 'terminated';
    limit?: number;
    offset?: number;
  };
}

async function handleListRentals(
  req: unknown,
  _res: unknown
): Promise<{ rentals: Rental[]; total: number }> {
  const request = req as ListRentalsRequest;
  const status = request.query?.status;
  const limit = request.query?.limit ?? 20;
  const offset = request.query?.offset ?? 0;

  let filtered = [...mockRentals];
  if (status) filtered = filtered.filter((r) => r.status === status);

  const total = filtered.length;
  const rentals = filtered.slice(offset, offset + limit);

  return { rentals, total };
}

async function handleGetMarketStats(
  _req: unknown,
  _res: unknown
): Promise<{ stats: MarketStats; recentSales: Property[] }> {
  const recentSales = mockProperties.filter((p) => p.listingStatus === 'sold').slice(0, 5);
  return { stats: marketStats, recentSales };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/nation/realestate',
    handler: handleListProperties,
  },
  {
    method: 'GET',
    path: '/nation/realestate/properties/:id',
    handler: handleGetProperty,
  },
  {
    method: 'GET',
    path: '/nation/realestate/market',
    handler: handleListMarket,
  },
  {
    method: 'GET',
    path: '/nation/realestate/owner',
    handler: handleListOwnerProperties,
  },
  {
    method: 'GET',
    path: '/nation/realestate/rentals',
    handler: handleListRentals,
  },
  {
    method: 'GET',
    path: '/nation/realestate/stats',
    handler: handleGetMarketStats,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS properties (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT,
        property_type TEXT NOT NULL,
        location TEXT NOT NULL,
        district TEXT NOT NULL,
        size INTEGER NOT NULL,
        price INTEGER NOT NULL,
        currency TEXT DEFAULT 'TOKEN',
        owner_id TEXT NOT NULL,
        listing_status TEXT DEFAULT 'active',
        token_id TEXT UNIQUE NOT NULL,
        features TEXT,
        year_built INTEGER,
        listed_at TEXT NOT NULL,
        sold_at TEXT,
        transaction_hash TEXT
      );
    `,
    down: 'DROP TABLE IF EXISTS properties;',
  },
  {
    version: '002',
    up: `
      CREATE TABLE IF NOT EXISTS property_listings (
        id TEXT PRIMARY KEY,
        property_id TEXT NOT NULL,
        seller_id TEXT NOT NULL,
        asking_price INTEGER NOT NULL,
        currency TEXT DEFAULT 'TOKEN',
        status TEXT DEFAULT 'active',
        views INTEGER DEFAULT 0,
        inquiries INTEGER DEFAULT 0,
        expires_at TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
    `,
    down: 'DROP TABLE IF EXISTS property_listings;',
  },
  {
    version: '003',
    up: `
      CREATE TABLE IF NOT EXISTS rentals (
        id TEXT PRIMARY KEY,
        property_id TEXT NOT NULL,
        landlord_id TEXT NOT NULL,
        tenant_id TEXT NOT NULL,
        monthly_rent INTEGER NOT NULL,
        deposit INTEGER NOT NULL,
        status TEXT DEFAULT 'active',
        start_date TEXT NOT NULL,
        end_date TEXT,
        next_payment_due TEXT
      );
    `,
    down: 'DROP TABLE IF EXISTS rentals;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createRealEstatePlugin(): SNFPlugin {
  return {
    name: 'snf-realestate',
    version: '0.5.0',
    description:
      'Real estate system — NFT property trading, land ownership, property management',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
