# Implementation Plan: TuCartón Phone-First Access

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-10-phone-first-access` |
| State | `implementing` |
| Coder | Codex |
| Approved spec revision | Conversation approval, 2026-09-10 |

## Plan

1. Inspect the existing user, fake OTP, and Auth0 guard boundaries; add application-owned session credentials without weakening protected API checks — `AC-01` to `AC-05`.
2. Adapt local phone verification to create/restore accounts and issue/revoke secure local sessions — `AC-01` to `AC-05`.
3. Replace the mobile Auth0 entry UI with a Spanish phone and six-digit-code flow backed by Keychain storage — `AC-01` to `AC-06`.
4. Preserve a development-only fake OTP and add clear tests for phone-first state transitions and production guardrails — `AC-03`, `AC-07`.
5. Run focused tests, type checks, lint, and a device/simulator smoke test — `AC-01` to `AC-07`.

## Files and interfaces affected

| Path / interface | Intended change | Criteria |
| --- | --- | --- |
| `apps/api/src/auth/` | Local phone identity, OTP completion, session lifecycle, and guards | AC-01 to AC-05 |
| `apps/api/src/db/` | Local session persistence and migrations | AC-01, AC-04 |
| `apps/mobile/app/` | Phone-first Spanish onboarding and session restoration | AC-01 to AC-06 |
| `apps/mobile/src/auth/` | Keychain-backed local session adapter | AC-04 |
| `apps/**/test` | Phone-first API/mobile coverage | AC-01 to AC-07 |

## Test and evidence log

| Check | Command / method | Result | Criteria |
| --- | --- | --- | --- |
| Static checks | `npm run typecheck` and `npm run lint` | Passed across API, mobile, and workspace packages | AC-01 to AC-07 |
| Existing automated tests | `npm run test` | Passed: 3 test files / 3 tests | Regression coverage, AC-07 |
| Database migration | `npm run db:migrate --workspace=@tucarton/api`; inspected `local_sessions` | Passed: Drizzle migration journal created and local session table present in PostgreSQL | AC-01, AC-04 |
| Phone-first API smoke test | Local `phone-access/start` and `phone-access/verify` requests using `809 555 0000` and fake code | Passed: number normalized to `+18095550000`; account/session issued | AC-01, AC-02, AC-04, AC-07 |
| Device development setup | Expo Dev Client installed, iOS pods updated, signed iPhone build installed, Metro started with local API configuration | Passed through installation. Post-install launch is blocked by a reset physical-device control connection; reconnect/unlock is required for visual smoke test. | AC-06 |

## Deviations and decisions

- Real SMS is not in scope. The local fake provider remains restricted to development/testing.
- Existing Auth0 code is not deleted until the phone-first flow has independent verification.
- Drizzle migrations now load the repository root `.env`, matching the Nest API configuration. The mobile development `.env` contains only the current LAN API URL and is not a committed secret.

## Handoff to Verifier

Implementation in progress.
