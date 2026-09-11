# Implementation Plan: Profile registration and passcode access

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-11-credentials-profile-access` |
| State | `awaiting_verification` |
| Coder | Codex |
| Approved spec revision | `2026-09-11` |

## Plan

1. Add a forward-only user profile/passcode migration and scrypt credential helpers; replace OTP endpoints with registration, login, profile, and logout endpoints — satisfies `AC-01`–`AC-04`.
2. Replace the mobile code flow with dedicated Spanish account-creation and passcode-login forms that establish existing secure sessions — satisfies `AC-01`–`AC-04`, `AC-07`.
3. Resolve business clients by code or normalized phone and return safe display data to linked business views — satisfies `AC-05`, `AC-06`.
4. Delete active fake OTP implementation, run migration and automated checks without launching application processes, and prepare verification handoff — supports all criteria.

## Files and interfaces affected

| Path / interface | Intended change | Criteria |
| --- | --- | --- |
| `apps/api/drizzle/0004_*`, `src/db/schema.ts` | Profile and credential persistence | AC-01–AC-03 |
| `apps/api/src/auth/*` | Local registration/login/session API; remove OTP provider | AC-01–AC-04 |
| `apps/api/src/business/*` | Client identifier resolution by code or phone | AC-05–AC-06 |
| `apps/mobile/src/features/auth/*`, `src/api/api-client.ts`, `src/types/core.ts` | Registration/login forms and session contracts | AC-01–AC-04, AC-07 |
| `apps/mobile/src/features/business/*` | Client name and code/phone entry | AC-05–AC-06 |

## Test and evidence log

| Check | Command / method | Result | Criteria |
| --- | --- | --- | --- |
| Migration | `npm run db:migrate --workspace=@tucarton/api` | Passed: `0004_profile_passcode_access` applied successfully | AC-01–AC-06 |
| Tests | `npm run test` | Passed: 4 files, 6 tests | AC-01–AC-06 |
| Lint | `npm run lint` | Passed | All |
| Typecheck | `npm run typecheck` | Passed across all workspaces | All |
| Static removal check | `rg` against active app source | Passed: no OTP/fake-code/phone-access implementation references remain | AC-04 |

## Deviations and decisions

- No server, Metro, simulator, or device process will be started by the Coder; the Senior Developer runs interactive checks.
- The existing mobile session storage remains; raw phone and passcode are form-local state only.

## Handoff to Verifier

Implementation is ready for independent verification. Test a new-account registration, a duplicate registration error, returning login, wrong passcode, client addition by both code and phone, and a debt using a linked customer. Confirm raw phone/passcode values are not persisted outside form memory or returned in API payloads. The Senior Developer should perform the iPhone keyboard walkthrough using their own Metro/API processes.
