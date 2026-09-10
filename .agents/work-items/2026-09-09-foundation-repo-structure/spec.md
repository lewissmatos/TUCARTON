# Specification: TuCarton Phase 0 Foundation Repository Structure

## Metadata

| Field                     | Value                                  |
| ------------------------- | -------------------------------------- |
| Work item                 | `2026-09-09-foundation-repo-structure` |
| State                     | `accepted`                             |
| Author                    | Spec Writer                            |
| Created                   | `2026-09-09`                           |
| Last updated              | `2026-09-09`                           |
| Senior Developer approval | Approved in conversation, 2026-09-09   |

## Problem and outcome

The repository currently contains the Harness/SDD instructions and the approved TuCarton product and technical requirements, but no executable application scaffold, package manifests, database development environment, or shared TypeScript package boundaries.

The outcome of this work item is a reviewable Phase 0 monorepo foundation that makes the approved baseline explicit and gives later work items stable locations for the mobile app, API, shared domain code, validation, API client, configuration, documentation, and tests. The work item also documents the dependency and stack decisions needed to begin implementation without treating unresolved product TBDs as silently approved choices.

## Scope

### In scope

- Create the recommended monorepo directories:
  - `apps/mobile` for Expo / React Native / TypeScript.
  - `apps/api` for NestJS / TypeScript.
  - `packages/domain` for framework-independent domain types and constants.
  - `packages/validation` for shareable validation schemas.
  - `packages/api-client` for the typed REST client boundary.
  - `packages/config` for shared TypeScript/tooling configuration.
  - `docs/specs` and `docs/adr` for decomposed specifications and architecture decisions.
  - `tests` or equivalent clearly owned locations for cross-package/integration fixtures as justified by the chosen tooling.
- Add the root package-manager workspace manifest and lockfile using one selected package manager, with scripts and TypeScript configuration sufficient to build or type-check the empty/placeholder packages.
- Add minimal application/package entrypoints and README files that identify ownership, boundaries, and how future work should extend each area.
- Add development infrastructure for PostgreSQL that is local-only and reproducible (for example, a Docker Compose service plus documented environment variables). It must not provision or mutate an external environment.
- Add baseline repository configuration for formatting, linting, type-checking, testing, environment variable examples, and ignored local secrets/build artifacts.
- Record the initial stack and dependency inventory below in repository documentation, including explicit decisions or open questions for authentication, ORM/database toolkit, hosting, push notifications, offline signatures, credential lifetime, expiration defaults, retention, archival, and negative-balance UX.
- Pin dependency versions when the implementation is started, as required by the source product specification, and commit the resulting manifest/lockfile.

### Out of scope

- Implementing product behavior such as authentication, businesses, memberships, customers, ledger transactions, balances, notifications, share links, synchronization, or QR flows.
- Implementing production database migrations or the complete conceptual data model.
- Selecting or integrating a production authentication provider, ORM/database toolkit, hosting provider, push provider, or offline cryptographic-signature design without a separate approved decision/specification.
- Installing or configuring external services, deploying infrastructure, publishing applications, creating cloud resources, or sending external messages.
- Adding payment processing, inventory/POS/accounting, chat, credit scoring, debt collection, NFC, Bluetooth, or other non-MVP capabilities.
- Decomposing the full product requirements document into all 26 proposed specification files; that may be a subsequent documentation work item.

## Requirements

- `R-01`: The repository MUST use a monorepo layout with separate `apps/` and `packages/` boundaries matching the approved product specification.
- `R-02`: The baseline technology stack MUST be represented by TypeScript projects for Expo/React Native mobile and NestJS API, with PostgreSQL as the local development database target.
- `R-03`: The repository MUST provide a reproducible local developer workflow for installing dependencies, running static checks, and starting the local PostgreSQL dependency without external side effects.
- `R-04`: Shared package boundaries MUST prevent mobile and API code from importing framework-specific implementation details from `packages/domain`; validation and API-client responsibilities MUST be documented.
- `R-05`: The repository MUST document the dependency/library inventory and classify each item as baseline, implementation choice, or unresolved TBD.
- `R-06`: The scaffold MUST include safe configuration conventions: committed examples only, no real credentials, and ignore rules for secrets, generated output, caches, and local databases.
- `R-07`: The scaffold MUST include a testing/tooling baseline appropriate for unit, API/integration, mobile, and later offline-sync test work, while allowing detailed test implementation to remain in later phase work items.
- `R-08`: All implementation choices that materially resolve a source-spec TBD MUST be recorded as a decision and returned for Senior Developer approval before implementation proceeds.

## Acceptance criteria

