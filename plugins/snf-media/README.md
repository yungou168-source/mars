# SNF Media Plugin

The media and journalism system plugin provides news article management, live feeds, and media outlet functionality for Sovereign Nation Framework.

## Features

- **News Feed**: Browse latest news articles across categories
- **Article Publishing**: Publish and manage news articles
- **Article Details**: Read full article content with view tracking
- **Category Filtering**: Filter news by category (politics, economy, science, etc.)

## Installation

```bash
npm install @sovereign-nation/snf-media
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/city/news` | Get news feed with articles |
| POST | `/city/news` | Publish a new article |
| GET | `/city/news/:id` | Get article details |

### GET /city/news

Returns a paginated news feed with optional category filtering.

**Query Parameters:**
- `category` (optional): Filter by category (politics, economy, science, culture, sports, technology)
- `limit` (optional): Number of articles to return (default: 20)
- `offset` (optional): Pagination offset (default: 0)

**Response:**
```json
{
  "articles": [
    {
      "id": "article_001",
      "author": "did:example:journalist1",
      "title": "New Infrastructure Bill Passes Senate",
      "content": "The nation's senate passed a landmark infrastructure bill...",
      "category": "politics",
      "publishedAt": "2026-05-21T08:00:00Z",
      "views": 15420
    },
    {
      "id": "article_002",
      "author": "did:example:journalist2",
      "title": "Tech Innovation Summit Announced",
      "content": "The annual technology innovation summit will be held...",
      "category": "technology",
      "publishedAt": "2026-05-20T14:30:00Z",
      "views": 8930
    }
  ],
  "total": 245,
  "limit": 20,
  "offset": 0
}
```

### POST /city/news

Publish a new news article.

**Request Body:**
```json
{
  "author": "did:example:journalist3",
  "title": "Economic Growth Exceeds Expectations",
  "content": "The nation's GDP growth has exceeded analyst expectations...",
  "category": "economy"
}
```

**Response:**
```json
{
  "articleId": "article_003",
  "title": "Economic Growth Exceeds Expectations",
  "status": "published",
  "publishedAt": "2026-05-21T10:00:00Z",
  "message": "Article published successfully"
}
```

### GET /city/news/:id

Get detailed information about a specific article.

**Response:**
```json
{
  "article": {
    "id": "article_001",
    "author": "did:example:journalist1",
    "title": "New Infrastructure Bill Passes Senate",
    "content": "The nation's senate passed a landmark infrastructure bill with a 65-35 vote. The bill allocates 50 billion tokens to road improvements, 30 billion to digital infrastructure, and 20 billion to public transit systems.\n\nSenator Johnson stated that this investment will create over 100,000 jobs and modernize the nation's infrastructure for decades to come.",
    "category": "politics",
    "publishedAt": "2026-05-21T08:00:00Z",
    "views": 15420,
    "relatedArticles": [
      {
        "id": "article_015",
        "title": "Infrastructure Debate Heats Up",
        "category": "politics"
      }
    ]
  }
}
```

## Database Migrations

The plugin creates the following table:

### news_articles
- `id` (TEXT PRIMARY KEY)
- `author` (TEXT NOT NULL)
- `title` (TEXT NOT NULL)
- `content` (TEXT NOT NULL)
- `category` (TEXT NOT NULL)
- `published_at` (TEXT NOT NULL)
- `views` (INTEGER DEFAULT 0)

## Usage

```typescript
import { PluginHostImpl } from '@sovereign-nation/core';
import { createMediaPlugin } from '@sovereign-nation/snf-media';

const pluginHost = new PluginHostImpl();
const mediaPlugin = createMediaPlugin();

await pluginHost.register(mediaPlugin);
```

## License

MIT
