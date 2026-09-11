# ADR-008: Multi-Method Authentication with an Independent Phone-Verification Gate

## Status

Superseded for the MVP by the approved [profile registration and passcode access work item](../../.agents/work-items/2026-09-11-credentials-profile-access/spec.md) on 2026-09-11. It remains as historical architecture research only; Auth0, Twilio Verify, and OTP are not part of the active application flow.

## Context

TuCarton users need authenticated sessions before private data is accessible. The Senior Developer requires sign-up/sign-in through email, passkeys, or phone, with phone OTP as a separate verification step rather than the sole registration mechanism. A verified Dominican phone must be required before a user can enter financial or relationship-bearing product flows.

The architecture must support Expo mobile, NestJS server-side authorization, persistent secure sessions, online recovery, explicit account linking, and a later device-provisioning boundary for fully-offline QR confirmation.

## Decision

Use **Auth0** as the managed identity provider and **Twilio Verify** as the independent phone-verification service. The NestJS API remains the source of authorization and TuCarton-domain state; neither external provider is the source of truth for Business relationships, ledger data, balances, or permissions.

### Authentication methods

| User action           | Architecture                                                                                                                                                                                         |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Email sign-up/sign-in | Auth0 passwordless email code or magic link, with email/password available only if explicitly enabled in a later UX decision.                                                                        |
| Phone sign-in         | Auth0 SMS passwordless sign-in. This establishes an Auth0 session; it does not by itself satisfy TuCarton’s separate verified-phone gate.                                                            |
| Passkey               | Auth0 passkeys. Enrol an existing authenticated and phone-verified user; native passkeys require Auth0 passkey policy, a custom domain, and an Expo development build/native credential integration. |
| Phone verification    | The authenticated NestJS API initiates and verifies a Twilio Verify challenge for an E.164 Dominican number. On success, the API marks the TuCarton user’s phone verification state and timestamp.   |

### Activation and authorization gate

An unverified user may sign in, complete onboarding, view their own account settings, add/link a sign-in method, and request phone verification. A verified phone is required before the API permits:

- TuCarton Code lookup;
- Business creation or membership acceptance;
- customer relationship access;
- debt, payment, reversal, or other financial requests;
- trusted-device provisioning for future offline confirmation.

The API derives the authenticated subject from a validated bearer access token, loads the corresponding local user, and applies this gate server-side. A client-provided user ID, Business ID, or `phone_verified` flag is never authorization evidence.

### Session and credential boundary

- Use OAuth 2.0 Authorization Code with PKCE for the mobile application.
- Request short-lived access tokens for the TuCarton API audience; validate signature, issuer, audience, expiry, and authorized party against Auth0 JWKS in NestJS.
- Use rotating refresh tokens only when the chosen Auth0 plan/configuration permits them. Store refresh-token/session material in `expo-secure-store`; keep the access token in memory where practical and never in SQLite, AsyncStorage, logs, crash reports, or deep links.
- On logout, remove secure-store credentials locally and revoke/invalidate the remote refresh-token session where available. Account recovery is online-only and requires a supported Auth0 method plus a new phone-verification challenge before restoring verified access.

### Identity linking and collision policy

- TuCarton has an immutable UUID internal user ID and a unique Auth0 `sub` mapping. TuCarton Code is generated server-side and is public only through an exact-code lookup after the verification gate.
- Do not automatically merge accounts that share an email address, phone number, or display name.
- Link a new email, phone sign-in identity, or passkey only from an authenticated settings flow after fresh authentication of the new credential. Require user confirmation; retain an audit action.
- If a presented credential is already linked to another user, return a deterministic conflict error and direct the user to online recovery/support. Never reveal the other account’s profile, phone, or relationships.
- Store normalized phone values only as needed for verification and routing; do not include them in public profile, JWT custom claims, logs, or TuCarton Code lookup responses.

### Phone verification and abuse controls

- NestJS owns `start` and `verify` endpoints and calls Twilio Verify server-to-server. The client never receives Twilio credentials.
- Require a valid access token and rate-limit by user, IP/device signal, and destination phone. Use Twilio Verify’s service controls; monitor failed attempts and high-volume destinations.
- Represent verification states as `unverified`, `challenge_sent`, `verified`, `expired`, and `locked`; make requests idempotent through an operation key where retries are possible.
- Production Dominican-number delivery is a go-live acceptance test with authorized provider credentials; published availability/pricing is not a substitute for carrier testing.

### Future offline-device boundary

A device is eligible for future trusted offline QR confirmation only after online Auth0 authentication and server-side verified-phone gate. Device credentials, asymmetric keys, credential lifetime, signatures, replay protection, and revocation remain explicitly deferred to the offline-security work item.

## Proposed NestJS API contract

| Endpoint                                      | Responsibility                                                                                  | Error categories                                                                                    |
| --------------------------------------------- | ----------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| `POST /api/v1/auth/bootstrap`                 | Validate bearer token; create/read local user mapping and return verification/activation state. | `AUTH_TOKEN_INVALID`, `AUTH_SUBJECT_CONFLICT`                                                       |
| `GET /api/v1/auth/me`                         | Return current user’s private account and verification state.                                   | `AUTH_REQUIRED`, `PHONE_VERIFICATION_REQUIRED`                                                      |
| `POST /api/v1/auth/phone-verification/start`  | Validate authenticated user, rate limits, E.164 input, and create/send verification challenge.  | `AUTH_REQUIRED`, `PHONE_INVALID`, `PHONE_RATE_LIMITED`, `PHONE_CONFLICT`                            |
| `POST /api/v1/auth/phone-verification/verify` | Verify OTP, apply verified-phone state atomically, and return updated activation state.         | `AUTH_REQUIRED`, `PHONE_CODE_INVALID`, `PHONE_CODE_EXPIRED`, `PHONE_RATE_LIMITED`, `PHONE_CONFLICT` |
| `DELETE /api/v1/auth/session`                 | Best-effort API-side session/device invalidation record; mobile also clears secure storage.     | `AUTH_REQUIRED`                                                                                     |

