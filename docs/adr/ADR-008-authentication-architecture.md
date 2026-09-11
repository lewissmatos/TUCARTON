# ADR-008: Local phone and passcode access

## Status

Accepted — 2026-09-11

## Context

TuCartón is designed for people who need a simple way to record and recognize debts at colmados. The account flow must be understandable without email, social accounts, external provider setup, or a temporary verification-code step.

The app still needs a stable local user identity, secure persistent sessions, and a private way for a colmado to find an existing customer who voluntarily shares either their TuCartón Code or phone number.

## Decision

Use a TuCartón-owned local account model for the MVP:

- A new account requires a display name, Dominican phone number, and a numeric passcode of four to six digits.
- A returning person signs in with the same phone number and passcode.
- The API normalizes Dominican numbers before registration, login, or authenticated business customer lookup.
- The API stores a random-salt scrypt-derived passcode hash only. Plain passcodes are never returned, logged, or stored by the mobile app.
- The API issues its own short-lived signed access token plus a revocable refresh token. Mobile stores those session credentials in `expo-secure-store`.
- A business member may resolve an existing customer only while adding a business relationship or registering a debt, using the customer's TuCartón Code or voluntarily provided phone number. Phone lookup is not public and does not create accounts.

## API contract

| Endpoint | Responsibility |
| --- | --- |
| `POST /api/v1/auth/register` | Create one account from name, phone, and passcode; return local session credentials and safe user profile. |
| `POST /api/v1/auth/login` | Validate phone/passcode and return local session credentials and safe user profile. |
| `GET /api/v1/auth/session/me` | Return the authenticated user's safe profile. |
| `POST /api/v1/auth/session/logout` | Revoke the submitted refresh session. |
| `POST /api/v1/businesses/:businessId/customers` | Add an existing customer by code or phone after business-member authorization. |
| `POST /api/v1/businesses/:businessId/debts` | Register a debt for an already linked customer identified by code or phone. |

## Consequences

- The first account flow is small and can run in Expo Go during development.
- The MVP does not establish legal ownership of a phone number. Account recovery, passcode resets, durable login throttling, and stronger identity checks need a later approved design.
- Numeric passcodes are weaker than long passwords. They are appropriate only for this early, simple flow with server-side hashing and future abuse controls required before production release.
- External identity services are not configured, required, or represented in the active mobile or API path.

## Requirements traceability

| Product requirement | Architecture response |
| --- | --- |
| `FR-ID-001` | TuCartón keeps an immutable local UUID independent from user-facing identifiers. |
| `FR-ID-002` | TuCartón Code is generated server-side and is unique. |
| `FR-ID-003` | Client lookup exposes only the minimum relationship-safe display data. |
| `FR-AUTH-002` | Mobile stores only signed session credentials in secure storage. |
| `FR-AUTH-003` | API sessions are signed and refresh credentials are revocable. |
