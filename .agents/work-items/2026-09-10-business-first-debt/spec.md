# Specification: Business and first debt request

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-10-business-first-debt` |
| State | `approved_for_implementation` |
| Author | Spec Writer |
| Created | `2026-09-10` |
| Last updated | `2026-09-10` |
| Senior Developer approval | Approved by implementation request |

## Problem and outcome

After creating a phone-based account, a user needs to start using TuCartón immediately. The first usable flow must let a business create its cartón, add another registered person by TuCartón Code, and record a debt that remains pending until the customer acknowledges it.

## Scope

### In scope

- Business creation and current-user membership.
- Customer relationship creation by TuCartón Code.
- Creating pending debt requests in Dominican pesos.
- Customer pending-debt listing and acknowledgment.
- A simple mobile home flow for these actions.

### Out of scope

- Payments, settlements, QR/offline mode, invitations, and notifications.
- Business member invitations and roles beyond the owner membership.
- External identity-provider or account-recovery changes.

## Requirements

- `R-01`: A signed-in user can create a business and becomes its owner.
- `R-02`: A business owner can add an existing user by their TuCartón Code.
- `R-03`: A business owner can create a positive DOP debt request for an added customer.
- `R-04`: New debt requests are pending and excluded from confirmed balance until the target customer acknowledges them.
- `R-05`: Only the target customer can acknowledge a pending request.
- `R-06`: The mobile app exposes the first-use flow in Spanish and remains usable with the existing phone session.

## Acceptance criteria

- `AC-01`: Given a valid phone session, when the user creates a business, then the API returns the business and owner membership exists.
- `AC-02`: Given a business owner and a valid TuCartón Code, when they add the customer, then the relationship is returned and duplicate relationships are rejected.
- `AC-03`: Given an owner and customer relationship, when the owner records a positive amount, then the API returns a `PENDING_CUSTOMER_ACK` debt.
- `AC-04`: Given a pending debt, when a non-target user attempts acknowledgment, then the API rejects it; when the target customer acknowledges, then the debt becomes `CONFIRMED` with a timestamp.
- `AC-05`: Given a valid phone session in the mobile app, when the user opens the ready state, then they can create/select a business, add a customer, record a debt, and see Spanish success/error feedback.

## Constraints and compatibility

- Amounts are stored as integer centavos (`amountMinor`) with currency `DOP`.
- Existing phone sessions remain the only required mobile authentication path.
- Database changes use a forward-only Drizzle migration.
- The API must verify the local bearer session and business membership on every business mutation.

## Test strategy

| Criterion | Verification method | Expected evidence |
| --- | --- | --- |
| AC-01–AC-04 | API tests and local HTTP smoke flow | Typecheck, lint, tests, migration, and create/add/debt/ack responses |
| AC-05 | Mobile typecheck plus simulator/manual inspection | Spanish controls and successful API state transitions |

## Risks and assumptions

| Type | Detail | Owner / decision needed |
| --- | --- | --- |
| Assumption | A user must already have a phone account before being added by code. | Senior Developer |
| Risk | The first mobile slice uses one owner-oriented screen; customer acknowledgment can be exercised with a second signed-in account. | Senior Developer |

## Open questions

- None for this vertical slice.

## Approval record

| Decision | By | Date | Notes |
| --- | --- | --- |
| Approved | Senior Developer | 2026-09-10 | Proceed with core product implementation. |
