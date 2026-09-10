# TuCarton Foundation Stack and Dependencies

## Selected foundation stack

| Concern                      | Selection                                                 | Why it belongs in Phase 0                                                                                      |
| ---------------------------- | --------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| Package management           | npm workspaces                                            | One lockfile and native workspace linking for application and shared packages.                                 |
| Mobile                       | Expo SDK 57, React Native, React, TypeScript, Expo Router | Product-spec baseline for Android and iOS. Expo SDK 57 documents a Node.js minimum of `22.13.x`.               |
| Mobile persistence           | `expo-sqlite`                                             | Required local database boundary for later offline-first reads and persistent outbox work.                     |
| Mobile credential storage    | `expo-secure-store`                                       | Required boundary for later session/device credential storage.                                                 |
| Mobile QR capability         | `expo-camera`                                             | Later QR scanning work needs barcode detection; no QR product flow is implemented here.                        |
| API                          | NestJS, Express adapter, TypeScript                       | Product-spec modular monolith baseline.                                                                        |
| API contract                 | REST, URI versioning, `@nestjs/swagger`                   | The foundation exposes generated OpenAPI at `/api/docs`.                                                       |
| Cloud/local database target  | PostgreSQL 17.11 Docker image                             | Local-only development service; data model and migrations remain future work.                                  |
| Shared structural validation | Zod                                                       | Mobile/API-safe schema boundary. Authorization remains server-side.                                            |
| Quality                      | TypeScript, ESLint, Prettier, Vitest                      | Baseline static and unit-test tooling. API/mobile/offline feature tests will be added with their feature work. |

Versions are declared as exact versions in workspace manifests and resolved in `package-lock.json`. Use `npm install`, never a second package manager, to preserve the lockfile.

## Pinned direct dependencies

| Workspace                | Dependencies                                                                                                                                                                                                        |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Root development tooling | `@eslint/js@10.0.1`, `@types/node@22.20.2`, `eslint@10.10.0`, `prettier@3.9.6`, `typescript@6.0.3`, `typescript-eslint@8.70.0`, `vitest@5.0.0`                                                                      |
| `@tucarton/mobile`       | `expo@57.0.21`, `expo-camera@57.0.4`, `expo-router@57.0.20`, `expo-secure-store@57.0.3`, `expo-sqlite@57.0.2`, `react@19.2.3`, `react-native@0.86.3`                                                                |
| `@tucarton/api`          | `@nestjs/common@12.0.1`, `@nestjs/core@12.0.1`, `@nestjs/platform-express@12.0.1`, `@nestjs/swagger@12.0.1`, `reflect-metadata@0.2.2`, `rxjs@7.8.2`; development: `@nestjs/cli@12.0.0`, `@nestjs/schematics@12.0.0` |
| `@tucarton/validation`   | `zod@3.25.76`                                                                                                                                                                                                       |

The product specification mandates NestJS but not a major version. NestJS 12 is the current pinned foundation selection; a later API feature spec should own any required major upgrade.

## Package boundaries

```text
apps/mobile       Expo UI, repositories, sync engine (future)
apps/api          NestJS REST modules and server-side authorization (future)
packages/domain   Framework-independent vocabulary
packages/validation  Shared structural input schemas
packages/api-client  Typed REST transport boundary
packages/config   Shared build/tool configuration
```

## Deferred decisions

The following are intentionally not installed or selected by this foundation work item:

- Authentication and OTP/session provider (`TBD-001`)
- ORM/database toolkit and migrations (`TBD-002`)
- Hosting (`TBD-003`)
- Push-notification provider (`TBD-004`)
- Offline digital signatures, device credentials, credential lifetime, and replay protection (`TBD-005`, `TBD-006`)
- Transaction expiration defaults, data retention, business archival, and negative-balance terminology (`TBD-007` through `TBD-010`)

## Local development

1. Install the documented Node.js baseline (at least `22.13.0`) and npm 11 or later.
2. Run `npm install` at the repository root.
3. Copy `.env.example` to `.env` only if tooling needs environment variables; do not commit it.
4. Run `npm run db:up` to start local PostgreSQL, then `npm run api:dev` or `npm run mobile:start`.
5. Run `npm run format`, `npm run lint`, `npm run typecheck`, and `npm test` before handing work to verification.

The Compose password is intentionally local and non-production. Replace it only in an untracked environment file.
