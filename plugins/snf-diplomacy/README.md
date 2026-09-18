# @sovereign-nation/snf-diplomacy

Diplomacy plugin for Sovereign Nation Framework — managing embassies, treaties, and inter-nation relations.

## Installation

```bash
npm install @sovereign-nation/snf-diplomacy
```

Or add to your workspace's `package.json` devDependencies.

## Usage

```typescript
import { createDiplomacyPlugin } from '@sovereign-nation/snf-diplomacy';
import { createSNFApp } from '@sovereign-nation/core';

const app = createSNFApp({
  plugins: [createDiplomacyPlugin()],
});
```

## Database Migrations

The plugin runs three migrations on startup:

1. `create_diplomatic_relations` — tracks diplomatic relations with entities (friendly/neutral/tense/hostile)
2. `create_diplomatic_treaties` — stores treaties between nations
3. `create_diplomatic_news` — maintains diplomatic news feed

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/diplomacy` | List all diplomatic relations |
| `GET` | `/diplomacy/embassy/:entity` | Get embassy details for a specific entity |
| `GET` | `/diplomacy/treaties` | List all treaties (supports `?status=` and `?type=` filters) |
| `POST` | `/diplomacy/treaties` | Propose a new treaty |
| `GET` | `/diplomacy/news` | Get diplomatic news feed (supports `?limit=` parameter) |

## Treaty Types

- `trade` — Economic trade agreements
- `military` — Military alliances and cooperation
- `cultural` — Cultural exchange agreements
- `mutual-defense` — Defense pacts
- `non-aggression` — Non-aggression pacts

## Relation Types

- `friendly` — Positive diplomatic relations
- `neutral` — Standard diplomatic standing
- `tense` — Strained diplomatic relations
- `hostile` — Adversarial relations

## License

MIT
