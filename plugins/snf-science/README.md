# SNF Science Plugin

The science system plugin provides research paper management, patent registration, and science grant application functionality for Sovereign Nation Framework.

## Features

- **Research Papers**: Manage and list scientific research papers with citations and branch categorization
- **Science Grants**: Apply for and manage research funding grants
- **Patents**: Register and browse intellectual property patents
- **Science Competitions**: Track scientific competition results

## Installation

```bash
npm install @sovereign-nation/snf-science
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/nation/science` | List all research papers |
| POST | `/nation/science/grant` | Apply for a science grant |
| GET | `/nation/science/patents` | List all registered patents |

### GET /nation/science

Returns a paginated list of research papers.

**Response:**
```json
{
  "papers": [
    {
      "id": "paper_001",
      "author": "did:example:scientist1",
      "title": "Quantum Computing Applications",
      "abstract": "Research on quantum applications...",
      "citations": 42,
      "branch": "physics",
      "publishedAt": "2026-01-15T10:00:00Z"
    }
  ],
  "total": 150
}
```

### POST /nation/science/grant

Apply for a science research grant.

**Request Body:**
```json
{
  "applicant": "did:example:scientist2",
  "amount": 50000,
  "branch": "biology",
  "proposal": "Research proposal content..."
}
```

**Response:**
```json
{
  "grantId": "grant_001",
  "status": "pending",
  "message": "Grant application submitted successfully"
}
```

### GET /nation/science/patents

Returns a list of registered patents.

**Response:**
```json
{
  "patents": [
    {
      "id": "patent_001",
      "owner": "did:example:inventor1",
      "title": "Novel Energy Storage Method",
      "registrationNumber": "PAT-2026-001",
      "filedAt": "2026-02-01T00:00:00Z",
      "status": "registered"
    }
  ],
  "total": 45
}
```

## Database Migrations

The plugin creates the following tables:

### research_papers
- `id` (TEXT PRIMARY KEY)
- `author` (TEXT NOT NULL)
- `title` (TEXT NOT NULL)
- `abstract` (TEXT)
- `citations` (INTEGER DEFAULT 0)
- `branch` (TEXT NOT NULL)
- `published_at` (TEXT NOT NULL)

### science_grants
- `id` (TEXT PRIMARY KEY)
- `applicant` (TEXT NOT NULL)
- `amount` (INTEGER NOT NULL)
- `branch` (TEXT NOT NULL)
- `status` (TEXT DEFAULT 'pending')
- `reviewed_at` (TEXT)

## Usage

```typescript
import { PluginHostImpl } from '@sovereign-nation/core';
import { createSciencePlugin } from '@sovereign-nation/snf-science';

const pluginHost = new PluginHostImpl();
const sciencePlugin = createSciencePlugin();

await pluginHost.register(sciencePlugin);
```

## License

MIT
