/**
 * SNF Jobs Plugin
 * Job market system — job listings, applications, employment records
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

interface Job {
  id: string;
  employer: string;
  title: string;
  salary: number;
  district: string;
  status: 'open' | 'closed' | 'filled';
  postedAt: string;
  description?: string;
  requirements?: string[];
}

interface JobApplication {
  id: string;
  jobId: string;
  applicant: string;
  status: 'submitted' | 'reviewing' | 'interview' | 'accepted' | 'rejected';
  appliedAt: string;
}

// ============================================================
// Mock Data
// ============================================================

const mockJobs: Job[] = [
  {
    id: 'job_001',
    employer: 'did:example:company1',
    title: 'Senior Software Engineer',
    salary: 120000,
    district: 'tech_district',
    status: 'open',
    postedAt: '2026-05-18T00:00:00Z',
    description: 'Lead development of core platform services and mentor junior developers.',
    requirements: [
      '5+ years experience',
      'Distributed systems',
      'TypeScript/Go proficiency',
      'Team leadership',
    ],
  },
  {
    id: 'job_002',
    employer: 'did:example:company2',
    title: 'Urban Planning Specialist',
    salary: 85000,
    district: 'central_district',
    status: 'open',
    postedAt: '2026-05-15T00:00:00Z',
    description: 'Develop and implement urban development strategies.',
    requirements: [
      'Urban planning degree',
      '3+ years experience',
      'GIS proficiency',
    ],
  },
  {
    id: 'job_003',
    employer: 'did:example:company3',
    title: 'Digital Identity Architect',
    salary: 150000,
    district: 'tech_district',
    status: 'open',
    postedAt: '2026-05-14T00:00:00Z',
    description: 'Design and implement digital identity systems for citizens.',
    requirements: [
      'Cryptography expertise',
      'Identity management experience',
      'Blockchain knowledge',
    ],
  },
  {
    id: 'job_004',
    employer: 'did:example:company4',
    title: 'Healthcare Coordinator',
    salary: 72000,
    district: 'health_district',
    status: 'open',
    postedAt: '2026-05-12T00:00:00Z',
    description: 'Coordinate healthcare services and citizen wellness programs.',
    requirements: [
      'Healthcare administration',
      'Public health background',
      'Communication skills',
    ],
  },
  {
    id: 'job_005',
    employer: 'did:example:company5',
    title: 'Treasury Analyst',
    salary: 95000,
    district: 'commerce_district',
    status: 'open',
    postedAt: '2026-05-10T00:00:00Z',
    description: 'Analyze treasury operations and optimize fund management.',
    requirements: [
      'Finance degree',
      '2+ years treasury experience',
      'Excel proficiency',
    ],
  },
  {
    id: 'job_006',
    employer: 'did:example:company6',
    title: 'Education Program Director',
    salary: 88000,
    district: 'education_district',
    status: 'open',
    postedAt: '2026-05-08T00:00:00Z',
    description: 'Lead educational initiatives and program development.',
    requirements: [
      'Education administration',
      'Program management',
      'Curriculum development',
    ],
  },
];

const mockApplications: JobApplication[] = [
  {
    id: 'app_001',
    jobId: 'job_001',
    applicant: 'did:example:citizen1',
    status: 'interview',
    appliedAt: '2026-05-19T00:00:00Z',
  },
  {
    id: 'app_002',
    jobId: 'job_001',
    applicant: 'did:example:citizen2',
    status: 'reviewing',
    appliedAt: '2026-05-19T01:00:00Z',
  },
  {
    id: 'app_003',
    jobId: 'job_002',
    applicant: 'did:example:citizen3',
    status: 'submitted',
    appliedAt: '2026-05-16T00:00:00Z',
  },
];

// ============================================================
// Route Handlers
// ============================================================

interface ListJobsRequest {
  query?: {
    district?: string;
    salary_min?: number;
    status?: string;
    limit?: number;
    offset?: number;
  };
}

async function handleListJobs(
  req: unknown,
  _res: unknown
): Promise<{
  jobs: Job[];
  total: number;
  openPositions: number;
}> {
  const request = req as ListJobsRequest;
  const district = request.query?.district;
  const salaryMin = request.query?.salary_min ?? 0;
  const status = request.query?.status;
  const limit = request.query?.limit ?? 20;
  const offset = request.query?.offset ?? 0;

  let filtered = [...mockJobs];

  if (district) {
    filtered = filtered.filter((j) => j.district === district);
  }
  if (salaryMin > 0) {
    filtered = filtered.filter((j) => j.salary >= salaryMin);
  }
  if (status) {
    filtered = filtered.filter((j) => j.status === status);
  }

  const total = filtered.length;
  const jobs = filtered.slice(offset, offset + limit);
  const openPositions = mockJobs.filter((j) => j.status === 'open').length;

  return { jobs, total, openPositions };
}

interface PostJobRequest {
  body: {
    employer: string;
    title: string;
    salary: number;
    district: string;
    description?: string;
    requirements?: string[];
  };
}

async function handlePostJob(
  req: unknown,
  _res: unknown
): Promise<{
  jobId: string;
  title: string;
  status: string;
  postedAt: string;
  message: string;
}> {
  const { body } = req as PostJobRequest;

  const newJob: Job = {
    id: `job_${String(mockJobs.length + 1).padStart(3, '0')}`,
    employer: body.employer,
    title: body.title,
    salary: body.salary,
    district: body.district,
    status: 'open',
    postedAt: new Date().toISOString(),
    description: body.description,
    requirements: body.requirements,
  };

  mockJobs.push(newJob);

  return {
    jobId: newJob.id,
    title: newJob.title,
    status: 'open',
    postedAt: newJob.postedAt,
    message: 'Job posted successfully',
  };
}

interface GetJobDetailRequest {
  params: {
    id: string;
  };
}

async function handleGetJobDetail(
  req: unknown,
  _res: unknown
): Promise<{
  job: Job & { applications: number; similarJobs: { id: string; title: string; salary: number }[] };
} | null> {
  const { params } = req as GetJobDetailRequest;
  const job = mockJobs.find((j) => j.id === params.id);

  if (!job) {
    return null;
  }

  const applications = mockApplications.filter((a) => a.jobId === params.id).length;

  const similarJobs = mockJobs
    .filter((j) => j.id !== job.id && j.district === job.district && j.status === 'open')
    .slice(0, 3)
    .map((j) => ({
      id: j.id,
      title: j.title,
      salary: j.salary,
    }));

  return { job: { ...job, applications, similarJobs } };
}

interface ApplyJobRequest {
  params: {
    id: string;
  };
  body: {
    applicant: string;
    coverLetter?: string;
    resume?: string;
  };
}

async function handleApplyJob(
  req: unknown,
  _res: unknown
): Promise<{
  applicationId: string;
  jobId: string;
  status: string;
  appliedAt: string;
  message: string;
}> {
  const { params, body } = req as ApplyJobRequest;

  const job = mockJobs.find((j) => j.id === params.id);
  if (!job) {
    throw new Error('Job not found');
  }

  const existingApplication = mockApplications.find(
    (a) => a.jobId === params.id && a.applicant === body.applicant
  );
  if (existingApplication) {
    throw new Error('Already applied to this job');
  }

  const newApplication: JobApplication = {
    id: `app_${String(mockApplications.length + 1).padStart(3, '0')}`,
    jobId: params.id,
    applicant: body.applicant,
    status: 'submitted',
    appliedAt: new Date().toISOString(),
  };

  mockApplications.push(newApplication);

  return {
    applicationId: newApplication.id,
    jobId: params.id,
    status: 'submitted',
    appliedAt: newApplication.appliedAt,
    message: 'Application submitted successfully',
  };
}

// ============================================================
// Routes
// ============================================================

const routes: RouteDefinition[] = [
  {
    method: 'GET',
    path: '/city/jobs',
    handler: handleListJobs,
  },
  {
    method: 'POST',
    path: '/city/jobs',
    handler: handlePostJob,
  },
  {
    method: 'GET',
    path: '/city/jobs/:id',
    handler: handleGetJobDetail,
  },
  {
    method: 'POST',
    path: '/city/jobs/:id/apply',
    handler: handleApplyJob,
  },
];

// ============================================================
// Migrations
// ============================================================

const migrations: DatabaseMigration[] = [
  {
    version: '001',
    up: `
      CREATE TABLE IF NOT EXISTS jobs (
        id TEXT PRIMARY KEY,
        employer TEXT NOT NULL,
        title TEXT NOT NULL,
        salary INTEGER NOT NULL,
        district TEXT NOT NULL,
        status TEXT DEFAULT 'open',
        posted_at TEXT NOT NULL
      );
    `,
    down: 'DROP TABLE IF EXISTS jobs;',
  },
  {
    version: '002',
    up: `
      CREATE TABLE IF NOT EXISTS job_applications (
        id TEXT PRIMARY KEY,
        job_id TEXT NOT NULL,
        applicant TEXT NOT NULL,
        status TEXT DEFAULT 'submitted',
        applied_at TEXT NOT NULL
      );
    `,
    down: 'DROP TABLE IF EXISTS job_applications;',
  },
];

// ============================================================
// Plugin Factory
// ============================================================

export function createJobsPlugin(): SNFPlugin {
  return {
    name: 'snf-jobs',
    version: '1.0.0',
    description: 'Job market system — job listings, applications, employment records',
    dependencies: [],

    routes,
    migrations,

    async onInit(_engine: SNFEngine): Promise<void> {
      return;
    },
  };
}
