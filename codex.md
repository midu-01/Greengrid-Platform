# codex.md

## Project
Interactive Urban Farming Platform Backend

## Required Stack
- Express.js
- Prisma ORM
- PostgreSQL
- TypeScript (selected for this implementation)

## Rules
- Do not use any framework other than Express.js
- Do not replace Prisma
- Do not replace PostgreSQL
- Keep architecture modular and production-like
- Use consistent JSON response structure
- Use proper HTTP status codes
- Update this file after each completed phase

## Current Progress
- [x] Project setup
- [x] Prisma schema
- [x] Authentication
- [x] RBAC foundation
- [x] Vendor profile module (business APIs)
- [x] Sustainability certification module APIs
- [x] Rental space module APIs
- [x] Marketplace module APIs
- [x] Orders module APIs
- [x] Community forum module APIs
- [x] Plant tracking module
- [x] Rate limiting (auth + sensitive write routes)
- [x] Swagger/OpenAPI docs
- [x] Seeder
- [x] Benchmark note
- [x] Final cleanup

## Completed In Phase 1
1. Bootstrapped Express + TypeScript project structure.
2. Added env config, Prisma client config, app/server bootstrap.
3. Added centralized error handling, not-found handling, async wrapper.
4. Added shared API response helper with standard response shape.
5. Implemented JWT authentication:
   - Register
   - Login
   - Current user profile (`/me`)
6. Implemented role-based guard middleware and protected sample routes.
7. Added auth route rate limiter.
8. Implemented full initial Prisma schema with required entities and enums.
9. Added initial SQL migration files.
10. Added starter README and phase notes.

## Completed In Phase 2
1. Implemented Vendor Profile module:
   - Vendor can create/update own profile.
   - Vendor can fetch own profile.
   - Admin can list all vendor profiles with basic filters.
   - Admin can view vendor profile details including certification snapshots.
2. Implemented Sustainability Certification flow:
   - Vendor submits certification requests.
   - Vendor can list own certifications.
   - Admin can list and inspect all certifications.
   - Admin can approve/reject certifications via review endpoint.
   - Vendor profile certification status is synchronized on submit/review.
3. Implemented Rental Space management:
   - Vendor can create/list/update/delete own rental spaces.
   - Public can list available spaces and view rental space details.
   - Location and range-based filtering added for public listing.
4. Implemented Rental Booking basics:
   - Customer can create rental space bookings.
   - Customer can list own bookings.
   - Admin can list platform rental bookings for activity inspection.
   - Booking is blocked when space is unavailable or conflicting.
5. Upgraded validation middleware to apply parsed/coerced values back to `req.body`, `req.params`, and `req.query`.
6. Added Phase 2 Prisma migration for schema extensions.

## Completed In Phase 3
1. Implemented Produce Marketplace module:
   - Vendor can create produce listings.
   - Vendor can update and delete only their own listings.
   - Public/customer can browse produce listings.
   - Public/customer can view single produce details.
2. Implemented Produce filtering and pagination:
   - Query filtering by `category`, `vendorId`, `certificationStatus`.
   - Product name search via `search`.
   - Pagination via `page` and `limit` with response metadata (`total`, `totalPages`, `hasNextPage`, `hasPrevPage`).
3. Implemented Order module:
   - Customer can place produce orders with quantity.
   - Customer can view own orders with pagination.
   - Vendor can view orders for own products with pagination.
   - Admin can view all orders with pagination and filters.
   - Vendor/Admin can update order status using controlled transitions.
4. Implemented stock management flow:
   - Stock is reduced transactionally when order is placed.
   - Stock update is race-safe using conditional `updateMany`.
   - Stock is restored when order transitions to `CANCELLED`.
5. Implemented shared pagination helper and reused it in produce/order listing endpoints.
6. Added Phase 3 Prisma schema/migration updates for order quantity/pricing and new indexes.
7. Wired new modules into central API routes.

## Completed In Phase 4
1. Implemented Community Forum module:
   - Authenticated users can create posts.
   - Public/users can list posts with pagination and optional search.
   - Public/users can view a single post.
   - Users can update/delete only their own posts.
   - Admin can update/delete any post for moderation.
2. Implemented Plant Tracking module:
   - Customers can create tracking records for plants, optionally linked to their rental bookings.
   - Customers can update their own tracking records.
   - Customers can list their tracking records with pagination and filters.
   - Added polling-friendly updates endpoint (`updatedAfter` + `limit`) for practical real-time tracking.
   - Vendor/Admin visibility added:
     - Vendor can view records tied to their rental bookings.
     - Admin can view all records with filters.
