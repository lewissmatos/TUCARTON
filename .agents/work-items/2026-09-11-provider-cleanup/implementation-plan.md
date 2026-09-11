# Implementation Plan: Remove external identity-provider configuration

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-11-provider-cleanup` |
| State | `implementing` |
| Coder | Codex |
| Approved spec revision | `2026-09-11` |

## Plan

1. Update tracked architecture, dependency, and environment documentation to describe local passcode sessions only; remove the retired phone-verification field through migration — satisfies `AC-01`, `AC-02`, `AC-05`.
2. Amend active navigation and roadmap specifications; mark old provider/OTP work items superseded — satisfies `AC-03`, `AC-04`.
3. Search package manifests, configuration, and source; run static checks and record results — supports all criteria.

## Test and evidence log

| Check | Command / method | Result | Criteria |
| --- | --- | --- | --- |
| Repository search | Active source, manifests, Expo config, docs, and active specs inspected | Passed: no external provider package, plugin, runtime configuration, or active setup instruction remains | AC-01–AC-04 |
| Migration | `npm run db:migrate --workspace=@tucarton/api` | Blocked: Docker Desktop daemon became unavailable while applying `0005_remove_phone_verification` | AC-05 |
| Tests | `npm run test` | Passed: 4 files, 6 tests | All |
| Lint | `npm run lint` | Passed | All |
| Typecheck | `npm run typecheck` | Passed across all workspaces | All |

## Handoff to Verifier

Source/configuration cleanup is ready for review. Before verification, start Docker Desktop and rerun `npm run db:migrate --workspace=@tucarton/api`; then confirm `phone_verified_at` is absent from the local `users` table. Ignored local `.env` values are intentionally outside the tracked cleanup scope.
