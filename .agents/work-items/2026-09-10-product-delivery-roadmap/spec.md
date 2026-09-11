# Specification: Product delivery roadmap

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-10-product-delivery-roadmap` |
| State | `awaiting_spec_approval` |
| Author | Spec Writer |
| Created | `2026-09-10` |
| Last updated | `2026-09-10` |
| Senior Developer approval | Pending |

## Problem and outcome

TuCartón has a product specification and early authentication/debt foundations, but needs a single delivery sequence that preserves the central promise: a simple shared record where a colmado and customer can both recognize what is owed. This roadmap decomposes the complete product into independently approvable work items, with clear dependencies and release outcomes.

The outcome is a roadmap that guides implementation of the whole application without treating a high-level document as permission to implement every feature at once.

## Scope

### In scope

- Define the target repository/module boundaries for mobile, API, shared contracts, persistence, and testing.
- Define product releases from the current phone-first foundation through a production-ready initial launch.
- Define the order, dependencies, and completion conditions for future work items.
- Record the scope currently implemented and the work required to complete it.

### Out of scope

- Implementing unreleased product functionality through this roadmap item.
- Replacing approved detailed work-item specifications.
- Final product acceptance or independent verification of existing work.

## Requirements

- `R-01`: The roadmap must preserve phone-first, low-literacy-friendly access as the primary entry path.
- `R-02`: Each release must deliver a usable outcome across mobile and API, rather than an isolated backend-only phase.
- `R-03`: Pending records must never affect confirmed balances; both parties must be able to acknowledge applicable records.
- `R-04`: Future work must support the PRD requirements for businesses, customer relationships, debts, payments, history, QR, offline use, and controlled business collaboration.
- `R-05`: Each implementation release must be created as its own detailed, approved work item before coding begins.
- `R-06`: Shared business rules and request/response contracts must move into `packages/domain`, `packages/validation`, and `packages/api-client` before API/mobile complexity makes duplication costly.

## Delivery roadmap

| Release | Outcome | Main work items and dependencies |
| --- | --- | --- |
| R0 — Foundation hardening | A reliable base for continued vertical development. | Finish and independently verify phone-first access and the business/first-debt slice; commit current work; formalize shared API contracts and mobile navigation shell. |
| R1 — Shared debt ledger | A colmado can add a registered customer, request a debt, and the customer can confirm it in a clear multi-screen mobile flow. | Business/customer relationship completion, debt request lifecycle, customer inbox, confirmed/pending list views, authorization and two-user tests. Depends on R0. |
| R2 — Balances and payments | Both parties can see confirmed balances and record/acknowledge payments. | Immutable ledger model, balance projection, payment request and acknowledgment flows, transaction history and correction policy. Depends on R1. |
| R3 — Real-world access | The app works for in-person use with codes, QR, and unreliable connectivity. | TuCartón Code profile/share screen, QR generation/scanning, offline queue/database, sync protocol, conflict/idempotency rules. Depends on R2 ledger invariants. |
| R4 — Business collaboration | A business can operate with trusted staff without losing accountability. | Member invitations, OWNER/MEMBER authorization, audit history, member management UI. Depends on R1; uses R2 history model. |
| R5 — Production readiness | A secure, observable, releasable Dominican-market app. | Twilio Verify production configuration, environment/secrets policy, API security/rate limiting, telemetry/error reporting, data backup/recovery, iOS release signing, privacy/support materials. Depends on the chosen launch scope from R1–R4. |

## Target structure and ownership

| Area | Target responsibility | Current direction |
| --- | --- | --- |
| `apps/mobile/app` | Expo Router route composition and navigation only. | Keep route files thin; add route groups as screens are introduced. |
| `apps/mobile/src/features` | Feature-specific screens, hooks, state, and feature UI. | Continue feature folders such as `auth`, `business`, `ledger`, `payments`, and `offline`. |
| `apps/mobile/src/components` and `src/theme` | Reusable UI primitives and centralized visual tokens. | Existing design tokens and controls are the base design system. |
| `apps/mobile/src/api` and `src/auth` | API transport/session handling, with no screen-specific state. | Replace hand-written endpoint shapes with generated/shared contracts during R0. |
| `apps/api/src` | Nest feature modules, authorization, persistence orchestration, and API endpoints. | Add bounded modules: `business`, `relationships`, `ledger`, `payments`, `sync`, and `qr`. |
| `packages/domain` | Product vocabulary, ledger states, money/value invariants, and pure business rules. | Promote shared concepts here before R1 expansion. |
| `packages/validation` | Shared request/response validation schemas. | Make mobile/API contract validation explicit during R0. |
| `packages/api-client` | Typed client built from the shared contract. | Replace direct mobile endpoint definitions incrementally after contracts exist. |
| `tests` | Unit, API integration, mobile interaction, and offline/sync coverage. | Add focused tests with each release; two-user API tests are mandatory for R1/R2. |

## Release completion rules

1. Every release begins with a detailed child work item in `awaiting_spec_approval` and a clear vertical outcome.
2. Each child work item maps acceptance criteria to API, mobile, migration, and regression evidence as applicable.
3. Database migrations are forward-only and preserve confirmed transaction history.
4. A release is not accepted until independent verification is complete, even if exploratory implementation has been permitted earlier.
5. No external production actions, billing activation, SMS sending, or app publishing occur without explicit Senior Developer authorization.

## Acceptance criteria

- `AC-01`: The repository contains a roadmap that covers the full PRD delivery sequence through business setup, shared ledger, balances/payments, QR/offline, collaboration, and production readiness.
- `AC-02`: The roadmap states a mobile-and-API vertical delivery approach and identifies dependency order between releases.
- `AC-03`: The roadmap records target module boundaries that prevent route, feature, API, and shared-domain concerns from being mixed.
- `AC-04`: The roadmap requires detailed approved work items and independent verification for each release.

## Constraints and compatibility

- Preserve the existing npm workspace monorepo, Nest API, Expo mobile app, Drizzle/PostgreSQL persistence, and iOS native project.
- Preserve Spanish end-user copy and the TuCartón visual system; central design tokens remain the source of truth for the mobile interface.
- Keep Twilio Verify optional until production SMS is explicitly authorized; the development OTP provider remains development-only.
- Auth0 is not the primary end-user path under the phone-first decision; any continued use must have a documented backend/security purpose.

## Test strategy

| Criterion | Verification method | Expected evidence |
| --- | --- | --- |
| AC-01 | Review against the product requirements specification | Each major PRD capability maps to a release. |
| AC-02 | Review release dependency table | Every release has a user-visible outcome and stated predecessor. |
| AC-03 | Inspect workspace boundaries and target structure table | Current and target code locations are unambiguous. |
| AC-04 | Inspect release completion rules | Approval and verification gates are explicitly required. |

## Risks and assumptions

| Type | Detail | Owner / decision needed |
| --- | --- | --- |
| Assumption | R1 and R2 are the minimum initial launch scope; R3/R4 may follow based on pilot feedback. | Senior Developer |
| Risk | Offline synchronization before an immutable, tested ledger could corrupt user trust. | Senior Developer: retain R2 before R3 ordering |
| Risk | Production SMS and Auth0 configuration carry external cost/configuration dependencies. | Senior Developer authorization required |
| Risk | Current first-debt work is exploratory until the latest API/mobile integration is independently verified. | Verifier when requested |

## Open questions

- Which releases are required for the first pilot: R1 only, R1–R2, or R1–R3?
- Should payment acknowledgment be required from both sides at launch, as proposed by the PRD?
- What is the intended first offline scope: read-only cached history, queued writes, or full QR exchange before connectivity?

## Approval record

| Decision | By | Date | Notes |
| --- | --- | --- | --- |
| Pending | Senior Developer | — | Review roadmap and decide first-pilot release scope. |

## Handoff

Work item: `2026-09-10-product-delivery-roadmap`
State: `awaiting_spec_approval`
From → To: Spec Writer → Senior Developer
Artifact: `spec.md`
Ready: Full-product release roadmap and target structure.
Evidence: Reviewed existing Harness workflow, workspace layout, current work items, and product requirements.
Risks / blockers: Pilot release scope and offline depth require product decisions.
Requested action: Approve the roadmap or request amendments; then choose the detailed R0/R1 child work item to start.
