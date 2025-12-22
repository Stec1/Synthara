# Synthara 3.0

Mobile-first platform scaffold for AI influencer creators and fans. This monorepo includes an Expo Router mobile app and a FastAPI backend connected through shared TypeScript types.

## Structure

- `apps/mobile` – Expo + React Native app with tabs for Home, Profile, Game, and Settings.
- `apps/api` – FastAPI service with SQLite + SQLModel, mocked email auth, and CRUD for model profiles, LoRA vault, and Gold drops/auctions.
- `packages/shared` – Shared TypeScript domain types (models, drops, auctions, ownership placeholders).

## Prerequisites

- Node.js 20+
- pnpm 8+
- Python 3.11+
- Expo Go (for device preview)

## Setup

1. Install JavaScript dependencies:

   ```bash
   pnpm install
   ```

2. Copy environment examples and adjust as needed:

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/mobile/.env.example apps/mobile/.env
   ```

## Running the API (FastAPI + SQLite)

```bash
cd apps/api
./scripts/dev.sh
```

- Runs on `http://localhost:8000` with hot reload.
- Seed demo content (models, LoRA, gold drop, auction) via `POST /models/seed`.

## Running the Mobile App (Expo Router)

```bash
pnpm dev:mobile
```

- Uses `EXPO_PUBLIC_API_URL` from `apps/mobile/.env` (defaults to `http://localhost:8000`).
- Tabs include Home (trending + drops/auctions highlights), Profile (auth, model profile entry), Game (Durak-inspired placeholders), Settings (Web3 login placeholder).

## Development Scripts

- Lint all packages: `pnpm lint`
- Type-check all packages: `pnpm typecheck`
- Python lint/tests: `cd apps/api && ./scripts/test.sh`

## Notes

- Auth is mocked for MVP: `/auth/email/start` and `/auth/email/verify` return a dev token used by the mobile app.
- Database uses SQLite for local development; configure `DATABASE_URL` in `apps/api/.env` if needed.