3. Added Phase 4 Prisma schema/migration updates:
   - New `PlantTracking` model.
   - Relation wiring from `User` and `RentalBooking`.
   - Indexes for owner and update-time query paths.
4. Expanded rate limiting:
   - Existing auth rate limiter kept.
   - Added limiter for certification submission.
   - Added write limiters for community and plant tracking endpoints.
   - Added env-configurable rate limit values.
5. Shared production-readiness improvements:
   - Configurable request body size limit.
   - Optional proxy trust configuration.
   - Disabled `x-powered-by`.
   - Added shared `sendErrorResponse` helper and reused it in global error/not-found/rate-limit handlers.
6. Wired new modules into central API routes.

## Completed In Phase 5 (Finalization)
1. Implemented full Prisma seeding flow:
   - Added `prisma/seed.js` using Prisma Client.
   - Seed dataset includes `ADMIN`, `VENDOR`, and `CUSTOMER` roles.
   - Added realistic relational records for:
     - admin user
     - customer users
     - 10 vendors + vendor profiles
     - sustainability certifications
     - rental spaces and rental bookings
     - 100 produce listings
     - orders
     - community posts
     - plant tracking records
2. Added Swagger/OpenAPI integration:
   - `GET /docs` for Swagger UI.
   - `GET /docs.json` for raw OpenAPI spec.
   - Documented major endpoints across auth, vendor, certification, rental, produce, order, community, and plant tracking modules.
3. Added API response/performance strategy documentation:
   - `docs/api-response-control-and-performance-strategy.md`
4. Added benchmark-oriented note and helper script:
   - `docs/benchmark-note.md`
   - `scripts/benchmark.js`
   - `npm run benchmark:api`
5. Final cleanup and readiness updates:
   - Verified route registration remains consistent.
   - Verified Prisma schema validity (`prisma validate` with explicit `DATABASE_URL`).
   - Expanded `.env.example` with seed/benchmark related variables.
   - Improved README with full setup, migration, seeding, docs, and benchmark workflow.

## Implemented Files
- Root/config:
  - `.env.example`
  - `.gitignore`
  - `package.json`
  - `tsconfig.json`
  - `README.md`
- Prisma:
  - `prisma/schema.prisma`
  - `prisma/seed.js`
  - `prisma/migrations/20260416143000_init/migration.sql`
  - `prisma/migrations/20260416152000_phase2_vendor_cert_rental_booking/migration.sql`
  - `prisma/migrations/20260416170000_phase3_marketplace_orders/migration.sql`
  - `prisma/migrations/20260416190000_phase4_community_plant_tracking/migration.sql`
  - `prisma/migrations/migration_lock.toml`
- App/bootstrap:
  - `src/app.ts`
  - `src/server.ts`
  - `src/config/env.ts`
  - `src/config/prisma.ts`
- API docs:
  - `src/docs/openapi.ts`
- Auth module:
  - `src/modules/auth/auth.route.ts`
  - `src/modules/auth/auth.controller.ts`
  - `src/modules/auth/auth.service.ts`
  - `src/modules/auth/auth.validation.ts`
- Vendor module:
  - `src/modules/vendor/vendor.route.ts`
  - `src/modules/vendor/vendor.controller.ts`
  - `src/modules/vendor/vendor.service.ts`
  - `src/modules/vendor/vendor.validation.ts`
- Certification module:
  - `src/modules/certification/certification.route.ts`
  - `src/modules/certification/certification.controller.ts`
  - `src/modules/certification/certification.service.ts`
  - `src/modules/certification/certification.validation.ts`
- Rental space module:
  - `src/modules/rental-space/rentalSpace.route.ts`
  - `src/modules/rental-space/rentalSpace.controller.ts`
  - `src/modules/rental-space/rentalSpace.service.ts`
  - `src/modules/rental-space/rentalSpace.validation.ts`
- Produce module:
  - `src/modules/produce/produce.route.ts`
  - `src/modules/produce/produce.controller.ts`
  - `src/modules/produce/produce.service.ts`
  - `src/modules/produce/produce.validation.ts`
- Order module:
  - `src/modules/order/order.route.ts`
  - `src/modules/order/order.controller.ts`
  - `src/modules/order/order.service.ts`
  - `src/modules/order/order.validation.ts`
