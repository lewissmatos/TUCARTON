# Specification: Remove external identity-provider configuration

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-11-provider-cleanup` |
| State | `approved_for_implementation` |
| Author | Spec Writer |
| Created | `2026-09-11` |
| Last updated | `2026-09-11` |
| Senior Developer approval | Approved in conversation, 2026-09-11 |

## Problem and outcome

TuCartón now uses its own local phone-and-passcode account flow. Stale Auth0, Twilio, and OTP documentation could cause unnecessary setup work and make the product appear more complex than it is.

The repository will document and configure one local account model only: name, phone, passcode, signed local sessions, and private authenticated business lookup by code or phone.

## Scope

### In scope

- Remove tracked Auth0, Twilio, and OTP configuration references, provider dependencies, and setup instructions.
- Remove the retired phone-verification persistence field with a forward-only migration.
- Replace ADR-008 with the active local passcode decision.
- Update active product/work-item specifications to describe registration/login rather than phone verification.
- Mark prior provider/OTP work items as superseded historical records.
- Confirm package manifests and mobile configuration do not require an external identity-provider SDK or plugin.

### Out of scope

- Editing ignored local secret values in `.env`; they have no runtime effect and must be removed by the developer locally.
- Changing the local session JWT dependency (`jose`), which signs and verifies TuCartón-owned sessions.
- Adding password recovery, phone verification, or an external identity provider.

## Requirements

- `R-01`: Tracked environment examples, mobile configuration, and dependency inventory must not instruct developers to configure Auth0, Twilio, SMS, OTP, or a provider SDK.
- `R-02`: Active architecture documentation must define name, Dominican phone, numeric passcode, scrypt hashing, and TuCartón-owned sessions as the MVP identity model.
- `R-03`: Current navigation and delivery specifications must refer to successful account creation/login, not phone verification.
- `R-04`: Prior provider-based work items must be explicitly marked superseded and must not be treated as implementation instructions.
- `R-05`: The active user schema must not include phone-verification state.

## Acceptance criteria

- `AC-01`: Given the tracked package manifests and Expo configuration, then no Auth0/Twilio package or plugin is required.
- `AC-02`: Given a developer reading the dependency inventory and ADR-008, then they see only the active local passcode approach and no provider account/billing/setup steps.
- `AC-03`: Given a developer reading an active work-item spec, then it describes account creation/login and contains no phone-verification gate.
- `AC-04`: Given prior provider/OTP specs, then their metadata or prominent note identifies them as superseded historical records.
- `AC-05`: Given the migrated `users` table, then it has no `phone_verified_at` column.

## Constraints and compatibility

- Do not expose or rewrite values in ignored `.env` files; tracked examples remain the safe configuration source.
- Preserve `jose` because local session issuance and validation use it without contacting a third party.
- This cleanup changes documentation/configuration only; it must not change the existing account or business API behavior.

## Test strategy

| Criterion | Verification method | Expected evidence |
| --- | --- | --- |
| AC-01–AC-04 | Repository search and manifest/config inspection | No active provider references; supersession notes present. |
| All | `npm run lint`, `npm run typecheck`, `git diff --check` | Successful static checks. |

## Risks and assumptions

| Type | Detail | Owner / decision needed |
| --- | --- | --- |
| Assumption | Existing ignored provider variables are unused after the earlier local-passcode implementation. | Confirmed by source search. |
| Risk | Historical research mentions remain in archived work-item evidence. | Mark clearly superseded instead of erasing audit history. |

## Open questions

- None.

## Approval record

| Decision | By | Date | Notes |
| --- | --- | --- | --- |
| Approved | Senior Developer | 2026-09-11 | Remove external identity-provider setup and keep the MVP account flow simple. |

## Handoff

Work item: `2026-09-11-provider-cleanup`
State: `approved_for_implementation`
From → To: Senior Developer → Coder
Artifact: `spec.md`
Ready: Approved provider/configuration cleanup.
Evidence: Direct Senior Developer request in this conversation.
Risks / blockers: Ignored local `.env` values require local developer cleanup.
Requested action: Implement documentation/configuration cleanup and prepare verification evidence.
