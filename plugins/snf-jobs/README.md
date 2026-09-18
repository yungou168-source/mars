# SNF Jobs Plugin

The job market system plugin provides job listings, application management, and employment records for Sovereign Nation Framework.

## Features

- **Job Listings**: Browse available job positions across districts
- **Job Posting**: Employers can post new job openings
- **Job Details**: View detailed job information
- **Application Management**: Submit and track job applications

## Installation

```bash
npm install @sovereign-nation/snf-jobs
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/city/jobs` | List available job openings |
| POST | `/city/jobs` | Post a new job listing |
| GET | `/city/jobs/:id` | Get job details |
| POST | `/city/jobs/:id/apply` | Apply for a job |

### GET /city/jobs

Returns a paginated list of available jobs.

**Query Parameters:**
- `district` (optional): Filter by district
- `salary_min` (optional): Minimum salary
- `status` (optional): Filter by status (open, closed, filled)

**Response:**
```json
{
  "jobs": [
    {
      "id": "job_001",
      "employer": "did:example:company1",
      "title": "Senior Software Engineer",
      "salary": 120000,
      "district": "tech_district",
      "status": "open",
      "postedAt": "2026-05-18T00:00:00Z"
    },
    {
      "id": "job_002",
      "employer": "did:example:company2",
      "title": "Urban Planning Specialist",
      "salary": 85000,
      "district": "central_district",
      "status": "open",
      "postedAt": "2026-05-15T00:00:00Z"
    }
  ],
  "total": 156,
  "openPositions": 89
}
```

### POST /city/jobs

Post a new job listing.

**Request Body:**
```json
{
  "employer": "did:example:company3",
  "title": "Data Analyst",
  "salary": 75000,
  "district": "commerce_district",
  "description": "Analyze data trends and provide insights for business decisions",
  "requirements": ["3+ years experience", "Statistics background", "Data visualization skills"]
}
```

**Response:**
```json
{
  "jobId": "job_003",
  "title": "Data Analyst",
  "status": "open",
  "postedAt": "2026-05-21T10:00:00Z",
  "message": "Job posted successfully"
}
```

### GET /city/jobs/:id

Get detailed information about a specific job.

**Response:**
```json
{
  "job": {
    "id": "job_001",
    "employer": "did:example:company1",
    "title": "Senior Software Engineer",
    "salary": 120000,
    "district": "tech_district",
    "status": "open",
    "postedAt": "2026-05-18T00:00:00Z",
    "description": "Lead development of core platform services",
    "requirements": ["5+ years experience", "Distributed systems", "TypeScript/Go proficiency"],
    "applications": 24,
    "similarJobs": [
      {
        "id": "job_015",
        "title": "Software Engineer",
        "salary": 95000
      }
    ]
  }
}
```

### POST /city/jobs/:id/apply

Submit an application for a job.

**Request Body:**
```json
{
  "applicant": "did:example:citizen15",
  "coverLetter": "I am excited to apply for this position...",
  "resume": "resume_001"
}
```

**Response:**
```json
{
  "applicationId": "app_001",
  "jobId": "job_001",
  "status": "submitted",
  "appliedAt": "2026-05-21T11:30:00Z",
  "message": "Application submitted successfully"
}
```

## Database Migrations

The plugin creates the following tables:

### jobs
- `id` (TEXT PRIMARY KEY)
- `employer` (TEXT NOT NULL)
- `title` (TEXT NOT NULL)
- `salary` (INTEGER NOT NULL)
- `district` (TEXT NOT NULL)
- `status` (TEXT DEFAULT 'open')
- `posted_at` (TEXT NOT NULL)

### job_applications
- `id` (TEXT PRIMARY KEY)
- `job_id` (TEXT NOT NULL)
- `applicant` (TEXT NOT NULL)
- `status` (TEXT DEFAULT 'submitted')
- `applied_at` (TEXT NOT NULL)

## Usage

```typescript
import { PluginHostImpl } from '@sovereign-nation/core';
import { createJobsPlugin } from '@sovereign-nation/snf-jobs';

const pluginHost = new PluginHostImpl();
const jobsPlugin = createJobsPlugin();

await pluginHost.register(jobsPlugin);
```

## License

MIT