- `AC-01`: Given the current harness-only repository, when the foundation work is implemented, then the expected `apps/`, `packages/`, `docs/`, and test boundaries exist with documented ownership and no product feature behavior is claimed as implemented.
- `AC-02`: Given a clean checkout with the documented supported toolchain, when the documented dependency-install, type-check, lint, format-check, and test commands are run, then they complete successfully or report only explicitly documented placeholder limitations.
- `AC-03`: Given a developer with Docker available, when the documented local database command is run, then a PostgreSQL service can be started using local configuration only, with no external deployment or credential mutation.
- `AC-04`: Given the root workspace manifest and lockfile, when dependencies are inspected, then mobile, API, shared package, database, validation, testing, and developer-tool dependencies are classified and their versions are reproducibly pinned.
- `AC-05`: Given the dependency inventory, when a reviewer compares it to the product requirements, then Expo/React Native/TypeScript, Expo Router, SQLite, secure credential storage, NestJS, REST/OpenAPI, PostgreSQL, persistent outbox/idempotent-sync architectural boundaries, and required testing categories are represented; unresolved provider/tooling choices are clearly marked as TBD rather than silently fixed.
- `AC-06`: Given repository configuration and example environment files, when a reviewer inspects the change, then no real secrets are present and generated artifacts, caches, local database state, and environment files containing secrets are excluded from version control.
- `AC-07`: Given the work-item artifacts, when the Coder begins implementation after approval, then an implementation plan can map each scaffold change and verification command to `AC-01` through `AC-06` without requiring unstated product decisions.

## Constraints and compatibility

- The source of truth is `TuCarton — Product & Technical Requirements Specification v1.0.md`; this work item narrows Phase 0 implementation and does not rewrite the approved product baseline.
- The repository Harness requires spec approval before implementation, independent verification, and Senior Developer final acceptance.
- Initial platforms are Android and iOS; the mobile app must remain compatible with Expo/React Native conventions.
- TypeScript is the primary language across mobile, API, and shareable packages.
- PostgreSQL is the target cloud data store; SQLite is the target mobile local persistence layer.
- The backend is a modular monolith exposed through a versioned REST API with OpenAPI documentation.
- Offline-first architecture, persistent outbox, idempotency, append-only ledger semantics, authorization, and privacy-by-relationship are architectural constraints; their product behavior belongs to later approved work items.
- Dependency versions are intentionally not prescribed by product spec v1.0 and must be selected, pinned, and recorded at implementation time.
- Node.js and package-manager support must be documented based on the selected toolchain; the current machine has Node.js `v26.5.0`, npm `11.17.0`, and Docker `29.5.2`, but these observations are not approval of project version requirements.

### Dependency and stack inventory

| Area                       | Baseline / library role                                                         | Status for this work item | Notes                                                                                                                   |
| -------------------------- | ------------------------------------------------------------------------------- | ------------------------- | ----------------------------------------------------------------------------------------------------------------------- |
| Workspace                  | npm workspaces or another TypeScript-compatible workspace manager               | Implementation choice     | Select one, document it, and commit the lockfile; do not mix managers.                                                  |
| Mobile runtime             | Expo + React Native + TypeScript                                                | Baseline                  | Required by the product specification.                                                                                  |
| Mobile navigation          | Expo Router                                                                     | Baseline                  | Required baseline navigation convention.                                                                                |
| Mobile local storage       | SQLite through the Expo-compatible SQLite package                               | Baseline                  | Required for persistent offline data; exact package/version is implementation-time selection.                           |
| Mobile secrets/credentials | Expo secure credential storage                                                  | Baseline                  | Required for authenticated/offline credential handling; exact package/version is implementation-time selection.         |
| Mobile QR                  | Expo-compatible camera/barcode scanning capability                              | Implementation choice     | Needed by later QR work; exact package and support matrix require validation.                                           |
| API framework              | NestJS + TypeScript                                                             | Baseline                  | Modular monolith backend.                                                                                               |
| API transport              | REST + OpenAPI                                                                  | Baseline                  | Versioned API boundary; exact Nest integration is implementation-time selection.                                        |
| Database                   | PostgreSQL                                                                      | Baseline                  | Local development service in this work item; schema/migrations later.                                                   |
| ORM/toolkit                | TBD-002                                                                         | Unresolved TBD            | Requires separate decision or approved implementation choice.                                                           |
| Authentication             | TBD-001                                                                         | Unresolved TBD            | Provider and OTP/session approach require decision.                                                                     |
| Push notifications         | TBD-004                                                                         | Unresolved TBD            | Push is best effort and not transaction state.                                                                          |
| Offline signatures         | TBD-005                                                                         | Unresolved TBD            | Must be solved by a security-focused spike before cryptographic QR claims.                                              |
| Validation                 | Shared TypeScript schemas in `packages/validation`                              | Baseline boundary         | Library choice must support mobile/API sharing without moving authorization into shared code.                           |
| API client                 | Typed client in `packages/api-client`, optionally OpenAPI-generated             | Baseline boundary         | Generation strategy may be selected during implementation.                                                              |
| Quality                    | Formatter, linter, TypeScript checks, unit/API/mobile/offline-sync test tooling | Baseline capability       | Exact tools and versions must be recorded and independently verified.                                                   |
| CI                         | Repository CI for install, checks, and tests                                    | Phase 0 target            | Provider-specific setup is allowed only as repository configuration; no external workflow execution is authorized here. |