Auth0 login, recovery, and passkey ceremonies are provider-hosted or provider-SDK flows and are not proxied through the TuCarton API.

## Alternatives considered

| Approach                     | Evidence and strengths                                                                                                                                                                                                                              | Decision                                                                                                                                                                                                                                             |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Auth0 + Twilio Verify        | Auth0 documents Expo React Native setup, native iOS/Android passkeys, email/SMS passwordless methods, account linking, and JWT validation for mobile APIs. Twilio documents Verify country deliverability and Dominican Republic messaging pricing. | Selected. Requires an Auth0 custom domain for native passkeys and two vendors.                                                                                                                                                                       |
| Clerk                        | Clerk documents Expo custom/hosted/native flows, email/phone identities, JWT/JWKS verification, and Expo passkeys.                                                                                                                                  | Rejected for MVP selection: Expo passkeys use an explicitly experimental provider property and require a development build; phone production support is plan-dependent and Dominican delivery needs separate validation. A viable later alternative. |
| Supabase Auth + SMS provider | Supabase documents Expo React Native email auth, phone OTP with configurable SMS providers, JWKS verification, and passkeys.                                                                                                                        | Rejected for MVP selection: its passkey support is explicitly experimental, and it would add a second hosted Postgres/Auth surface alongside the NestJS/PostgreSQL architecture.                                                                     |

## Consequences

- The implementation needs Auth0 tenant, custom domain, mobile app identifiers, API audience, callback/deep-link configuration, and Twilio Verify service credentials. These are external changes and require separate Senior Developer authorization.
- Email/password is intentionally not selected as the default: use email code/magic-link to reduce password reset and credential-storage scope. A later product decision may enable password login.
- Native passkeys are offered after initial verified onboarding, not as the primary sign-up path. Auth0 documents a constraint on native passkey registration when SMS/email OTP is required on the same connection; separating the Twilio verification gate avoids relying on that unsupported combination.
- Auth0 and Twilio create vendor/cost dependencies. Keep the NestJS `AuthIdentityProvider` and `PhoneVerificationProvider` adapter interfaces provider-neutral, and retain only TuCarton UUID/verification state in the domain model.

## Requirements traceability

| Product requirement | Architecture response                                                                                                                |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| `FR-ID-001`         | Local immutable UUID is independent from email, phone, government ID, and TuCarton Code.                                             |
| `FR-ID-002`         | Server-generated unique TuCarton Code; public resolution is gated.                                                                   |
| `FR-ID-003`         | Lookup response contains only minimal public profile fields.                                                                         |
| `FR-ID-004`         | Exact lookup plus server rate limits, monitoring, and deterministic errors.                                                          |
| `FR-ID-005`         | No government ID is used as a key.                                                                                                   |
| `FR-ID-006`         | Phone verification is lightweight MVP identity verification.                                                                         |
| `FR-AUTH-001`       | NestJS validates bearer tokens before private access.                                                                                |
| `FR-AUTH-002`       | Session material is kept in `expo-secure-store`, not plain-text storage.                                                             |
| `FR-AUTH-003`       | Refresh/session lifecycle supports persistent authenticated sessions.                                                                |
| `FR-AUTH-004`       | Future device provisioning requires online authentication and verified-phone gate.                                                   |
| `FR-AUTH-005`       | Logout clears local secure credentials and invalidates remote session where supported.                                               |
| `FR-AUTH-006`       | Recovery is online-only, followed by renewed phone verification.                                                                     |
| `API-001`–`API-004` | Phone operations use idempotency/rate limits, machine-readable errors, server-derived identity, and deterministic validation errors. |

## Evidence reviewed (2026-09-09)

- [Auth0 Expo React Native quickstart](https://auth0.com/docs/quickstart/native/react-native-expo)
- [Auth0 passwordless methods](https://auth0.com/docs/authenticate/passwordless)
- [Auth0 native passkey APIs](https://auth0.com/docs/authenticate/database-connections/passkeys/passkey-apis)
- [Auth0 account linking](https://auth0.com/docs/manage-users/user-accounts/user-account-linking/link-user-accounts)
- [Auth0 mobile API JWT validation](https://auth0.com/docs/get-started/architecture-scenarios/mobile-api/part-3)
- [Twilio Verify country deliverability](https://www.twilio.com/docs/verify/verify-countries-and-regions-deliverability)
- [Twilio Dominican Republic messaging pricing](https://www.twilio.com/en-us/sms/pricing/do)
- [Clerk Expo passkeys](https://clerk.com/docs/reference/expo/passkeys)
- [Clerk Expo sign-in options](https://clerk.com/docs/expo/getting-started/quickstart)
- [Supabase passkeys](https://supabase.com/docs/guides/auth/passkeys)
- [Supabase phone sign-in](https://supabase.com/docs/guides/auth/phone-login)
- [Supabase JWT verification](https://supabase.com/docs/guides/auth/jwts)
