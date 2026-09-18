# SNF Party Plugin

The political party system plugin provides party formation, manifesto management, and member organization for Sovereign Nation Framework.

## Features

- **Party Registration**: Register new political parties with manifestos
- **Party Directory**: Browse and search political parties
- **Member Management**: Join parties and manage membership
- **Party Leadership**: Track party leaders and organizational structure

## Installation

```bash
npm install @sovereign-nation/snf-party
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/nation/parties` | List all registered political parties |
| POST | `/nation/parties` | Register a new political party |
| GET | `/nation/parties/:id` | Get party details |
| POST | `/nation/parties/:id/join` | Join a political party |

### GET /nation/parties

Returns a list of all registered political parties.

**Response:**
```json
{
  "parties": [
    {
      "id": "party_001",
      "name": "Progressive Future Party",
      "leader": "did:example:leader1",
      "manifesto": "Building a sustainable future through innovation...",
      "memberCount": 2500,
      "createdAt": "2025-06-15T00:00:00Z"
    },
    {
      "id": "party_002",
      "name": "National Unity Coalition",
      "leader": "did:example:leader2",
      "manifesto": "Unity and prosperity for all citizens...",
      "memberCount": 1850,
      "createdAt": "2025-08-20T00:00:00Z"
    }
  ],
  "total": 5
}
```

### POST /nation/parties

Register a new political party.

**Request Body:**
```json
{
  "name": "Innovation Party",
  "leader": "did:example:newleader",
  "manifesto": "Technology-driven governance for the digital age..."
}
```

**Response:**
```json
{
  "partyId": "party_006",
  "name": "Innovation Party",
  "status": "registered",
  "message": "Party registered successfully"
}
```

### GET /nation/parties/:id

Get detailed information about a specific party.

**Response:**
```json
{
  "party": {
    "id": "party_001",
    "name": "Progressive Future Party",
    "leader": "did:example:leader1",
    "manifesto": "Building a sustainable future through innovation...",
    "memberCount": 2500,
    "createdAt": "2025-06-15T00:00:00Z",
    "members": [
      {
        "citizenId": "did:example:member1",
        "role": "executive",
        "joinedAt": "2025-06-16T00:00:00Z"
      },
      {
        "citizenId": "did:example:member2",
        "role": "member",
        "joinedAt": "2025-06-20T00:00:00Z"
      }
    ]
  }
}
```

### POST /nation/parties/:id/join

Join a political party.

**Request Body:**
```json
{
  "citizenId": "did:example:citizen10"
}
```

**Response:**
```json
{
  "status": "success",
  "partyId": "party_001",
  "memberId": "did:example:citizen10",
  "joinedAt": "2026-05-21T10:30:00Z",
  "message": "Successfully joined Progressive Future Party"
}
```

## Database Migrations

The plugin creates the following tables:

### political_parties
- `id` (TEXT PRIMARY KEY)
- `name` (TEXT NOT NULL)
- `leader` (TEXT NOT NULL)
- `manifesto` (TEXT)
- `member_count` (INTEGER DEFAULT 0)
- `created_at` (TEXT NOT NULL)

### party_members
- `party_id` (TEXT NOT NULL)
- `citizen_id` (TEXT NOT NULL)
- `role` (TEXT DEFAULT 'member')
- `joined_at` (TEXT NOT NULL)
- PRIMARY KEY (`party_id`, `citizen_id`)

## Usage

```typescript
import { PluginHostImpl } from '@sovereign-nation/core';
import { createPartyPlugin } from '@sovereign-nation/snf-party';

const pluginHost = new PluginHostImpl();
const partyPlugin = createPartyPlugin();

await pluginHost.register(partyPlugin);
```

## License

MIT
