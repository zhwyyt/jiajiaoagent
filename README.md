# 小学生英语口语陪练 Agent

Android MVP for an AI English speaking practice companion focused on elementary school children.

## Current Status

The project is in early implementation setup.

Key tracking files:
- `STATUS.md`
- `TASKLIST.md`
- `docs/superpower/`

## Current Workflow Outputs

- `docs/superpower/01-brainstorming.md`
- `docs/superpower/01a-github-conventions.md`
- `docs/superpower/02-mvp-development-plan.md`
- `docs/superpower/03-implementation-prep.md`

## Planned Structure

- `app/` Android client
- `backend/` Agent service
- `docs/` product and technical documentation
- `assets/` static assets
- `scripts/` helper scripts

## Next Step

Initialize the Android app shell and backend service skeleton.

## Local Backend Mock

To run the backend in mock mode locally:

```powershell
powershell -ExecutionPolicy Bypass -File I:\jiajiaoagent\scripts\Start-BackendMock.ps1
```

To verify the backend health endpoint:

```powershell
powershell -ExecutionPolicy Bypass -File I:\jiajiaoagent\scripts\Check-BackendMock.ps1
```
