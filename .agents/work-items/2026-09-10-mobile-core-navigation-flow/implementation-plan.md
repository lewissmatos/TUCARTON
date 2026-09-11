# Implementation Plan: Mobile core navigation and task flows

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-10-mobile-core-navigation-flow` |
| State | `awaiting_verification` |
| Coder | Codex |
| Approved spec revision | `2026-09-10` (customer terminology amendment) |

## Plan

1. Create a session provider and access/app route groups so authenticated navigation has one session boundary — satisfies `AC-01`, `AC-08`.
2. Implement `Inicio`, standalone colmado creation, business overview, customers, add-customer, debt entry, and business history routes — satisfies `AC-01`–`AC-05`.
3. Implement `Mi cuenta`, pending decision, customer relationship summary, and history routes — satisfies `AC-06`, `AC-07`, `AC-09`.
4. Make phone access keyboard-safe on iPhone and remove the catch-all workspace route; run static/regression checks without launching application processes — supports `AC-10` and all navigation criteria.

## Files and interfaces affected

| Path / interface | Intended change | Criteria |
| --- | --- | --- |
| `apps/mobile/app/(access)/*`, `app/(app)/*` | Expo Router access/app routes and stack flows | AC-01–AC-10 |
| `apps/mobile/src/auth/session-context.tsx` | Persisted session owner and route boundary state | AC-08 |
| `apps/mobile/src/features/auth/*` | Keyboard-aware, scrollable phone access flow | AC-10 |
| `apps/mobile/src/features/home/*`, `features/business/*`, `features/account/*` | Task-specific mobile screens | AC-01–AC-07, AC-09 |
| `apps/mobile/src/components/*` | Reusable page/action UI | AC-09 |
| `apps/mobile/src/api/api-client.ts` | Customer-list API adapter | AC-03–AC-05 |

## Test and evidence log

| Check | Command / method | Result | Criteria |
| --- | --- | --- | --- |
| Typecheck | `npm run typecheck` | Passed across all workspaces | AC-01–AC-09 |
| Lint | `npm run lint` | Passed | AC-01–AC-09 |
| Tests | `npm run test` | Passed: 4 files, 5 tests | AC-01–AC-09 |
| Route inspection | Static review of route tree and screen boundaries | Passed: access/app groups and dedicated business/account task routes replace the catch-all workspace | AC-01–AC-09 |

## Deviations and decisions

- Use stack navigation from `Inicio`; defer a persistent bottom tab bar.
- Call the customer-facing area `Mi cuenta`.
- Use “Cliente(s)” for all business-facing UI; retain the neutral internal customer/relationship model and non-user-facing route paths.
- Do not start local app processes as part of implementation; the Senior Developer runs these in their own terminal.
- Simulator/device walkthrough is intentionally left to the Senior Developer and independent Verifier; no Metro, API, simulator, or physical-device process was launched for this work item.

## Handoff to Verifier

Implementation is ready for independent verification. Test the first-account, first-colmado, no-customer, linked-customer, pending-decision, and relationship-history paths. Confirm each task is on a separate screen and Spanish copy is complete.
