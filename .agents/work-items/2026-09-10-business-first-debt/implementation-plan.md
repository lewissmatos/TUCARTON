# Implementation Plan: Business and first debt request

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-10-business-first-debt` |
| State | `implementing` |
| Coder | Codex |
| Approved spec revision | `2026-09-10` |

## Plan

1. Add business, relationship, and debt persistence with a forward migration — satisfies `AC-01`–`AC-04`.
2. Add local-session-protected API endpoints with ownership/customer authorization — satisfies `AC-01`–`AC-04`.
3. Add a Spanish mobile first-use screen for the core actions — satisfies `AC-05`.
4. Run focused static checks and an API smoke flow; leave independent verification for later as requested.

## Files and interfaces affected

| Path / interface | Intended change | Criteria |
| --- | --- | --- |
| `apps/api/src/db/schema.ts` | Business and ledger tables | AC-01–AC-04 |
| `apps/api/src/business/*` | Business and debt API | AC-01–AC-04 |
| `apps/api/drizzle/0002_business_first_debt.sql` | Database migration | AC-01–AC-04 |
| `apps/mobile/app/index.tsx` | First-use core flow | AC-05 |

## Test and evidence log

| Check | Command / method | Result | Criteria |
| --- | --- | --- | --- |
| Typecheck | `npm run typecheck` | Passed: all workspaces compiled after API and mobile updates | AC-01–AC-05 |
| Lint | `npm run lint` | Passed | AC-01–AC-05 |
| Tests | `npm run test` | Passed: 3 files, 3 tests | AC-01–AC-04 |
| Migration | `npm run db:migrate --workspace=@tucarton/api` | Passed: `0002_business_first_debt` applied | AC-01–AC-04 |
| API startup | `npm run api:dev` | Compiled and registered all new routes; port smoke was blocked by an existing process on 3000 | AC-01–AC-04 |

## Deviations and decisions

- Independent verification is intentionally deferred by the Senior Developer; this item remains implementing until later review.
- The mobile first slice currently supports owner actions. Customer acknowledgment is implemented in the API and is ready for a second signed-in user flow.
- The mobile screen now also loads pending customer debts and provides a Spanish `Confirmar` action for the signed-in customer.
- The mobile frontend was refactored into `features`, `components`, `api`, `theme`, and `types`; colors, spacing, radii, and type sizes are centralized in `src/theme/tokens.ts`.

## Handoff to Verifier

Not requested yet. The next owner should independently exercise the authenticated two-user flow when verification is resumed.
