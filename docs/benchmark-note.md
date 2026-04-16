# Lightweight Benchmark Note

## Scope
This benchmark note is intended for quick backend sanity checks (not deep load testing). It focuses on typical list and auth flows after seeding.

## How to Run
1. Start PostgreSQL and apply migrations.
2. Seed the database.
3. Start the API server.
4. Run:
```bash
npm run benchmark:api
```

Optional environment overrides:
- `BENCHMARK_BASE_URL` (default: `http://localhost:5000`)
- `BENCHMARK_EMAIL` (default: `admin@greengrid.local`)
- `BENCHMARK_PASSWORD` (default: `Password@123`)

## Endpoints Covered by Script
- `GET /health`
- `GET /api/v1/community-posts?limit=20`
- `POST /api/v1/auth/login`
- `GET /api/v1/produce?page=1&limit=20`
- `GET /api/v1/orders?page=1&limit=20` (authenticated)

## What Impacts Performance Most Right Now
- Query complexity and cardinality on list endpoints.
- Pagination limit size and nested relation selections.
- PostgreSQL indexing quality for filter/sort fields.
- Network latency and request concurrency.

## Current Optimization Choices
- Indexes are present on common filter paths (status, relation IDs, timestamp paths, search-supporting fields).
- Listing endpoints use explicit pagination and bounded limits.
- Shared response helpers keep payload structure stable for clients.
- Rate limiting protects expensive write paths from abuse bursts.

## Recommended Future Improvements
- Add endpoint-level tracing and p95/p99 metrics in production.
- Introduce query caching for high-traffic public read endpoints.
- Add k6/Artillery scenarios for sustained concurrency profiles.
- Evaluate database connection pooling and read-replica strategy at scale.
