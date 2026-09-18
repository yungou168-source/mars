# SNF Justice Plugin

Judicial system plugin for Sovereign Nation Framework — providing courts, trials, sentencing, and case law management.

## Purpose

The `snf-justice` plugin implements a complete judicial branch for sovereign nations, enabling:
- Court management and jurisdiction tracking
- Case filing and trial proceedings
- Verdict rendering and sentence execution
- Session transcription and record keeping

## Installation

```bash
npm install @sovereign-nation/snf-justice
```

## Key Routes

| Method | Route | Description |
|--------|-------|-------------|
| GET | `/nation/courts` | List all courts in the nation |
| GET | `/nation/courts/:id` | Get court details by ID |
| POST | `/nation/courts/:courtId/cases` | File a new case |
| GET | `/nation/courts/:courtId/cases` | List all cases for a court |

## Database Tables

- `court_cases` — stores case information (plaintiff, defendant, status, verdict, sentence)
- `court_sessions` — stores hearing transcripts and session records

## Hooks

- `proposal.passed` — automatically creates constitutional amendment reviews when proposals pass

## Development

```bash
# Build the plugin
npm run build

# Watch for changes
npm run dev

# Run type checking
npm run typecheck

# Run tests
npm test
```
