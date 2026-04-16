# API Response Control and Performance Strategy

## Standardized Response Structure
All endpoints use a shared JSON contract from `sendResponse` and `sendErrorResponse`.

Success shape:
```json
{
  "success": true,
  "message": "Human readable status",
  "data": {},
  "meta": {}
}
```

Error shape:
```json
{
  "success": false,
  "message": "Error message",
  "error": {
    "details": {},
    "code": "OPTIONAL_CODE"
  }
}
```

## Centralized Error Handling
- Domain and authorization errors are thrown as `AppError`.
- Validation errors (`zod`) are normalized in `globalErrorHandler`.
- Prisma known errors are mapped to stable HTTP responses (e.g. `P2002` -> `409`, `P2025` -> `404`).
- JWT failures are normalized to `401`/`403` depending on condition.
- Unmatched routes are handled by `notFoundHandler`.

## Pagination Strategy
- Shared helper: `getPaginationOptions` + `buildPaginationMeta`.
- Defaults: `page=1`, `limit=10`.
- Upper bound: `limit <= 100`.
- Pagination metadata fields:
  - `page`
  - `limit`
  - `total`
  - `totalPages`
  - `hasNextPage`
  - `hasPrevPage`

## Rate Limiting Strategy
- Global window controlled by `RATE_LIMIT_WINDOW_MS`.
- Route-level limiters:
  - Auth (`/auth/register`, `/auth/login`)
  - Certification submit (`POST /certifications`)
  - Community writes (`POST/PATCH/DELETE /community-posts`)
  - Plant tracking writes (`POST/PATCH /plant-tracking`)
- Limits are environment-driven for easy tuning per deployment.

## Query Filtering Strategy
- Filtering is explicit and validated with `zod` per module.
- Current filter dimensions include:
  - textual search (`search`, case-insensitive contains)
  - enum filters (status/certification values)
  - relation filters (`vendorId`, `customerId`, `userId`, booking id)
  - range filters (`minPrice/maxPrice`, `minSize/maxSize`)
  - incremental reads via `updatedAfter` for polling use cases

## Access Control Strategy
- Authentication: JWT bearer token (`Authorization: Bearer <token>`).
- Authorization: role guard middleware (`requireRole`) + service-level ownership checks.
- Role model:
  - `ADMIN`: cross-platform moderation/oversight
  - `VENDOR`: own profile/spaces/produce and vendor-scoped visibility
  - `CUSTOMER`: booking/order/plant-tracking ownership flows
- Sensitive actions additionally enforce ownership or relationship checks in service layer.
