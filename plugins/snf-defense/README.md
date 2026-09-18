# SNF Defense Plugin

The defense and national security plugin provides military unit management, intelligence reporting, and civil defense functionality for Sovereign Nation Framework.

## Features

- **Defense Overview**: Comprehensive national defense status and readiness
- **Military Units**: Manage and track military unit deployment and strength
- **Intelligence Reports**: Access classified intelligence briefings
- **Civil Defense**: Emergency response and civil defense coordination

## Installation

```bash
npm install @sovereign-nation/snf-defense
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/nation/defense` | Get defense overview |
| GET | `/nation/defense/units` | List military units |
| GET | `/nation/defense/intelligence` | Get intelligence reports |

### GET /nation/defense

Returns comprehensive national defense overview.

**Response:**
```json
{
  "defenseOverview": {
    "overallReadiness": 87,
    "activePersonnel": 15000,
    "totalUnits": 45,
    "defenseBudget": 2500000000,
    "threatLevel": "low",
    "lastUpdated": "2026-05-21T00:00:00Z"
  },
  "branches": [
    {
      "name": "Army",
      "personnel": 8000,
      "units": 20,
      "readiness": 92
    },
    {
      "name": "Navy",
      "personnel": 3000,
      "units": 10,
      "readiness": 85
    },
    {
      "name": "Air Force",
      "personnel": 2500,
      "units": 12,
      "readiness": 88
    },
    {
      "name": "Civil Defense",
      "personnel": 1500,
      "units": 3,
      "readiness": 80
    }
  ]
}
```

### GET /nation/defense/units

Returns detailed information about military units.

**Query Parameters:**
- `type` (optional): Filter by unit type (infantry, armor, aviation, naval, special_ops, civil_defense)
- `readiness_min` (optional): Minimum readiness level

**Response:**
```json
{
  "units": [
    {
      "id": "unit_001",
      "name": "Alpha Brigade",
      "type": "infantry",
      "strength": 2500,
      "readiness": 95,
      "stationedAt": "district_central"
    },
    {
      "id": "unit_002",
      "name": "Sky Guardian Squadron",
      "type": "aviation",
      "strength": 200,
      "readiness": 88,
      "stationedAt": "air_base_north"
    },
    {
      "id": "unit_003",
      "name": "Coastal Defense Fleet",
      "type": "naval",
      "strength": 500,
      "readiness": 85,
      "stationedAt": "naval_base_east"
    }
  ],
  "total": 45
}
```

### GET /nation/defense/intelligence

Returns intelligence reports with classification levels.

**Query Parameters:**
- `classification` (optional): Filter by classification (public, confidential, secret, top_secret)

**Response:**
```json
{
  "reports": [
    {
      "id": "intel_001",
      "title": "Regional Security Assessment Q2 2026",
      "classification": "secret",
      "summary": "Regional security situation remains stable. Minor tensions reported in border regions. No immediate threats identified.",
      "issuedAt": "2026-05-15T00:00:00Z"
    },
    {
      "id": "intel_002",
      "title": "Economic Intelligence Briefing",
      "classification": "confidential",
      "summary": "Trade patterns analysis shows positive trends. Key trading partners maintain stable relations.",
      "issuedAt": "2026-05-10T00:00:00Z"
    },
    {
      "id": "intel_003",
      "title": "Technology Security Report",
      "classification": "secret",
      "summary": "Cybersecurity threat levels remain elevated. Recommended increased monitoring of critical infrastructure.",
      "issuedAt": "2026-05-08T00:00:00Z"
    }
  ],
  "total": 12
}
```

## Database Migrations

The plugin creates the following tables:

### defense_units
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `type` (TEXT NOT NULL)
- `strength` (INTEGER NOT NULL)
- `readiness` (INTEGER DEFAULT 100)
- `stationed_at` (TEXT NOT NULL)

### intel_reports
- `id` (TEXT PRIMARY KEY)
- `title` (TEXT NOT NULL)
- `classification` (TEXT NOT NULL)
- `summary` (TEXT NOT NULL)
- `issued_at` (TEXT NOT NULL)

## Usage

```typescript
import { PluginHostImpl } from '@sovereign-nation/core';
import { createDefensePlugin } from '@sovereign-nation/snf-defense';

const pluginHost = new PluginHostImpl();
const defensePlugin = createDefensePlugin();

await pluginHost.register(defensePlugin);
```

## License

MIT