## Test strategy

| Criterion | Verification method                                                 | Expected evidence                                                                                            |
| --------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| AC-01     | Static repository inspection                                        | File tree and package-boundary inspection recorded in `implementation-plan.md` and `verification-report.md`. |
| AC-02     | Run documented install/check commands from a clean dependency state | Exact commands and exit results; any placeholder limitation explicitly recorded.                             |
| AC-03     | Run the local PostgreSQL start/health-check/stop workflow           | Command output showing service readiness and local-only configuration.                                       |
| AC-04     | Inspect workspace manifest and lockfile                             | Dependency table with pinned versions and workspace resolution.                                              |
| AC-05     | Requirements-to-inventory review                                    | Checklist mapping the product baseline and unresolved TBDs to repository docs/manifests.                     |
| AC-06     | Secret/configuration scan and ignore-file inspection                | Evidence that only example configuration is committed and sensitive/generated paths are ignored.             |
| AC-07     | Artifact review                                                     | Approved spec plus implementation plan contains criterion mappings and no unapproved scope.                  |

## Risks and assumptions

| Type       | Detail                                                                                                                                                   | Owner / decision needed                                                     |
| ---------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- |
| Assumption | Phase 0 means a buildable/documented scaffold, not implementation of the full MVP listed in the product specification.                                   | Senior Developer approval of this work-item scope.                          |
| Risk       | Expo/React Native and Node package compatibility may constrain the supported Node version and package manager.                                           | Coder to validate; Senior Developer approves material changes.              |
| Risk       | Offline QR security cannot be honestly marked complete until device credentials, signatures, replay protection, and revocation are specified and tested. | Senior Developer to authorize a later security spike/spec.                  |
| Risk       | Choosing an ORM or authentication provider now may create irreversible coupling.                                                                         | Senior Developer decision or separate ADR.                                  |
| Risk       | Mobile native modules and Docker-based PostgreSQL may require platform-specific setup.                                                                   | Coder to document supported development environments.                       |
| Assumption | No external service credentials or deployments are required to complete the repository scaffold.                                                         | Senior Developer; external actions remain prohibited without authorization. |

## Open questions

- Should the Phase 0 implementation select npm workspaces, or does the Senior Developer require pnpm/Turborepo/Nx or another workspace tool?
- Should the scaffold include a specific ORM/database toolkit now, or should that remain a follow-up ADR before database implementation?
- Which authentication provider/session strategy should the API use for MVP?
- Which hosting, push-notification, and offline-signature decisions should be scheduled as the next approved work items?
- What Node.js version should be the project support baseline after validating Expo/NestJS compatibility?

## Approval record

| Decision | By               | Date | Notes                                                                                                               |
| -------- | ---------------- | ---- | ------------------------------------------------------------------------------------------------------------------- |
| Approved | Senior Developer | 2026-09-09 | Approved in conversation: “go ahead with the implementation.” |
| Accepted | Senior Developer | 2026-09-09 | Accepted in conversation: “ok, let's go with the next step then.” |

## Handoff

Work item: `2026-09-09-foundation-repo-structure`  
State: `accepted`  
From → To: Senior Developer → Next work item  
Artifact: `.agents/work-items/2026-09-09-foundation-repo-structure/spec.md`  
Ready: Independent verification passed for every acceptance criterion; the PostgreSQL container is running and accepting connections.  
Evidence: See `.agents/work-items/2026-09-09-foundation-repo-structure/verification-report.md`. The Verifier independently passed formatting, linting, TypeScript, unit tests, Expo compatibility, Compose validation, PostgreSQL readiness, API health, API OpenAPI response, dependency inspection, and secret/configuration inspection.  
Risks / blockers: This directory is not currently a Git repository, so the generated lockfile cannot be committed as the scope text anticipates. Authentication, ORM, hosting, push, and offline-signature choices remain intentionally unresolved by approved scope.  
Requested action: Begin the approved next work item for authentication architecture.