- Community module:
  - `src/modules/community/community.route.ts`
  - `src/modules/community/community.controller.ts`
  - `src/modules/community/community.service.ts`
  - `src/modules/community/community.validation.ts`
- Plant tracking module:
  - `src/modules/plant-tracking/plantTracking.route.ts`
  - `src/modules/plant-tracking/plantTracking.controller.ts`
  - `src/modules/plant-tracking/plantTracking.service.ts`
  - `src/modules/plant-tracking/plantTracking.validation.ts`
- Routing:
  - `src/modules/routes.ts`
- Middleware:
  - `src/middlewares/auth.ts`
  - `src/middlewares/requireRole.ts`
  - `src/middlewares/globalErrorHandler.ts`
  - `src/middlewares/notFoundHandler.ts`
  - `src/middlewares/validateRequest.ts`
  - `src/middlewares/rateLimiter.ts`
- Shared helpers/utils:
  - `src/errors/AppError.ts`
  - `src/helpers/paginationHelper.ts`
  - `src/helpers/passwordHelper.ts`
  - `src/helpers/jwtHelper.ts`
  - `src/utils/catchAsync.ts`
  - `src/utils/sendResponse.ts`
  - `src/interfaces/auth.ts`
  - `src/interfaces/common.ts`
  - `src/types/express/index.d.ts`
- Docs:
  - `docs/phase1-notes.md`
  - `docs/api-response-control-and-performance-strategy.md`
  - `docs/benchmark-note.md`
- Scripts:
  - `scripts/benchmark.js`

## Routes Implemented
Base prefix: `/api/v1`

### Existing Auth Routes
- `POST /auth/register`
  - Public (rate-limited)
  - Body: `name`, `email`, `password`, optional `role` (`CUSTOMER` or `VENDOR`)
- `POST /auth/login`
  - Public (rate-limited)
  - Body: `email`, `password`
- `GET /auth/me`
  - Authenticated (JWT)
- `GET /auth/admin-only`
  - Authenticated + `ADMIN`
- `GET /auth/vendor-only`
  - Authenticated + `VENDOR` or `ADMIN`

### Vendor Profile Routes
- `GET /vendors/me`
  - Authenticated + `VENDOR`
- `PUT /vendors/me`
  - Authenticated + `VENDOR`
  - Body: `farmName`, `farmLocation`
- `GET /vendors`
  - Authenticated + `ADMIN`
  - Query (optional): `certificationStatus`, `location`, `search`
- `GET /vendors/:id`
  - Authenticated + `ADMIN`

### Sustainability Certification Routes
- `POST /certifications`
  - Authenticated + `VENDOR` (rate-limited)
  - Body: `certificationType` (`SUSTAINABILITY` or `ORGANIC`), `certifyingAgency`, `certificationDate`, optional `certificationNumber`, optional `documentUrl`
- `GET /certifications/me`
  - Authenticated + `VENDOR`
  - Query (optional): `status`
- `GET /certifications`
  - Authenticated + `ADMIN`
  - Query (optional): `status`, `vendorId`, `certificationType`
- `GET /certifications/:id`
  - Authenticated + `ADMIN`
- `PATCH /certifications/:id/review`
  - Authenticated + `ADMIN`
  - Body: `status` (`APPROVED` or `REJECTED`), optional `reviewNotes`

### Rental Space & Booking Routes
- `GET /rental-spaces`
  - Public (available spaces only)
  - Query (optional): `location`, `minSize`, `maxSize`, `minPrice`, `maxPrice`
- `POST /rental-spaces`
  - Authenticated + `VENDOR`
  - Body: `location`, `size`, `price`, optional `availability`
- `GET /rental-spaces/me/spaces`
  - Authenticated + `VENDOR`
- `GET /rental-spaces/:id`
  - Public
- `PATCH /rental-spaces/:id`
  - Authenticated + `VENDOR` (owner only)
- `DELETE /rental-spaces/:id`
  - Authenticated + `VENDOR` (owner only)
- `POST /rental-spaces/:id/book`
  - Authenticated + `CUSTOMER`
  - Body: `startDate`, `endDate`
- `GET /rental-spaces/bookings/me`
  - Authenticated + `CUSTOMER`
- `GET /rental-spaces/bookings`
  - Authenticated + `ADMIN`
  - Query (optional): `status`, `vendorId`, `customerId`

### Produce Marketplace Routes
- `GET /produce`
  - Public
  - Query (optional): `page`, `limit`, `category`, `vendorId`, `certificationStatus`, `search`
