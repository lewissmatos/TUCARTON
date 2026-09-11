# Specification: Shared ledger completion — decisions, balances, and history

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-10-shared-ledger-completion` |
| State | `approved_for_implementation` |
| Author | Spec Writer |
| Created | `2026-09-10` |
| Last updated | `2026-09-10` |
| Senior Developer approval | Approved |

## Problem and outcome

The current foundation lets a business create a pending debt and lets the target customer confirm it. It does not yet give either party a trustworthy ledger view: a customer cannot reject an incorrect debt, neither side can see the confirmed balance separately from pending amounts, and no usable transaction history explains how a balance was formed.

This work item completes the first shared-ledger release. A business and its customer will be able to see the same relationship summary, act on pending debt requests, and inspect the confirmed history that produces the balance.

## Scope

### In scope

- Customer confirmation or rejection of a pending debt request.
- Explicit terminal status and timestamp/reason fields for rejected debts.
- Canonical confirmed-balance calculation per Business ↔ Customer relationship from confirmed debt ledger entries.
- Pending totals displayed separately from the confirmed balance.
- Relationship-scoped, paginated transaction history for business and customer views.
- Spanish mobile screens/routes for customer pending actions, relationship summary, and history.
- Authorization and two-user API integration tests for all state transitions and privacy boundaries.

### Out of scope

- Payment transactions, payment acknowledgment, reversals, corrections, or credit handling.
- QR exchange, offline queues, synchronization, notifications, and business member management.
- Changing phone-first access, production SMS delivery, or API provider configuration.
- Replacing the existing database or migration history.

## Requirements

- `R-01`: A pending debt must have one of three terminal outcomes: `CONFIRMED`, `REJECTED`, or expiration in a future work item; only the target customer can decide the current request.
- `R-02`: Rejection must retain the original debt request, rejector identity, timestamp, and optional customer reason. It must not delete or mutate the financial amount.
- `R-03`: A confirmed balance must be calculated from the relationship's confirmed `DEBT` entries only in this release. Pending and rejected entries must contribute zero.
- `R-04`: The API must return confirmed balance, pending debt total, and rejected debt total as integer DOP minor units, along with the underlying transaction history.
- `R-05`: A business may access only summaries/history for its own customer relationships; a customer may access only their own relationships. Unrelated users must receive no relationship information.
- `R-06`: The mobile app must present separate, plain-Spanish sections for “balance confirmado”, “pendientes”, and “historial”; it must not add pending amounts to the confirmed balance.
- `R-07`: History is immutable for this release. No existing confirmed or rejected debt may be edited or deleted through an API endpoint.
- `R-08`: APIs returning collections must use cursor or page/limit pagination with a documented stable ordering.

## Acceptance criteria

- `AC-01`: Given a pending debt and its target customer, when the customer confirms it, then its status becomes `CONFIRMED`, a confirmation timestamp/action is retained, and the relationship's confirmed balance increases by exactly `amountMinor`.
- `AC-02`: Given a pending debt and its target customer, when the customer rejects it with an optional reason, then its status becomes `REJECTED`, rejection metadata is retained, and confirmed/pending balance totals do not include its amount.
- `AC-03`: Given the same pending debt, when the business creator or unrelated user attempts to confirm or reject it, then the API rejects the request without changing the debt.
- `AC-04`: Given confirmed, pending, and rejected debts for one relationship, when either authorized side requests its summary, then the response separately returns confirmed balance, pending total, rejected total, DOP currency, and stable history records in integer minor units.
- `AC-05`: Given two unrelated business/customer relationships, when a user requests a summary or history outside their relationship, then the API returns an authorization/not-found response without exposing another relationship's amounts or entries.
- `AC-06`: Given a signed-in customer, when they open the mobile pending screen, then they can confirm or reject their pending debt with Spanish feedback; given either party, when they open a relationship summary, then confirmed balance and pending total are visibly distinct.
- `AC-07`: Given more history records than the default page size, when either authorized side requests successive pages, then records do not duplicate or disappear and ordering is newest-first by creation time plus a deterministic identifier.

## Constraints and compatibility

- Use a forward-only Drizzle migration. Existing `PENDING_CUSTOMER_ACK` and `CONFIRMED` debts must retain their meaning and data.
- Store all money in integer minor units with currency `DOP`; no floating-point database values or API calculations.
- Keep confirmed balance derived from ledger rows, not an authoritative mutable balance column. A cached projection is out of scope.
- Use the existing local-session bearer authentication until a separately approved auth change.
- Preserve the existing Expo Router/mobile feature boundaries and centralized tokens. New route files must remain thin; feature state belongs under `apps/mobile/src/features/ledger`.
- The release must remain usable on small iPhone screens and use Spanish end-user text.
- Rollout: run the migration before API rollout; ship mobile views after the compatible API is available. Rollback is application-level only—do not roll back a migration that contains recorded ledger data.

## Test strategy

| Criterion | Verification method | Expected evidence |
| --- | --- | --- |
| AC-01–AC-03 | Two-user API integration tests with owner, target customer, and unrelated user sessions | State, actor, amount, and action-history assertions |
| AC-04–AC-05 | API tests for relationship summary/history and privacy boundaries | Integer totals and forbidden/not-found responses |
| AC-06 | Mobile component/simulator test using mocked API states | Spanish summary/pending/rejection UI evidence |
| AC-07 | API pagination integration test | Stable next-page response without duplicates |
| All | Migration, typecheck, lint, regression tests | Commands and outputs recorded in implementation/verification artifacts |

## Risks and assumptions

| Type | Detail | Owner / decision needed |
| --- | --- | --- |
| Assumption | “Reject” means the request stays visible in history with an optional free-text reason, rather than creating a reversal transaction. | Senior Developer approval |
| Assumption | This release's balance includes confirmed debts only because payment/reversal types are not implemented yet. | Senior Developer approval |
| Risk | Using IDs alone for relationship URLs can leak existence through differing error responses. | Coder/Verifier: use a uniform not-found or forbidden policy |
| Risk | Offline and concurrent decisions require idempotency later. | Deferred to the offline/sync release; current online endpoints must remain safely repeatable |

## Open questions

- None. Approval decisions: optional free-text rejection reason; rejected entries appear in normal history; whole DOP amounts omit zero centavos.

## Approval record

| Decision | By | Date | Notes |
| --- | --- | --- | --- |
| Approved | Senior Developer | 2026-09-10 | Implement with optional free-text rejection reason, normal rejected-history visibility, and no decimal places for whole DOP amounts. |

## Handoff

Work item: `2026-09-10-shared-ledger-completion`
State: `approved_for_implementation`
From → To: Spec Writer → Senior Developer
Artifact: `spec.md`
Ready: Detailed next release spec following the committed debt foundation.
Evidence: Mapped to PRD sections FR-DEBT-005–007, FR-BAL-001–005, BP-004, BP-005, and the current schema/API/mobile implementation.
Risks / blockers: None; offline and payment behavior remain explicitly deferred.
Requested action: Coder creates `implementation-plan.md` and implements this approved scope.
