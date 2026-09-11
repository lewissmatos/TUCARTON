# Implementation Plan: Shared ledger completion — decisions, balances, and history

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-10-shared-ledger-completion` |
| State | `awaiting_verification` |
| Coder | Codex |
| Approved spec revision | `2026-09-10` |

## Plan

1. Extend the debt lifecycle schema with immutable rejection metadata and a forward-only migration — satisfies `AC-01`, `AC-02`.
2. Add ledger summary, history, reject, and authorization behavior in a dedicated API ledger module — satisfies `AC-01`–`AC-05`, `AC-07`.
3. Extract shared money formatting and add mobile ledger feature views for summary, pending decisions, and history — satisfies `AC-06`.
4. Add focused unit/API behavior tests and run migration, typecheck, lint, and regression checks — supports all criteria.

## Files and interfaces affected

| Path / interface | Intended change | Criteria |
| --- | --- | --- |
| `apps/api/src/db/schema.ts`, `apps/api/drizzle/0003_*` | Debt rejected state and audit metadata | AC-01, AC-02 |
| `apps/api/src/ledger/*` | Summary/history calculation and customer decision routes | AC-01–AC-05, AC-07 |
| `apps/api/src/business/*` | Route migration to ledger service where necessary | AC-01–AC-05 |
| `apps/mobile/src/features/ledger/*` | Relationship summary, history, confirm/reject UI | AC-06 |
| `apps/mobile/app/ledger.tsx` | Expo Router route for balance/history view | AC-06 |
| `apps/mobile/src/api/api-client.ts`, `src/lib/*` | Typed endpoints and DOP formatting | AC-04, AC-06 |
| `apps/**/src/**/*.test.ts` | Lifecycle, balance, pagination, and access tests | AC-01–AC-07 |

## Test and evidence log

| Check | Command / method | Result | Criteria |
| --- | --- | --- |
| Schema migration | `npm run db:migrate --workspace=@tucarton/api` | Passed: `0003_shared_ledger_completion` applied locally | AC-01, AC-02 |
| Unit/API tests | `npm run test` | Passed: 4 files, 5 tests; added confirmed-only balance and stable-pagination coverage | AC-01, AC-02, AC-04, AC-07 |
| Typecheck | `npm run typecheck` | Passed across all workspaces | AC-01–AC-07 |
| Lint | `npm run lint` | Passed | AC-01–AC-07 |
| Two-user smoke flow | Local API sessions for owner/customer/unrelated user | Passed: rejected 5000 minor units excluded; confirmed 7500 included; history contains both statuses; unrelated request returned 404 | AC-01–AC-05, AC-07 |

## Deviations and decisions

- Rejection uses an optional free-text reason, remains visible in standard history, and records a timestamp and customer identity.
- The first balance projection includes confirmed debts only. Payment and reversal effects are intentionally deferred.
- Amount display uses DOP without `.00` for whole amounts.
- Pending decision and relationship summary UI compiles but still requires independent simulator/device review for visual acceptance.
- Added `/ledger` as a dedicated Expo Router screen. The home workspace remains the quick-action entry point and links to the route.

## Handoff to Verifier

Implementation is ready for independent verification. Exercise the owner/customer/unrelated-user lifecycle, balances, privacy, pagination, migration, and mobile Spanish UI. Do not accept based solely on coder-run checks.