- `POST /produce`
  - Authenticated + `VENDOR`
  - Body: `name`, `description`, `price`, `category`, optional `certificationStatus`, `availableQuantity`
- `GET /produce/:id`
  - Public
- `PATCH /produce/:id`
  - Authenticated + `VENDOR` (owner only)
- `DELETE /produce/:id`
  - Authenticated + `VENDOR` (owner only)

### Order Routes
- `POST /orders`
  - Authenticated + `CUSTOMER`
  - Body: `produceId`, `quantity`
- `GET /orders/me`
  - Authenticated + `CUSTOMER`
  - Query (optional): `page`, `limit`, `status`
- `GET /orders/vendor`
  - Authenticated + `VENDOR`
  - Query (optional): `page`, `limit`, `status`, `customerId`
- `GET /orders`
  - Authenticated + `ADMIN`
  - Query (optional): `page`, `limit`, `status`, `vendorId`, `customerId`
- `GET /orders/:id`
  - Authenticated + `CUSTOMER` or `VENDOR` or `ADMIN`
  - Access-scoped by role (own/relevant/all)
- `PATCH /orders/:id/status`
  - Authenticated + `VENDOR` or `ADMIN`
  - Body: `status` (`PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`)

### Community Forum Routes
- `GET /community-posts`
  - Public
  - Query (optional): `page`, `limit`, `userId`, `search`
- `POST /community-posts`
  - Authenticated (all roles) + rate-limited
  - Body: `postContent`
- `GET /community-posts/:id`
  - Public
- `PATCH /community-posts/:id`
  - Authenticated (owner or `ADMIN`) + rate-limited
  - Body: `postContent`
- `DELETE /community-posts/:id`
  - Authenticated (owner or `ADMIN`) + rate-limited

### Plant Tracking Routes
- `POST /plant-tracking`
  - Authenticated + `CUSTOMER` + rate-limited
  - Body: `plantName`, `growthStage`, `healthStatus`, optional `rentalBookingId`, optional `expectedHarvestDate`, optional `notes`
- `GET /plant-tracking/me`
  - Authenticated + `CUSTOMER`
  - Query (optional): `page`, `limit`, `rentalBookingId`, `growthStage`, `healthStatus`, `updatedAfter`
- `GET /plant-tracking/me/updates`
  - Authenticated + `CUSTOMER`
  - Query (optional): `updatedAfter`, `limit`
- `GET /plant-tracking`
  - Authenticated + `VENDOR` or `ADMIN`
  - Query (optional): `page`, `limit`, `userId`, `vendorId`, `rentalBookingId`, `growthStage`, `healthStatus`, `updatedAfter`
- `GET /plant-tracking/:id`
  - Authenticated + `CUSTOMER` or `VENDOR` or `ADMIN`
  - Access-scoped by role (owner/vendor-related/admin)
- `PATCH /plant-tracking/:id`
  - Authenticated + `CUSTOMER` or `ADMIN` + rate-limited
  - Body: any of `plantName`, `growthStage`, `healthStatus`, optional `rentalBookingId`, optional `expectedHarvestDate`, optional `notes`

### Health Route
- `GET /health`
  - Public (outside `/api/v1`)

### Documentation Routes
- `GET /docs`
  - Public Swagger UI
- `GET /docs.json`
  - Public OpenAPI JSON

## Prisma Models Implemented
- `User`
- `VendorProfile`
- `Produce`
- `RentalSpace`
- `RentalBooking` (added in Phase 2)
- `Order`
- `CommunityPost`
- `PlantTracking` (added in Phase 4)
- `SustainabilityCert` (extended in Phase 2)

### Prisma Enums Implemented
- `UserRole` (`ADMIN`, `VENDOR`, `CUSTOMER`)
- `UserStatus` (`ACTIVE`, `INACTIVE`, `SUSPENDED`)
- `CertificationStatus` (`PENDING`, `APPROVED`, `REJECTED`)
- `CertificationType` (`SUSTAINABILITY`, `ORGANIC`) (added in Phase 2)
- `OrderStatus` (`PENDING`, `CONFIRMED`, `PROCESSING`, `SHIPPED`, `DELIVERED`, `CANCELLED`, `COMPLETED`) (`COMPLETED` added in Phase 3)
- `RentalAvailability` (`AVAILABLE`, `UNAVAILABLE`, `OCCUPIED`)
- `RentalBookingStatus` (`CONFIRMED`, `CANCELLED`, `COMPLETED`) (added in Phase 2)

