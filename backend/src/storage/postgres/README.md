# PostgreSQL Integration

This folder contains the backend PostgreSQL access layer.

Current contents:
- `client.ts`: shared `pg` pool bootstrap
- `profileRepository.ts`: child profile reads
- `topicRepository.ts`: topic reads with local fallback
- `sessionRepository.ts`: session lifecycle persistence
- `learningMemoryRepository.ts`: Hermes learning memory persistence

## Migrations

Run:

```bash
npm run db:migrate
```

This applies all SQL files under `backend/db/migrations` and records them in
`schema_migrations`.

## Current persistence split

- PostgreSQL:
  - sessions
  - learning session summaries
  - learning snapshots
  - learner profiles
- Redis:
  - active session state
