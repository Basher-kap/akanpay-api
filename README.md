# Akan Pay API

NestJS backend for **Akan Pay** — authentication and user management foundation for the payment platform.

## Stack

- NestJS 11, TypeScript, PostgreSQL 16, TypeORM
- JWT access + refresh tokens, RBAC (`user` | `admin`)
- Swagger at `/api` (disabled in production by default)

## Quick start

### 1. Start PostgreSQL

```bash
docker compose up -d
```

This creates databases `akanpay-db` (dev) and `akanpay-test` (e2e) on first run.

### 2. Configure environment

```bash
cp .env.example .env
```

Edit `.env` — ensure JWT secrets are at least 32 characters.

### 3. Apply schema

**Option A — migrations (recommended for shared/CI environments):**

```bash
npm run migration:run
```

Set `DB_SYNC=false` in `.env`.

**Option B — auto-sync (solo local dev only):**

Set `DB_SYNC=true` in `.env` and skip migrations.

> Never use `DB_SYNC=true` in production. The app refuses to start if `NODE_ENV=production` and `DB_SYNC=true`.

### 4. Run the API

```bash
npm install
npm run start:dev
```

- API base: `http://localhost:3000/v1`
- Swagger: `http://localhost:3000/api`
- Health: `http://localhost:3000/health`
- Readiness (DB ping): `http://localhost:3000/health/ready`

## API routes

| Method | Path | Access |
|--------|------|--------|
| GET | `/health` | Public |
| GET | `/health/ready` | Public |
| GET | `/v1` | Public |
| POST | `/v1/auth/register` | Public (throttled) |
| POST | `/v1/auth/login` | Public (throttled) |
| POST | `/v1/auth/refresh` | Public (throttled) |
| POST | `/v1/auth/logout` | Bearer JWT |
| GET | `/v1/auth/profile` | Bearer JWT |
| GET | `/v1/user` | `user` or `admin` |
| POST | `/v1/user` | `admin` |

## Scripts

| Command | Description |
|---------|-------------|
| `npm run start:dev` | Dev server with watch |
| `npm run build` | Compile to `dist/` |
| `npm run migration:run` | Apply pending migrations |
| `npm run migration:revert` | Revert last migration |
| `npm run migration:show` | Show migration status |
| `npm test` | Unit tests |
| `npm run test:e2e` | E2E tests (requires Postgres) |
| `npm run lint` | ESLint |

## E2E tests

Requires Postgres running (`docker compose up -d`). The test runner **creates `akanpay-test` automatically** if it is missing.

```bash
cp test/.env.e2e.example test/.env.e2e
npm run test:e2e
```

To create the test database manually (e.g. existing Docker volume from before this script existed):

```bash
npm run db:create-test
```

Or via Docker:

```bash
docker compose exec postgres psql -U root -d postgres -c "CREATE DATABASE \"akanpay-test\";"
```

## Security features

- Helmet security headers
- Configurable CORS (`CORS_ORIGINS`)
- Global rate limiting + stricter auth route limits
- bcrypt password hashing
- Separate JWT secrets for access/refresh
- Refresh tokens stored hashed; rotation on refresh
- Session revocation via `tokenVersion`
- Global validation pipe (whitelist, forbid unknown fields)
- Production-safe error responses (no stack traces)
- Password policy: 8+ chars, upper, lower, number

## Environment variables

See [`.env.example`](.env.example) for the full list.

## Promoting a user to admin

```sql
UPDATE "user" SET roles = '{admin}' WHERE username = 'your-username';
```

## CI

GitHub Actions runs lint, build, unit tests, and e2e tests against PostgreSQL on push/PR to `main` and `backend-dev`.
