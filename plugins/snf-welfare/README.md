# SNF Welfare Plugin

The welfare and UBI system plugin provides universal basic income distribution, social security management, and pension services for Sovereign Nation Framework.

## Features

- **Welfare Statistics**: Track and monitor welfare program statistics
- **UBI Distribution**: Universal Basic Income payment management and status
- **Benefit Claims**: Process citizen benefit claims
- **Social Security**: Manage social security contributions and payments

## Installation

```bash
npm install @sovereign-nation/snf-welfare
```

## API Routes

| Method | Path | Description |
|--------|------|-------------|
| GET | `/nation/welfare` | Get welfare program statistics |
| GET | `/nation/welfare/ubi` | Get UBI payment status |
| POST | `/nation/welfare/claim` | Submit a benefit claim |

### GET /nation/welfare

Returns comprehensive welfare program statistics.

**Response:**
```json
{
  "totalBeneficiaries": 15420,
  "totalDisbursed": 154200000,
  "activePrograms": 8,
  "programs": [
    {
      "name": "Universal Basic Income",
      "beneficiaries": 12000,
      "monthlyAmount": 15000
    },
    {
      "name": "Senior Pension",
      "beneficiaries": 2400,
      "monthlyAmount": 25000
    },
    {
      "name": "Disability Support",
      "beneficiaries": 1020,
      "monthlyAmount": 20000
    }
  ],
  "pendingClaims": 45
}
```

### GET /nation/welfare/ubi

Returns UBI (Universal Basic Income) payment status for citizens.

**Response:**
```json
{
  "ubiStatus": {
    "eligibleCitizens": 15000,
    "activeRecipients": 14850,
    "pendingPayments": 150,
    "monthlyRate": 15000,
    "nextDistributionDate": "2026-06-01T00:00:00Z",
    "totalMonthlyBudget": 223500000
  },
  "recentPayments": [
    {
      "id": "ubi_001",
      "citizenId": "did:example:citizen1",
      "amount": 15000,
      "period": "2026-05",
      "status": "paid",
      "paidAt": "2026-05-01T08:00:00Z"
    }
  ]
}
```

### POST /nation/welfare/claim

Submit a new welfare benefit claim.

**Request Body:**
```json
{
  "citizenId": "did:example:citizen5",
  "type": "housing_assistance",
  "supportingDocuments": ["doc_001", "doc_002"],
  "reason": "Current housing costs exceed 40% of income"
}
```

**Response:**
```json
{
  "claimId": "claim_001",
  "status": "pending",
  "estimatedProcessingDays": 14,
  "message": "Claim submitted successfully. You will be notified once processed."
}
```

## Database Migrations

The plugin creates the following tables:

### welfare_claims
- `id` (TEXT PRIMARY KEY)
- `citizen_id` (TEXT NOT NULL)
- `type` (TEXT NOT NULL)
- `amount` (INTEGER)
- `status` (TEXT DEFAULT 'pending')
- `applied_at` (TEXT NOT NULL)
- `processed_at` (TEXT)

### ubi_payments
- `id` (TEXT PRIMARY KEY)
- `citizen_id` (TEXT NOT NULL)
- `amount` (INTEGER NOT NULL)
- `period` (TEXT NOT NULL)
- `status` (TEXT DEFAULT 'pending')
- `paid_at` (TEXT)

## Usage

```typescript
import { PluginHostImpl } from '@sovereign-nation/core';
import { createWelfarePlugin } from '@sovereign-nation/snf-welfare';

const pluginHost = new PluginHostImpl();
const welfarePlugin = createWelfarePlugin();

await pluginHost.register(welfarePlugin);
```

## License

MIT
