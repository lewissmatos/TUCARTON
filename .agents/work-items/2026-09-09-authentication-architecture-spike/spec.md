# Specification: TuCarton Authentication Architecture Decision Spike

> Superseded historical research — 2026-09-11. Do not implement this provider-based recommendation. The active decision is [ADR-008](../../../docs/adr/ADR-008-authentication-architecture.md) and work item `2026-09-11-credentials-profile-access`.

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-09-authentication-architecture-spike` |
| State | `awaiting_final_acceptance` |
| Author | Spec Writer |
| Created | `2026-09-09` |
| Last updated | `2026-09-09` |
| Senior Developer approval | Approved in conversation, 2026-09-09 |

## Problem and outcome

TuCarton requires an authenticated user before private account, Business, customer, or ledger data can be accessed. The product specification recommends phone-based verification for the Dominican Republic, but leaves the authentication/OTP provider, session model, account recovery, and device-provisioning design unresolved.

The Senior Developer direction is to support a multi-method account model: email, passkey, or phone may establish sign-up/sign-in, while phone OTP is a separate verification step rather than the sole registration mechanism. The outcome is an approved authentication architecture decision record and an implementation-ready follow-up specification. The decision must identify an approach that works with Expo mobile and the NestJS API, protects credentials, supports persistent sessions and online recovery, requires verified phone ownership before account activation or sensitive product access, and leaves a clean boundary for later trusted offline-device provisioning.

This is an explicitly authorized discovery spike. It produces documentation and a recommendation only; it does not add production authentication code, credentials, cloud resources, provider accounts, or user data.

## Scope

### In scope

- Evaluate at least three viable authentication approaches against the requirements below, including support for email, passkeys, phone sign-in, a separate phone-OTP verification step for Dominican Republic numbers, Expo/React Native mobile, and NestJS server-side token verification.
- Compare the approaches for implementation complexity, vendor lock-in, cost model, user experience, privacy/data residency considerations, abuse/rate-limit controls, test/development support, and account-recovery behavior.
- Define the target authentication/session boundary:
  - email, passkey, and phone sign-up/sign-in entry points;
  - account linking and collision handling when the same email, passkey, or phone number is presented to more than one account;
  - a separate phone-OTP enrollment and verification state;
  - API token issuance and refresh/expiration strategy;
  - secure mobile credential storage via `expo-secure-store`;
  - logout and credential removal/invalidation;
  - server-derived authenticated user identity;
  - online-only recovery;
  - future device-provisioning hook for trusted offline QR confirmation.
- Define a minimal API contract proposal for authentication endpoints, error-code categories, and client storage responsibilities. This is a proposal, not an implemented API.
- Create `docs/adr/ADR-008-authentication-architecture.md` documenting the selected approach, alternatives, consequences, and unresolved provider configuration.
- Create or update a focused follow-up authentication implementation specification that can be approved without re-deciding the provider architecture.

### Out of scope

- Adding a production auth provider SDK, account, API key, OTP sending capability, user table, migrations, endpoint, UI screen, session token, or credentials.
- Creating test users, sending SMS/email, provisioning a phone number, or making any other external provider change.
- Implementing offline device credentials, signing keys, QR confirmation, or recovery flows beyond their required architecture boundary.
- Implementing Business, customer, ledger, notification, sharing, or synchronization behavior.
- Choosing an ORM/database toolkit, hosting provider, push provider, or account deletion/retention policy.

## Requirements

- `R-01`: The selected approach MUST satisfy `FR-AUTH-001` through `FR-AUTH-006`, `FR-ID-001` through `FR-ID-006`, and relevant API requirements without exposing a government identifier as the primary account key.
- `R-02`: The recommendation MUST support email, passkey, and phone as account sign-up/sign-in methods, with phone OTP as a distinct verification step rather than the only registration method.
- `R-03`: The recommendation MUST define when verified phone ownership becomes mandatory, including whether unverified accounts may sign in but are blocked from creating a Business, viewing private relationships, creating requests, or participating in trusted offline-device provisioning.
- `R-04`: The mobile design MUST store authentication secrets only through secure credential storage and define logout removal/invalidation behavior.
- `R-05`: API authorization MUST derive the authenticated user identity server-side; client-supplied user IDs MUST NOT be trusted as authorization evidence.
- `R-06`: The recommendation MUST include exact TuCarton Code lookup, enumeration protection, rate-limit/abuse controls, and minimal public-profile privacy requirements as downstream design constraints.
- `R-07`: The design MUST reserve an online device-provisioning boundary before a new device can participate in trusted fully-offline confirmation, without claiming that offline cryptographic signatures are solved.
- `R-08`: The spike MUST record a clear implementation recommendation, rejected alternatives, risks, costs/operational implications, and a next implementation work-item boundary.

## Acceptance criteria

- `AC-01`: Given the product authentication and identity requirements, when the spike is complete, then `docs/adr/ADR-008-authentication-architecture.md` maps the selected approach to `FR-AUTH-001` through `FR-AUTH-006` and `FR-ID-001` through `FR-ID-006`.
- `AC-02`: Given an MVP user in the Dominican Republic, when the recommendation is reviewed, then it documents evidence of email, passkey, phone sign-in, and separate phone-OTP verification support; Expo mobile compatibility; NestJS server-side verification; development/test support; and account-recovery constraints for each considered approach.
- `AC-03`: Given the selected authentication approach, when a later Coder reads the follow-up spec, then the sign-in methods, phone-verification gate, account-linking/collision rules, session/token lifecycle, secure-storage responsibilities, logout semantics, authenticated-identity boundary, error categories, and device-provisioning hook are explicit.
- `AC-04`: Given the public TuCarton Code lookup requirement, when the architecture is reviewed, then it limits lookup to exact-code behavior and specifies rate-limit/abuse-monitoring responsibilities without exposing phone numbers, government IDs, debt, or unrelated Business relationships.
- `AC-05`: Given the offline QR security constraint, when the architecture is reviewed, then it states that an online-authenticated/provisioned device is necessary before trusted offline confirmation and explicitly defers signature/key-management design to its dedicated security work item.
- `AC-06`: Given the work-item output, when the Senior Developer reviews it, then a single, bounded implementation follow-up can be approved without selecting a different authentication architecture.

## Constraints and compatibility

- The product source of truth is `TuCarton — Product & Technical Requirements Specification v1.0.md`, especially `FR-ID-001`–`FR-ID-006`, `FR-AUTH-001`–`FR-AUTH-006`, `API-001`–`API-004`, and `TBD-001`.
- Initial platforms are Expo/React Native on Android and iOS; the backend is a NestJS modular monolith with a REST/OpenAPI boundary and PostgreSQL target.
- The primary market is the Dominican Republic. Phone/OTP feasibility for Dominican numbers is a mandatory evaluation criterion, not an assumption. Phone verification is a distinct account-verification step, not the sole sign-up method.
- No real secrets may be committed. This spike must not mutate external accounts, provision services, or send OTPs.
- Credential material must never be stored in plain-text mobile storage; `expo-secure-store` is the approved mobile secret-storage boundary.
- A provider choice is an architecture decision, but user authorization is required before creating an account, entering billing details, configuring production credentials, or sending traffic through it.
- The discovery must distinguish documented provider capability from an actual integration test; an integration test requires separately authorized provider credentials.

## Test strategy

| Criterion | Verification method | Expected evidence |
| --- | --- | --- |
| AC-01 | ADR and product-requirement traceability review | Requirement mapping table in ADR. |
| AC-02 | Primary-source documentation review | Direct official documentation links and comparison table with evidence date. |
| AC-03 | Follow-up specification review | Session, token, logout, error, and device-provisioning contract diagrams/table. |
| AC-04 | Privacy/security review | Exact-lookup and no-sensitive-data disclosure constraints documented. |
| AC-05 | Security-boundary review | Explicit deferral of signing/key management plus device-provisioning requirement. |
| AC-06 | Senior Developer review | A bounded next work-item spec with acceptance criteria and no material unresolved architecture choice. |

## Risks and assumptions

| Type | Detail | Owner / decision needed |
| --- | --- | --- |
| Risk | SMS delivery, cost, and fraud controls may differ materially for Dominican numbers. | Spec Writer investigates; Senior Developer chooses the provider. |
| Risk | A provider SDK can couple mobile and API implementations to a vendor. | ADR must document portability and exit implications. |
| Risk | Multi-method sign-in can cause account-takeover or duplicate-account risk if email, passkey, and phone credential linking is not explicit. | ADR must define verified-credential linking, collision handling, and recovery policy. |
| Risk | Trusting client-provided identity or storing tokens outside secure storage would compromise privacy and authorization. | Architecture must enforce server-derived identity and secure-storage boundaries. |
| Assumption | Users may establish an account using email, passkey, or phone; a verified phone is still required before the product enables its defined private/financial capabilities. | Senior Developer confirms the activation gate through ADR approval. |
| Assumption | Offline signatures/device credentials remain a separate security work item after authentication architecture is selected. | Senior Developer scheduling decision. |

## Open questions

- At which point is verified phone ownership mandatory: account activation, Business creation, viewing private relationships, first financial request, or all of the above?
- Should email sign-in be passwordless magic link, email/password, or both?
- Should passkeys be available at initial launch, or introduced after email/phone authentication is established?
- Is there a monthly SMS/OTP budget or preferred commercial relationship that should constrain provider selection?
- Does the Senior Developer prefer a managed authentication platform, or a provider-agnostic NestJS-owned OTP service backed by an SMS vendor?
- What privacy/data-residency or legal requirements, if any, must a provider satisfy beyond the current product specification?

## Approval record

| Decision | By | Date | Notes |
| --- | --- | --- | --- |
| Approved | Senior Developer | 2026-09-09 | Approved in conversation: “go ahead.” |

## Handoff

Work item: `2026-09-09-authentication-architecture-spike`  
State: `awaiting_final_acceptance`  
From → To: Verifier → Senior Developer  
Artifact: `.agents/work-items/2026-09-09-authentication-architecture-spike/spec.md`  
Ready: Independent verification passed all discovery-spike acceptance criteria. ADR-008 recommends Auth0 for multi-method identity and Twilio Verify for the separate phone-verification gate; a bounded follow-up authentication specification is drafted without selecting an ORM or performing external provider actions.  
Evidence: See `.agents/work-items/2026-09-09-authentication-architecture-spike/verification-report.md`. The Verifier independently reviewed primary provider documentation, requirement traceability, scope boundaries, and documentation formatting.  
Risks / blockers: Senior Developer must approve ADR-008, authorize any future Auth0/Twilio account/billing/custom-domain work, and approve a persistence approach before implementation. Native passkeys require a development build and custom-domain setup.  
Requested action: Senior Developer accepts/rejects ADR-008 and directs the persistence decision and external-provider authorization approach.
