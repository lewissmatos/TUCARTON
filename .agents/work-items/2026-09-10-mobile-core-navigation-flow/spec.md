# Specification: Mobile core navigation and task flows

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-10-mobile-core-navigation-flow` |
| State | `approved_for_implementation` |
| Author | Spec Writer |
| Created | `2026-09-10` |
| Last updated | `2026-09-10` |
| Senior Developer approval | Approved |

## Problem and outcome

The current mobile implementation places authentication completion, business setup, pending decisions, debt creation, and history into one workspace card. Although the underlying endpoints exist, the screen does not represent a usable product: it hides task boundaries, overloads a new user, and makes normal colmado work feel confusing.

TuCartón must instead behave as an application with a clear flow. A user gets an account, chooses or creates a colmado, performs one task at a time, and can always return to a home screen with the relevant actions and history.

## Scope

### In scope

- Replace the current post-login catch-all workspace with Expo Router route groups and task-specific screens.
- Add a persistent mobile session provider so authenticated routes do not independently restore session state.
- Add the primary navigation and flows below:
  1. Account creation or login → authenticated account.
  2. Home → choose/create a colmado or review customer pending actions.
  3. Create colmado → return to that colmado's overview.
  4. Colmado overview → create debt, manage customers, or open history.
  5. New debt → select/enter a linked customer, amount, optional note, submit, return to overview.
  6. Clientes → list linked customers and add a customer by TuCartón Code.
  7. Customer ledger/history → confirmed balance, pending amount, transaction history.
  8. Customer pending inbox → confirm or reject debt independently of business creation/debt entry.
- Preserve Spanish text and the centralized TuCartón design tokens.
- Keep the current API contracts unless a small adapter is required to make the existing flows usable.

### Out of scope

- New ledger, payment, QR, offline, notification, or business-member backend functionality.
- Redesigning the brand, changing the phone-login UX, or adding external authentication providers.
- Tablet-specific layouts, animation polish, or production release work.

## Information architecture

```text
Access
  Welcome / phone number
  Verification code

Authenticated app
  Inicio
    Pending customer actions (if any)
    My businesses
    Create colmado
    My customer relationships

  Colmado/:businessId
    Overview
    ├─ Registrar pendiente
    ├─ Clientes
    │   ├─ Add customer by TuCartón Code
    │   └─ Customer ledger/history
    └─ Historial del colmado

  Cuenta
    My pending actions
    My relationship balances and histories
