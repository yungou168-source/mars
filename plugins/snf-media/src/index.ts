/**
 * SNF Media Plugin
 * Media & journalism system — news articles, live feeds, media outlets
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

interface NewsArticle {
  id: string;
  author: string;
  title: string;
  content: string;
  category: string;
  publishedAt: string;
  views: number;
}

type NewsCategory =
  | 'politics'
  | 'economy'
  | 'science'
  | 'culture'
  | 'sports'
  | 'technology';

// ============================================================
// Mock Data
// ============================================================

const mockArticles: NewsArticle[] = [
  {
    id: 'article_001',
    author: 'did:example:journalist1',
    title: 'New Infrastructure Bill Passes Senate with Bipartisan Support',
    content: `The nation's senate passed a landmark infrastructure bill with a 65-35 vote. The bill allocates 50 billion tokens to road improvements, 30 billion to digital infrastructure, and 20 billion to public transit systems.

Senator Johnson stated that this investment will create over 100,000 jobs and modernize the nation's infrastructure for decades to come.

The legislation includes provisions for:
- Highway expansion and maintenance
- High-speed broadband deployment
- Public transportation upgrades
- Bridge safety improvements

Opponents raised concerns about the funding mechanism but acknowledged the necessity of infrastructure investment.`,
    category: 'politics',
    publishedAt: '2026-05-21T08:00:00Z',
    views: 15420,
  },
  {
    id: 'article_002',
    author: 'did:example:journalist2',
    title: 'Tech Innovation Summit Announced for Next Quarter',
    content: `The annual Technology Innovation Summit will be held next quarter, bringing together developers, entrepreneurs, and government officials to discuss the future of digital governance.

Key topics include:
- Blockchain-based identity systems
- AI governance frameworks
- Smart city infrastructure
- Digital privacy standards

Registration opens next month, with early bird discounts available for startups and educational institutions.`,
    category: 'technology',
    publishedAt: '2026-05-20T14:30:00Z',
    views: 8930,
  },
  {
    id: 'article_003',
    author: 'did:example:journalist3',
    title: 'Economic Growth Exceeds Analyst Expectations in Q1',
    content: `The nation's GDP growth has exceeded analyst expectations for the first quarter, posting a 4.2% increase compared to the same period last year.

Key economic indicators show:
- 15% increase in exports
- 8% growth in technology sector
- Unemployment rate dropped to 3.2%
- Treasury reserves increased by 12%

The Finance Minister attributed the growth to successful policy implementations and increased foreign investment.`,
    category: 'economy',
    publishedAt: '2026-05-19T10:00:00Z',
    views: 12100,
  },
  {
    id: 'article_004',
    author: 'did:example:journalist4',
    title: 'National Research Grant Program Opens Applications',
    content: `The Ministry of Science announced the opening of applications for the annual research grant program, with a total budget of 500 million tokens available for qualified researchers.

Eligible research areas include:
- Renewable energy and sustainability
- Healthcare technology
- Digital infrastructure
- Agricultural innovation

Applications will be accepted for the next 60 days, with selection committees reviewing proposals based on innovation, feasibility, and societal impact.`,
    category: 'science',
    publishedAt: '2026-05-18T09:15:00Z',
    views: 5670,
  },
  {
    id: 'article_005',
    author: 'did:example:journalist5',
    title: 'Cultural Festival Draws Record Attendance',
    content: `The annual National Cultural Festival concluded with record attendance of over 500,000 participants across three days of celebrations.

Highlights included:
- Traditional music and dance performances
- Regional cuisine showcases
- Art exhibitions featuring local artists
- Interactive cultural heritage workshops

The Minister of Culture praised the event for bringing communities together and preserving national traditions.`,
    category: 'culture',
    publishedAt: '2026-05-17T16:00:00Z',
    views: 7820,
  },
  {
    id: 'article_006',
    author: 'did:example:journalist6',
    title: 'National Sports Teams Announce Championship Roster',
    content: `The national sports committee announced the final roster for the upcoming international championships, featuring both veteran athletes and promising newcomers.

Team composition reflects a balance of experience and fresh talent, with intensive training schedules planned for the coming months.`,
    category: 'sports',
    publishedAt: '2026-05-16T11:30:00Z',
    views: 4560,
  },
];

// ============================================================
// Route Handlers
// ============================================================

interface ListNewsRequest {
  query?: {
    category?: string;
    limit?: number;
    offset?: number;
  };
}

async function handleListNews(
  req: unknown,
  _res: unknown
): Promise<{
  articles: NewsArticle[];
  total: number;
  limit: number;
  offset: number;
}> {
  const request = req as ListNewsRequest;
  const category = request.query?.category;
  const limit = request.query?.limit ?? 20;
  const offset = request.query?.offset ?? 0;

  let filtered = [...mockArticles].sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );

  if (category) {
    filtered = filtered.filter((a) => a.category === category);
  }

  const total = filtered.length;
  const articles = filtered.slice(offset, offset + limit);

  return { articles, total, limit, offset };
}

interface PublishArticleRequest {
  body: {
    author: string;
    title: string;
    content: string;
    category: string;
  };
}

async function handlePublishArticle(
  req: unknown,
  _res: unknown
): Promise<{
  articleId: string;
  title: string;
  status: string;
  publishedAt: string;
  message: string;
}> {
  const { body } = req as PublishArticleRequest;

  const newArticle: NewsArticle = {
    id: `article_${String(mockArticles.length + 1).padStart(3, '0')}`,
    author: body.author,
    title: body.title,
    content: body.content,
    category: body.category as NewsCategory,
    publishedAt: new Date().toISOString(),
    views: 0,
  };

  mockArticles.push(newArticle);

  return {
    articleId: newArticle.id,
    title: newArticle.title,
    status: 'published',
    publishedAt: newArticle.publishedAt,
    message: 'Article published successfully',
  };
}

interface GetArticleRequest {
  params: {
    id: string;
  };
}

async function handleGetArticle(
  req: unknown,
  _res: unknown
): Promise<{
  article: NewsArticle & { relatedArticles: { id: string; title: string; category: string }[] };
} | null> {
  const { params } = req as GetArticleRequest;
  const article = mockArticles.find((a) => a.id === params.id);

  if (!article) {
    return null;
  }

  article.views += 1;

  const relatedArticles = mockArticles
    .filter((a) => a.id !== article.id && a.category === article.category)
    .slice(0, 3)
    .map((a) => ({
      id: a.id,
      title: a.title,
      category: a.category,
    }));

  return { article: { ...article, relatedArticles } };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/city/news',
    handler: handleListNews,
  },
  {
    method: 'POST',
    path: '/city/news',
    handler: handlePublishArticle,
  },
  {
    method: 'GET',
    path: '/city/news/:id',
    handler: handleGetArticle,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS news_articles (
        id TEXT PRIMARY KEY,
        author TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        published_at TEXT NOT NULL,
        views INTEGER DEFAULT 0
      );
    `,
    down: 'DROP TABLE IF EXISTS news_articles;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createMediaPlugin(): SNFPlugin {
  return {
    name: 'snf-media',
    version: '1.0.0',
    description: 'Media & journalism system — news articles, live feeds, media outlets',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