## Phase 2 Schema Changes
1. `SustainabilityCert` extended with:
   - `certificationType`
   - `certificationNumber` (optional)
   - `documentUrl` (optional)
   - `status`
   - `reviewNotes` (optional)
   - `reviewedAt` (optional)
   - `reviewedById` (optional FK to `User`)
2. Added `RentalBooking` model for booking lifecycle.
3. Added new relations on `User`:
   - reviewed certification relation
   - customer bookings relation
   - vendor bookings relation
4. Added relation from `RentalSpace` to `RentalBooking`.
5. Added indexes for common Phase 2 queries:
   - Vendor profile status/location
   - Rental space location
   - Certification status/reviewer
   - Booking lookup/status/date range

## Phase 3 Schema Changes
1. `OrderStatus` enum extended with `COMPLETED`.
2. `Order` model extended with:
   - `quantity`
   - `unitPrice`
   - `totalPrice`
3. Added indexes for marketplace/order query paths:
   - `Produce.certificationStatus`
   - `Produce.name`
   - `Order.orderDate`
   - `Order(userId, status)`
   - `Order(vendorId, status)`

## Phase 4 Schema Changes
1. Added `PlantTracking` model:
   - `id`, `userId`, optional `rentalBookingId`, `plantName`, `growthStage`, `healthStatus`, optional `expectedHarvestDate`, optional `notes`, `createdAt`, `updatedAt`
2. Added relation from `User` to `PlantTracking` (`plantTrackings`).
3. Added relation from `RentalBooking` to `PlantTracking` (`plantTrackings`).
4. Added indexes for real-time/polling and ownership query paths:
   - `PlantTracking(userId)`
   - `PlantTracking(rentalBookingId)`
   - `PlantTracking(updatedAt)`
   - `PlantTracking(userId, updatedAt)`

## Middleware Implemented
- Auth middleware (JWT verification + active-user check)
- Role guard middleware (`requireRole`)
- Validation middleware (`zod`, now applies parsed/coerced values back to request)
- Configurable rate limiter middleware set:
  - Auth rate limiter
  - Certification submission rate limiter
  - Community write rate limiter
  - Plant tracking write rate limiter
- Global error handler
- Not-found handler

## Standard Response Format
Success:
```json
{
  "success": true,
  "message": "Human readable message",
  "data": {},
  "meta": {}
}
```

Error:
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "details": {}
  }
}
```

## New Business Rules (Phase 2, 3 & 4)
1. Vendor profile is mandatory before certification submission.
2. Vendor can only have one pending certification at a time.
3. Admin review can only happen for `PENDING` certifications.
4. On certification submit/review, `VendorProfile.certificationStatus` is synchronized.
5. Rental space management is owner-only for vendors.
6. Public listing only returns rental spaces with `availability = AVAILABLE`.
7. Customer booking is blocked when:
   - space is not `AVAILABLE`, or
   - booking date range conflicts with existing confirmed booking.
8. Booking flow updates rental space availability to `OCCUPIED` after successful booking.
9. Customers cannot book their own vendor rental spaces.
10. Vendor profile must exist before vendor can create produce listings.
11. A produce listing can only be published as `APPROVED` when vendor certification is `APPROVED`.
12. If produce certification status is not provided on create:
    - vendor with approved certification -> produce defaults to `APPROVED`
    - vendor without approved certification -> produce defaults to `PENDING`
13. Produce listing endpoint returns only items with `availableQuantity > 0`.
14. Customer orders are blocked when requested quantity exceeds available stock.
15. Stock reduction is transaction-safe (atomic decrement with conditional check).
16. Order status transitions are restricted:
    - `PENDING` -> `CONFIRMED` or `CANCELLED`
    - `CONFIRMED` -> `COMPLETED` or `CANCELLED`
    - `CANCELLED` and `COMPLETED` are terminal
17. Cancelling an order restores product stock by ordered quantity.
18. Community post update/delete is owner-only, except `ADMIN` moderation override.
19. Plant tracking create endpoint is restricted to `CUSTOMER`.
20. Plant tracking records linked to booking must belong to the acting customer.
21. Plant tracking records cannot be attached to cancelled bookings.
22. Vendor plant tracking visibility is scoped to records tied to the vendor's rental bookings.
23. Real-time plant tracking requirement is handled with polling-friendly reads:
    - list endpoint supports `updatedAfter`
    - dedicated updates endpoint returns incremental changes plus `latestUpdatedAt`.

## Required Environment Variables
- `NODE_ENV`
- `PORT`
- `DATABASE_URL` (PostgreSQL)
- `JWT_SECRET`
- `JWT_EXPIRES_IN`
- `BCRYPT_SALT_ROUNDS`
- `TRUST_PROXY` (optional, default `false`)
- `REQUEST_BODY_LIMIT` (optional, default `1mb`)
- `RATE_LIMIT_WINDOW_MS` (optional, default `900000`)
- `AUTH_RATE_LIMIT_MAX` (optional, default `25`)
- `CERTIFICATION_RATE_LIMIT_MAX` (optional, default `10`)
- `FORUM_WRITE_RATE_LIMIT_MAX` (optional, default `40`)
- `PLANT_TRACKING_WRITE_RATE_LIMIT_MAX` (optional, default `60`)
- `SEED_DEFAULT_PASSWORD` (optional, default `Password@123`)
- `BENCHMARK_BASE_URL` (optional, default `http://localhost:5000`)
- `BENCHMARK_EMAIL` (optional, default `admin@greengrid.local`)
- `BENCHMARK_PASSWORD` (optional, default `Password@123`)

