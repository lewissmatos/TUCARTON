# Specification: TuCarton Authentication and Verified Phone Foundation

> Superseded historical specification — 2026-09-11. Do not implement this provider or verification-gate design. The active decision is [ADR-008](../../../docs/adr/ADR-008-authentication-architecture.md) and work item `2026-09-11-credentials-profile-access`.

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-09-authentication-foundation` |
| State | `draft_spec` |
| Author | Spec Writer |
| Created | `2026-09-09` |
| Last updated | `2026-09-10` |
| Senior Developer approval | Original approval superseded by the pending phone-first revision in `2026-09-10-phone-first-access` |

## Problem and outcome

Implement the first real TuCarton user-access vertical slice: an Auth0-compatible authenticated user receives a local TuCarton account mapped to a validated subject, completes a separate phone-verification step, and then enters the verified-account state required for future Business and ledger work.

The observable outcome is a mobile onboarding flow and API contract that distinguish signed-in from phone-verified users, enforce the server-side verification gate, protect session material, and expose no unrelated private data.

## Scope

### In scope

- Add Auth0-compatible issuer/audience/JWKS configuration and token validation, including the approved TuCarton API audience.
- Add Auth0 JWT validation and authenticated-user guard to NestJS, including issuer, audience, signature, expiry, and authorized-party validation.
- Add provider-neutral `AuthIdentityProvider` and `PhoneVerificationProvider` interfaces, with a deterministic local fake phone-verification adapter as the development default and a documented future Twilio Verify adapter boundary.
- Persist a local immutable user UUID, Auth0 subject mapping, display name placeholder, server-generated unique TuCarton Code, verified-phone state/timestamp, and audit events.
- Implement the proposed `/auth/bootstrap`, `/auth/me`, and phone-verification start/verify endpoints with rate limits, deterministic errors, validation, and idempotency for retryable mutations.
- Add Expo onboarding, Auth0 Universal Login with PKCE, secure native credential storage, verified-phone OTP entry, verification status, logout, and blocked-state screens.
- Require verified phone state on protected future-domain guards while permitting only onboarding/account settings to signed-in but unverified users.
- Add unit, API integration, and mobile tests for token validation, verification state transitions, rate-limit/error behavior, secure-storage/logout, and gate behavior.

### Out of scope

- Business creation, memberships, customers, TuCarton Code lookup endpoint, ledger transactions, notifications, links, sync, QR, device keys, or offline signing.
- A custom email/password form, social login configuration, and a full native passkey ceremony UI; Auth0 Universal Login owns the available sign-up and sign-in methods.
- Provider billing, DNS/custom-domain configuration, or real OTP sending without Senior Developer authorization.
- Full Auth0 hosted UI, real email/SMS delivery, native passkey ceremony UI, and device credential provisioning.

## Requirements

- `R-01`: The implementation MUST follow ADR-008 and map Auth0 `sub` to one immutable local user UUID without trusting any client-supplied user ID.
- `R-02`: A signed-in but phone-unverified user MUST be limited to onboarding and account settings; protected-domain access MUST return `PHONE_VERIFICATION_REQUIRED`.
- `R-03`: Phone verification MUST be a separate authenticated provider-adapter flow using normalized E.164 values, rate limits, idempotency, deterministic errors, and no client-visible provider secret. The deterministic fake adapter is the approved local-development default; Twilio Verify activation is deferred.
- `R-04`: Auth0 access/refresh credentials MUST remain in the Auth0 native SDK's iOS Keychain/Android Keystore-backed credential manager; logout MUST clear those local credentials and perform best-effort remote invalidation. The application MUST NOT duplicate tokens in JavaScript-accessible storage.
- `R-05`: The API MUST validate Auth0 access-token signature, issuer, audience, expiry, and authorized party before deriving user identity.
- `R-06`: Credential linking MUST be explicit and fresh-authenticated; automatic account merging is prohibited.
- `R-07`: The implementation MUST defer device keys, trusted offline confirmation, QR signing, and phone-number public lookup to later approved work items.

## Acceptance criteria

- `AC-01`: Given a valid Auth0 access token, when `/api/v1/auth/bootstrap` is called, then the API creates or returns exactly one local user mapping and does not accept a client-provided user ID.
- `AC-02`: Given an invalid, expired, incorrectly issued, incorrectly audienced, or unauthorized-party access token, when a protected endpoint is called, then the API returns a deterministic authentication error and no private payload.
- `AC-03`: Given a signed-in user without a verified phone, when they attempt a protected future-domain operation, then the API and mobile UI block it with `PHONE_VERIFICATION_REQUIRED` while onboarding/account settings remain available.
- `AC-04`: Given an authenticated user who starts and correctly completes a phone OTP challenge, when the verification result is confirmed, then the API atomically records verified-phone state/timestamp and the mobile app enters verified status without exposing phone data publicly.
- `AC-05`: Given invalid, expired, repeated, rate-limited, or phone-conflicting OTP requests, when endpoints are called, then they return deterministic machine-readable errors and do not change verified state.
- `AC-06`: Given a persistent session and logout action, when the user restarts the mobile app or logs out, then credential material is read only from secure storage and logout removes it before returning to signed-out UI.
- `AC-07`: Given the implementation test suite, when unit, API, and mobile tests run, then the auth/verification/gate scenarios pass without real provider secrets or SMS delivery.

## Constraints and compatibility

- ADR-008 is accepted through the Senior Developer’s direction to proceed with the local fake-provider implementation.
- Drizzle ORM is the approved PostgreSQL persistence toolkit for this work item.
- Senior Developer authorization is required before creating or changing Auth0/Twilio accounts, billing relationships, custom domain/DNS records, OAuth callback configuration, or real OTP traffic.
- Auth0's React Native SDK requires an Expo development build; it is not compatible with Expo Go. A native iOS bundle identifier, callback URL, and custom callback scheme are required for the iPhone flow.
- API token validation and authorization are server-side. Mobile UI is not a security boundary.

## Test strategy

| Criterion | Verification method | Expected evidence |
| --- | --- | --- |
| AC-01, AC-02 | API integration tests with locally signed/JWKS test tokens | Token validation and bootstrap test results. |
| AC-03 | API and mobile state tests | Protected-gate response and blocked UI evidence. |
| AC-04, AC-05 | Provider-adapter unit tests plus API integration tests with fake Verify adapter | State-transition and deterministic-error results. |
| AC-06 | Mobile secure-storage adapter and logout tests | No plain-text persistence plus cleanup evidence. |
| AC-07 | Full targeted test commands | Recorded unit/API/mobile command results. |

## Risks and assumptions

| Type | Detail | Owner / decision needed |
| --- | --- | --- |
| Decision | The Auth0 Custom API audience is `https://api.tucarton.local`; the native app client is `wA3kOsMS3icJaCxn1ajjWXVjKzAIuIUM`. | Configured by Senior Developer-authorized implementation, 2026-09-10. |
| Risk | Native passkeys require Auth0 custom domain and Expo development-build setup. | Senior Developer authorizes external configuration; may defer passkey UI. |
| Risk | Real Dominican OTP delivery cannot be proved without an authorized Twilio Verify service. | Senior Developer authorizes an integration test later. |
| Assumption | Email/passwordless and phone passwordless are sufficient for initial sign-in while passkeys are introduced after verified onboarding. | Senior Developer approval of this spec. |

## Open questions

- Which Auth0 connection(s) should be enabled for the MVP: database email/password, passwordless email, phone, or passkeys?
- What stable development API URL/tunnel should physical devices use beyond the local-LAN workflow?

## Approval record

| Decision | By | Date | Notes |
| --- | --- | --- | --- |
| Approved | Senior Developer | 2026-09-09 | Approved in conversation after selecting Drizzle ORM and a local fake OTP provider. Real Auth0/Twilio delivery remains deferred. |
| Amendment approved | Senior Developer | 2026-09-10 | Authorised Auth0 Custom API setup and native Universal Login implementation; Spanish UI and the TuCartón identity are required. |
