# Interactive Urban Farming Platform Backend (GreenGrid)

Production-style modular backend for an urban farming platform.

## Stack
- Express.js
- Prisma ORM
- PostgreSQL
- TypeScript

## Core Features
- JWT authentication and RBAC (`ADMIN`, `VENDOR`, `CUSTOMER`)
- Vendor profiles and sustainability certification workflow
- Rental space listing and booking flow
- Produce marketplace with stock-aware ordering
- Community forum posts
- Plant tracking with polling-friendly incremental updates
- Centralized error handling and standardized API responses
- Route-level rate limiting on auth and sensitive write actions

## Project Structure
- `src/modules/*` - Feature modules (route/validation/controller/service)
- `src/middlewares/*` - Auth, RBAC, rate limiter, error/not-found handlers
- `src/helpers/*` - JWT/password/pagination helpers
- `src/docs/openapi.ts` - OpenAPI specification served by Swagger UI
- `prisma/schema.prisma` - Data models and enums
- `prisma/migrations/*` - Versioned schema migrations
- `prisma/seed.js` - Full demo seed data
- `docs/*` - Strategy and benchmark notes

## Prerequisites
- Node.js 18+
- PostgreSQL 14+

## Setup
1. Install dependencies:
```bash
npm install
```

2. Configure environment:
```bash
cp .env.example .env
```

3. Set `DATABASE_URL` in `.env` to your PostgreSQL instance.

4. Generate Prisma client:
```bash
npm run prisma:generate
```

5. Apply migrations:
```bash
npm run prisma:migrate -- --name init
```

6. Seed demo data:
```bash
npm run prisma:seed
```

7. Start server:
```bash
npm run dev
```

## Build and Run
```bash
npm run build
npm start
```

## API Documentation (Swagger)
- UI: `http://localhost:5000/docs`
- Raw OpenAPI JSON: `http://localhost:5000/docs.json`

## Seed Data Snapshot
The seeder creates demo-ready linked records, including:
- 1 admin user
- 8 customer users
- 10 vendor users + vendor profiles
- certification records per vendor
- 20 rental spaces
- 100 products
- rental bookings
- orders
- community posts
- plant tracking records

Default seeded credentials:
- Admin: `admin@greengrid.local` / `Password@123`
- Customers: `customer1@greengrid.local` ... `customer8@greengrid.local` / `Password@123`
- Vendors: `vendor1@greengrid.local` ... `vendor10@greengrid.local` / `Password@123`

Override default password with `SEED_DEFAULT_PASSWORD` before running seed.

## Benchmark Helper
Run lightweight endpoint timing checks (with server running):
```bash
npm run benchmark:api
```

Optional benchmark environment variables:
- `BENCHMARK_BASE_URL`
- `BENCHMARK_EMAIL`
- `BENCHMARK_PASSWORD`

Benchmark and response strategy notes:
- `docs/api-response-control-and-performance-strategy.md`
- `docs/benchmark-note.md`

## NPM Scripts
- `npm run dev` - Run in development mode
- `npm run build` - Compile TypeScript
- `npm start` - Run compiled output
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run Prisma migrate dev
- `npm run prisma:deploy` - Run Prisma migrate deploy
- `npm run prisma:studio` - Open Prisma Studio
- `npm run prisma:seed` - Seed demo dataset
- `npm run benchmark:api` - Run lightweight API timing script

## Health Check
- `GET /health`