## Known Limitations / Assumptions
1. A reviewed certification status (`APPROVED` or `REJECTED`) directly updates vendor profile certification status.
2. Booking endpoint currently creates confirmed bookings directly (no separate payment/approval step yet).
3. Space availability becomes `OCCUPIED` after booking; no automated release workflow is implemented yet.
4. Legacy order statuses (`PROCESSING`, `SHIPPED`, `DELIVERED`) remain in enum for compatibility, but Phase 3 status update endpoint only supports `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED`.
5. Real-time plant tracking is implemented as polling-friendly incremental APIs (`updatedAfter`) instead of SSE/WebSocket.
6. Benchmark helper is lightweight and intended for sanity checks, not production-grade load testing.
7. Seeding requires a valid PostgreSQL connection and a configured `DATABASE_URL`.

## Final Route Summary
Public:
- `GET /health`
- `GET /docs`
- `GET /docs.json`
- Public listing/detail routes for rental spaces, produce, and community posts

Authenticated route groups:
- Auth: register/login/me + role-guard sample endpoints
- Vendors: profile upsert/view + admin vendor listing/detail
- Certifications: submit/list/review flow
- Rental spaces: vendor CRUD, customer booking, customer/admin booking views
- Produce: vendor CRUD + public listing/detail
- Orders: customer create/view, vendor/admin list, scoped detail, status update
- Community: create/update/delete with owner/admin moderation rules
- Plant tracking: create/update/list, incremental updates endpoint, vendor/admin scoped visibility

## Final Model Summary
Prisma models:
- `User`
- `VendorProfile`
- `SustainabilityCert`
- `RentalSpace`
- `RentalBooking`
- `Produce`
- `Order`
- `CommunityPost`
- `PlantTracking`

Prisma enums:
- `UserRole`
- `UserStatus`
- `CertificationStatus`
- `CertificationType`
- `OrderStatus`
- `RentalAvailability`
- `RentalBookingStatus`

## Setup Instructions Summary
1. `npm install`
2. `cp .env.example .env` and update `DATABASE_URL`
3. `npm run prisma:generate`
4. `npm run prisma:migrate -- --name init`
5. `npm run prisma:seed`
6. `npm run dev`
7. Open docs at `http://localhost:5000/docs`

## Post-Submission Improvement Backlog
1. Add unit/integration test coverage for service and route layers.
2. Add structured logs and audit trail for sensitive state transitions.
3. Add payment-aware lifecycle extensions for booking/order flows.
4. Add advanced load testing profiles (k6/Artillery) and percentile tracking.

## Final Submission Checklist
- [x] Express + Prisma + PostgreSQL stack preserved
- [x] Modular architecture preserved (`route -> validation -> controller -> service`)
- [x] All Phases 1-4 functionality retained
- [x] Seeder implemented with demonstrable relational dataset
- [x] At least 10 vendors and 100 products seeded
- [x] Swagger/OpenAPI integrated and exposed
- [x] Response-control and performance strategy note added
- [x] Benchmark note and runnable benchmark helper added
- [x] `.env.example` updated for setup clarity
- [x] `README.md` upgraded with full setup/run/docs/seed steps
- [x] Final `codex.md` updated with completed status and summaries

## Final Project Status
Phase 5 completed. The backend is submission-ready with seed data, API documentation, benchmark guidance, and final documentation polish.
