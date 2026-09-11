# Specification: Profile registration and passcode access

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-11-credentials-profile-access` |
| State | `approved_for_implementation` |
| Author | Spec Writer |
| Created | `2026-09-11` |
| Last updated | `2026-09-11` |
| Senior Developer approval | Approved in conversation, 2026-09-11 |

## Problem and outcome

The phone-and-one-time-code access flow has no place for a person's name, depends on temporary fake codes, and is not a usable first account experience. A colmado also needs a practical way to identify an existing TuCartón customer using either the printed TuCartón Code or the phone number the customer shares.

TuCartón will provide one simple local account system: a new person creates an account with name, Dominican phone number, and numeric passcode; a returning person signs in with phone number and the same passcode. A colmado can add an existing client using either their TuCartón Code or phone number before registering a debt.

## Scope

### In scope

- Replace mobile OTP access with separate, Spanish `Crear cuenta` and `Iniciar sesión` forms.
- Require a display name, Dominican phone number, and a 4–6 digit numeric passcode for registration.
- Store only a salted, scrypt-derived passcode hash; never return, log, or persist a plain passcode in mobile storage.
- Add local registration and passcode-login endpoints that issue the existing revocable local session credentials.
- Remove all mobile/API fake-code UI, endpoints, and fake verification-provider implementation.
- Persist a display name for new accounts and return it in the authenticated user/profile payload.
- Permit adding or resolving a client by TuCartón Code or normalized phone number in the business customer and debt APIs.
- Show client names where available in business client lists and debt selection.

### Out of scope

- Real SMS, Twilio Verify, phone ownership verification, password recovery, passkey, email, Google, or Auth0 interactive login.
- Account recovery for accounts created by the retired development OTP flow without a passcode.
- Public customer/phone search, contact imports, business members, payments, or changing ledger confirmation semantics.
- Production credential policy, multi-device session management, or a full profile-editing/settings experience.

## Requirements

- `R-01`: Registration requires a trimmed display name of 2–120 characters, a valid normalized Dominican phone number, and a numeric passcode of 4–6 digits.
- `R-02`: A registered phone number is unique. The API must reject duplicate registration without exposing a passcode or creating a second user.
- `R-03`: Login must validate a phone/passcode pair against a salted scrypt hash and return the existing signed local-session credentials on success. Wrong credentials receive one generic Spanish error.
- `R-04`: The mobile client must retain only existing session credentials in secure storage. It must not retain the phone number or passcode after submission.
- `R-05`: The OTP phone-access endpoints, fake verification provider, fake-code test, and mobile code-entry UI must be removed from the active application flow.
- `R-06`: A business owner can add a client using a TuCartón Code or a Dominican phone number. Both identifiers resolve only an existing account, reject self-linking and duplicate links, and do not create a client account.
- `R-07`: Debt creation must accept the same client identifier formats and still require a linked client relationship.
- `R-08`: All new end-user UI and recoverable API messages are Spanish. Internal route/component names need not mirror UI wording.

## Acceptance criteria

- `AC-01`: Given a new phone number, when a person submits valid name, phone, and passcode on `Crear cuenta`, then exactly one user with a TuCartón Code is created and a secure session opens.
- `AC-02`: Given a registered phone number, when a person submits the correct passcode on `Iniciar sesión`, then the existing user and session are restored; a wrong passcode produces a generic Spanish error.
- `AC-03`: Given registration, login, or persisted-session restoration, then neither the API response nor secure session payload contains a passcode or passcode hash.
- `AC-04`: Given the active mobile access flow, then no code input, development code, OTP wording, or code-verification endpoint is used or displayed.
- `AC-05`: Given a business owner entering a valid existing client TuCartón Code or phone number, when they add the client, then the same customer relationship is created and displayed with its name and code.
- `AC-06`: Given a linked client, when the business creates a debt using their code or phone identifier, then the debt remains attached to that linked client; an unknown or unlinked identifier is rejected.
- `AC-07`: Given a mobile iPhone screen with a focused registration/login numeric field, when the keyboard opens, then the relevant primary action remains reachable.

## Constraints and compatibility

- Use Drizzle ORM and a forward-only PostgreSQL migration. Existing legacy users are retained but cannot use the new passcode login until a future recovery/migration flow is approved.
- Use Node built-in cryptography (`scrypt`, random salt, timing-safe comparison); do not add a password-hashing package for this scope.
- Phone lookup is only available to an authenticated business member while adding/recording a client relationship; it must not become a public endpoint.
- Preserve existing business, customer-relationship, debt, and session authorization boundaries.
- Mobile fields and actions must remain keyboard-safe on iPhone.

## Test strategy

| Criterion | Verification method | Expected evidence |
| --- | --- | --- |
| AC-01–AC-03 | Auth-service unit tests and static response inspection | Registration, login, duplicate, and invalid-credential cases; no secret fields returned. |
| AC-04 | API/mobile static review | Removed fake-provider and OTP endpoint/UI references. |
| AC-05–AC-06 | Business-service unit tests plus API smoke after migration | Code and phone resolve the same existing linked client; unknown/self/duplicate paths rejected. |
| AC-07 | Manual iPhone walkthrough by Senior Developer | Submit actions remain reachable above keyboard. |
| All | `npm run test`, `npm run lint`, `npm run typecheck`, migration command | Recorded command results. |

## Risks and assumptions

| Type | Detail | Owner / decision needed |
| --- | --- | --- |
| Risk | A numeric passcode has lower entropy than a password and needs a future durable login-throttling/recovery policy before production. | Product/security follow-up. |
| Risk | Development OTP-only accounts have no passcode and cannot log in through this replacement flow. | Accept for current development data; later recovery decision. |
| Assumption | The customer voluntarily provides their phone or TuCartón Code to the colmado. | Senior Developer decision, approved in request. |

## Open questions

- None for this implementation. Password recovery and real phone ownership verification are deferred explicitly.

## Approval record

| Decision | By | Date | Notes |
| --- | --- | --- | --- |
| Approved | Senior Developer | 2026-09-11 | Replace OTP and fake code with name, phone, and numeric passcode registration/login; support client lookup by code or phone. |

## Handoff

Work item: `2026-09-11-credentials-profile-access`
State: `approved_for_implementation`
From → To: Senior Developer → Coder
Artifact: `spec.md`
Ready: Approved credential, profile, and client-identifier scope.
Evidence: Direct Senior Developer request in this conversation.
Risks / blockers: Legacy OTP-only development accounts require future recovery support; no external provider is required.
Requested action: Implement the approved API migration, mobile forms, and client lookup changes.
