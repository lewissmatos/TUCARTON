# Implementation Plan: TuCarton Phase 0 Foundation Repository Structure

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-09-foundation-repo-structure` |
| State | `awaiting_verification` |
| Coder | Codex |
| Approved spec revision | Conversation approval, 2026-09-09 |

## Plan

1. Create an npm-workspaces TypeScript monorepo with `apps`, shared `packages`, documentation, and test boundaries — satisfies `AC-01`, `AC-04`, and `AC-07`.
2. Add minimal Expo Router mobile and NestJS/OpenAPI API entrypoints plus framework-independent shared packages — satisfies `AC-01` and `AC-05`.
3. Add pinned baseline dependencies and lockfile, with root scripts for static checks, formatting, and tests — satisfies `AC-02`, `AC-04`, and `AC-05`.
4. Add local-only PostgreSQL Compose infrastructure, safe environment examples, ignore rules, and developer documentation — satisfies `AC-03` and `AC-06`.
5. Run the documented static checks and local database health check; record results and hand off to independent verification — satisfies `AC-02` through `AC-07`.

## Files and interfaces affected

| Path / interface | Intended change | Criteria |
| --- | --- | --- |
| `package.json`, `package-lock.json` | npm workspace manifest, pinned dependencies, and root scripts | AC-02, AC-04 |
| `apps/mobile/` | Expo Router mobile shell and local-persistence/security/QR package boundaries | AC-01, AC-05 |
| `apps/api/` | NestJS REST/OpenAPI health shell and API environment boundary | AC-01, AC-05 |
| `packages/*/` | Domain, validation, typed-client, and shared tooling boundaries | AC-01, AC-05 |
| `compose.yaml`, `.env.example`, `.gitignore` | Local PostgreSQL and safe configuration conventions | AC-03, AC-06 |
| `docs/` | Dependency inventory, architecture boundary notes, and unresolved decisions | AC-04, AC-05, AC-07 |
| `tests/` | Explicit ownership locations for unit, API, mobile, and offline-sync tests | AC-01, AC-05 |

## Test and evidence log

| Check | Command / method | Result | Criteria |
| --- | --- | --- | --- |
| Dependency installation | `npm install --save-exact …` | Passed; manifests contain exact versions and `package-lock.json` lockfile v3 | AC-02, AC-04 |
| Format check | `npm run format` | Passed | AC-02 |
| Lint | `npm run lint` | Passed | AC-02 |
| Type check | `npm run typecheck` | Passed across API, mobile, and shared code packages | AC-02 |
| Test baseline | `npm test` | Passed: 1 domain-vocabulary test | AC-02 |
| Expo dependency validation | `EXPO_NO_TELEMETRY=1 npx expo install --check` | Passed: `Dependencies are up to date` | AC-04, AC-05 |
| API runtime smoke test | `npm run api:dev` plus `curl --fail --silent http://127.0.0.1:3000/api/v1/health` | Passed: returned `{"status":"ok"}` | AC-01, AC-05 |
| PostgreSQL configuration | `docker compose config --quiet` | Passed | AC-03 |
| PostgreSQL readiness | `docker compose up -d postgres` | Blocked: Docker daemon socket unavailable on this machine | AC-03 |
| Secret/configuration inspection | Inspected `.gitignore`, `.env.example`, Compose file, and package manifests | Passed: examples contain local development values only; secrets and generated paths are ignored | AC-06 |

## Deviations and decisions

- npm workspaces is selected because npm `11.17.0` is present in the development environment and its official workspace support provides local-package linking without an additional orchestration tool.
- The `TBD-001`, `TBD-002`, `TBD-003`, `TBD-004`, and `TBD-005` choices remain unresolved. No authentication provider, ORM, hosting provider, push provider, or offline-signature implementation is added.
- Expo SDK-compatible packages will be installed using exact versions. The official Expo SDK reference lists SDK 57 with a Node.js minimum of `22.13.x`; the repository will document this as its initial baseline.
- The npm registry resolved NestJS 12.0.1 while the product specification only requires NestJS; this is a pinned foundation version, not a change to the product architecture.
- npm reported one unapproved `@scarf/scarf` post-install telemetry script. It was not approved or executed. The final installation audit reported zero known vulnerabilities.

## Handoff to Verifier

Work item: `2026-09-09-foundation-repo-structure`  
State: `awaiting_verification`  
From → To: Coder → Verifier  
Artifact: `.agents/work-items/2026-09-09-foundation-repo-structure/implementation-plan.md`  
Ready: All planned scaffold changes are present, with exact dependency manifests and `package-lock.json`; the API health endpoint and Expo package compatibility were exercised.  
Evidence: Passed `npm run format`, `npm run lint`, `npm run typecheck`, `npm test` (1 test), `EXPO_NO_TELEMETRY=1 npx expo install --check`, `docker compose config --quiet`, and API health curl.  
Risks / blockers: PostgreSQL runtime readiness is blocked by an unavailable local Docker daemon. The repository has no `.git` directory, so no commit revision is available. Deferred source-spec TBDs remain unimplemented by design.  
Requested action: Independently inspect the scope/lockfile/configuration, rerun checks, and run the PostgreSQL health check when Docker is available.