```

## Requirements

- `R-01`: No authenticated screen may combine business creation, customer creation, debt entry, pending decisions, and history into one form/card.
- `R-02`: After successful account creation or login, a user lands on `Inicio`, not on a setup form. `Inicio` must be useful whether the user has zero, one, or multiple businesses.
- `R-03`: A user with no business can create one through an explicit “Crear colmado” call to action, on its own screen.
- `R-04`: A business overview must present no more than three primary operational actions: “Registrar pendiente”, “Clientes”, and “Historial”.
- `R-05`: Debt entry must be a dedicated form. It must require a previously linked customer, amount, and optional note; if no customer is linked, it must direct the user to `Clientes` rather than expose an ambiguous code field.
- `R-06`: The customers screen must separately list current customers and offer “Agregar cliente” by TuCartón Code.
- `R-07`: Pending customer decisions must appear in a dedicated inbox/section, with confirm and reject as deliberate, separate actions.
- `R-08`: The relationship ledger/history view must be read-only and visually separate confirmed balance from pending amount.
- `R-09`: Authenticated routes must be protected by a single session boundary. An expired/missing session returns the user to access without flashing authenticated content.
- `R-10`: Navigation controls must make it possible to return to the preceding meaningful screen without losing an already-created business/customer relationship.
- `R-11`: On an iPhone, the focused phone-number or verification-code input and its primary action must remain reachable while the software keyboard is open.

## Acceptance criteria

- `AC-01`: Given a newly authenticated user with no business, when they enter the app, then they see `Inicio` and a distinct “Crear colmado” action; no debt or customer form is displayed on that screen.
- `AC-02`: Given a user who creates a colmado, when creation succeeds, then they are routed to that colmado's overview, which presents only “Registrar pendiente”, “Clientes”, and “Historial” as primary actions.
- `AC-03`: Given a business with no linked customers, when the user chooses “Registrar pendiente”, then the app directs them to `Clientes` with an explanation instead of allowing debt submission.
- `AC-04`: Given a business with a linked customer, when the user chooses “Registrar pendiente”, then they complete a dedicated amount/note form and return to the overview after successful submission.
- `AC-05`: Given a business overview, when the user opens `Clientes`, then existing customers are listed and adding a new customer happens in a separate explicit flow.
- `AC-06`: Given a customer with pending debts, when they open their pending inbox, then each request can be confirmed or rejected without showing business-creation or debt-entry forms.
- `AC-07`: Given either side of a relationship, when they open its history, then confirmed balance, pending amount, and ledger history are visibly distinct and the screen does not contain editing forms.
- `AC-08`: Given a valid saved session, when navigating among authenticated routes, then the app restores the session once at the application boundary; given an invalid session, it redirects to phone access.
- `AC-09`: All end-user labels, empty states, validation messages, and navigation controls in these flows are Spanish.
- `AC-10`: Given a user entering a phone number or verification code on an iPhone, when the numeric keyboard opens, then the screen scrolls so the relevant primary action remains visible and tappable without dismissing the keyboard.

## Constraints and compatibility

- Use Expo Router route groups: `app/(access)` for unauthenticated routes and `app/(app)` for authenticated routes. Keep route files thin; screen implementations belong in `src/features/*`.
- Introduce `SessionProvider` under `src/auth` as the only owner of persisted session restore/save/clear behavior.
- Reuse `src/theme/tokens.ts` and shared UI controls. Do not introduce raw per-screen color palettes.
- Use existing local-session API endpoints and existing business/ledger endpoints. Any required listing endpoint absent from the API must be specified as a small additive adapter with authorization coverage.
- Maintain iPhone-first layouts and support the current iOS development build.
- This is a navigation/UX refactor. Preserve the existing approved ledger semantics and migrations.

## Test strategy

| Criterion | Verification method | Expected evidence |
| --- | --- | --- |
| AC-01–AC-05 | Mobile route/component tests with mocked session/API states | Screen-specific CTA/form behavior and navigation assertions |
| AC-06–AC-07 | Mobile route/component tests plus API smoke with existing ledger data | Separate inbox and read-only relationship summary evidence |
| AC-08 | Session-provider unit tests and manual expired-session route test | No repeated restore calls; redirect to access route |
| AC-09 | Static copy review and simulator walkthrough | Spanish UI screenshots/notes |
| AC-10 | iPhone manual keyboard walkthrough | Focused input and primary action visible above the numeric keyboard |
| All | `npm run test`, `npm run lint`, `npm run typecheck` | Recorded command outputs |

## Risks and assumptions

| Type | Detail | Owner / decision needed |
| --- | --- | --- |
| Assumption | `Inicio` is the initial authenticated route for both business owners and customers. | Senior Developer approval |
| Assumption | A minimal tab bar is not needed in this release; clear stack navigation and home shortcuts are sufficient for a low-complexity first app flow. | Senior Developer approval |
| Risk | The business customer list currently lacks relationship summary metadata. | Coder may add a narrowly scoped authorized API adapter if required |
| Risk | Replacing the workspace changes every post-login route at once. | Implement and verify route-by-route; preserve API behavior |

## Open questions

- None. Approval decisions: use `Inicio` plus stack navigation for the first release; call the customer-facing area `Mi cuenta`.

## Approval record

| Decision | By | Date | Notes |
| --- | --- | --- | --- |
| Approved | Senior Developer | 2026-09-10 | Implement stack navigation without a bottom tab bar; use “Mi cuenta” as the customer-facing label. |
| Approved scope amendment | Senior Developer | 2026-09-10 | Replace business-facing end-user use of “Personas” with “Clientes”; preserve neutral internal model and routes. |
| Approved scope amendment | Senior Developer | 2026-09-11 | Make phone access keyboard-safe on iPhone so the primary action is not obscured by the numeric keyboard. |
| Approved scope amendment | Senior Developer | 2026-09-11 | Replace phone verification terminology with local account creation/login. |

## Handoff

Work item: `2026-09-10-mobile-core-navigation-flow`
State: `approved_for_implementation`
From → To: Spec Writer → Senior Developer
Artifact: `spec.md`
Ready: Corrected mobile information architecture and acceptance criteria.
Evidence: Based on the current Expo Router structure, current mobile feature components, and the product flows requested in this conversation.
Risks / blockers: No external blockers; preserve existing API and ledger behavior while moving UI responsibilities into routes.
Requested action: Coder creates the implementation plan and implements this approved navigation scope.
