# Specification: TuCartón Phone-First Access

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-10-phone-first-access` |
| State | `approved_for_implementation` |
| Author | Spec Writer |
| Created | `2026-09-10` |
| Last updated | `2026-09-10` |
| Senior Developer approval | Approved in conversation, 2026-09-10 |

## Problem and outcome

People who buy from colmados need to enter TuCartón without knowing, creating, or recovering an email, Google, or social-account login. The first experience must be as familiar as receiving a text message: enter a phone number, enter a six-digit code, and continue.

The outcome is a Spanish, phone-first account flow that creates one local TuCartón account after phone verification, securely restores its local session, and takes the person directly to a verified account state. Auth0 is not presented in the primary mobile journey.

## Scope

### In scope

- Replace visible sign-up/log-in choices with one primary action: `Continuar con mi teléfono`.
- Default to Dominican Republic; accept forgiving local entry and normalize it to E.164 server-side.
- Implement phone number → six-digit code → verified TuCartón account.
- Make the API own local passwordless identity, account creation, signed application sessions, refresh/revocation, verification, rate limits, idempotency, and audit records.
- Reuse the fake OTP provider for local development only.
- Keep the immutable local UUID and TuCartón Code; phone numbers are private and never public lookup keys.
- Retain Auth0 only as isolated future credential-linking infrastructure, not a primary sign-in requirement.
- Add API and mobile tests for creation, returning login, code verification, throttling, session restoration, and logout.

### Out of scope

- Google, Apple, Facebook, email/password, email magic links, and passkeys in the initial interface.
- Real SMS delivery, Twilio billing, carrier agreements, or production OTP traffic until separately authorized.
- Automatic account merging, business/ledger features, notifications, QR, offline signing, or public phone lookup.
- Removing historic Auth0 mappings in this revision.

## Requirements

- `R-01`: Phone continuation MUST be the sole primary access action and MUST NOT mention Auth0, Google, email, passwords, or passkeys.
- `R-02`: The API MUST normalize submitted numbers to E.164 before account lookup or creation.
- `R-03`: A valid six-digit code MUST create exactly one local user for a new normalized number or restore the existing account for a known number.
- `R-04`: After OTP verification, the server MUST issue short-lived access credentials and revocable refresh credentials. The mobile client MUST store them in iOS Keychain/Android Keystore-backed storage only.
- `R-05`: OTP start and verify MUST enforce expiry, rate limits, idempotency, deterministic errors, and audit events. Fake OTP MUST be development-only and cannot be enabled by a mobile client in production.
- `R-06`: Protected API endpoints MUST require the local session; successful phone verification satisfies the verified-phone gate.
- `R-07`: UI copy MUST be Spanish, direct, and legible, with one concept per screen and a clear retry path.
- `R-08`: Future Auth0 credential linking MUST require explicit consent and fresh local authentication; automatic merging is prohibited.

## Acceptance criteria

- `AC-01`: Given a new person, when they enter a valid phone number and correctly verify a code, then TuCartón creates one account, assigns a TuCartón Code, and opens the verified state.
- `AC-02`: Given a returning person, when they verify the same normalized number, then TuCartón restores the same account without creating another.
- `AC-03`: Given an invalid, expired, repeated, rate-limited, or conflicting request, when the person retries, then the UI gives a short Spanish recovery message and the API leaves verified state unchanged.
- `AC-04`: Given a verified session, when the app restarts, then it restores secure credentials; when the person logs out, it revokes/clears them and returns to the phone screen.
- `AC-05`: Given a protected endpoint without a valid local session, then the API returns a deterministic authentication error and no private data.
- `AC-06`: Given the initial screen, then phone continuation is the only primary action and there is no visible provider terminology.
- `AC-07`: Given local development, when fake OTP is exercised, then API/mobile tests pass without SMS credentials; production configuration rejects fake OTP.

## Constraints and compatibility

- Drizzle ORM remains the approved PostgreSQL persistence toolkit.
- Existing Auth0 configuration may remain during migration but cannot be required by phone-first onboarding.
- A real Dominican SMS provider requires a separate approval, account verification, and billing decision.
- Sessions are signed/revocable server credentials; no mobile-provided user ID is trusted.

## Test strategy

| Criterion | Verification method | Expected evidence |
| --- | --- | --- |
| AC-01, AC-02 | API integration tests with fake OTP and clean database | Creation and repeat-login results. |
| AC-03 | Provider/API/mobile tests | Expired, invalid, throttled, and retry evidence. |
| AC-04, AC-05 | Session/API-guard and secure-store tests | Restore, logout, and rejected request evidence. |
| AC-06 | Component test and device smoke test | Spanish phone-first UI evidence. |
| AC-07 | Full targeted test commands plus production guard | Recorded results without real SMS. |

## Risks and assumptions

| Type | Detail | Owner / decision needed |
| --- | --- | --- |
| Decision | Phone plus OTP is the sole primary access method for the MVP. | Senior Developer approval. |
| Risk | Fake OTP cannot validate real ownership outside development. | Approve a Dominican SMS provider before production. |
| Risk | Carrier number recycling needs an eventual recovery policy. | Product decision later. |
| Assumption | Dominican `+1` numbers are the useful default for initial users. | Senior Developer may adjust. |

## Open questions

- Which approved provider will deliver Dominican production SMS?
- What development-only code and tester disclosure should be used?
- Should a display name be collected immediately after verification or after the first product action?

## Approval record

| Decision | By | Date | Notes |
| --- | --- | --- | --- |
| Approved | Senior Developer | 2026-09-10 | Replaces Auth0 Universal Login as the primary mobile path. |

## Handoff

```text
Work item: 2026-09-10-phone-first-access
State: awaiting_spec_approval
From → To: Spec Writer → Senior Developer
Artifact: .agents/work-items/2026-09-10-phone-first-access/spec.md
Ready: Phone-first local passwordless access specification.
Evidence: Device-tested Auth0 flow has provider/API-authorization complexity inconsistent with the revised accessibility goal.
Risks / blockers: Production SMS requires a separately approved paid/verified provider.
Requested action: Approve the phone-first local-session and development fake-OTP approach.
```
