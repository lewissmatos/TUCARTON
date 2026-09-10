# Implementation Plan: TuCarton Authentication and Verified Phone Foundation

## Metadata

| Field | Value |
| --- | --- |
| Work item | `2026-09-09-authentication-foundation` |
| State | `implementing` |
| Coder | Codex |
| Approved spec revision | Conversation approval, 2026-09-09; runtime amendment, 2026-09-10 |

## Plan

1. Add Drizzle PostgreSQL configuration, user/audit schema, migrations, and test-safe database lifecycle — satisfies `AC-01`, `AC-04`, `AC-05`.
2. Add Auth0-compatible JWT verification, authenticated-user bootstrap, local user mapping, and phone-verification gate — satisfies `AC-01`, `AC-02`, `AC-03`.
3. Add a deterministic fake phone-verification adapter with start/verify operations, idempotency, and machine-readable errors — satisfies `AC-04`, `AC-05`.
4. Add Expo Auth0 Universal Login with the approved Custom API audience, native secure credential manager, onboarding, and blocked screens — satisfies `AC-03`, `AC-06`.
5. Add focused unit, API, and mobile tests; run static, test, and local PostgreSQL checks — satisfies `AC-07`.

## Files and interfaces affected

| Path / interface | Intended change | Criteria |
| --- | --- | --- |
| `apps/api/src/auth/` | Auth guard, bootstrap, verification service, fake provider, API controllers | AC-01 to AC-05 |
| `apps/api/src/db/` | Drizzle configuration, user/audit schema, migrations | AC-01, AC-04, AC-05 |
| `apps/mobile/` | Secure session adapter and onboarding/verification states | AC-03, AC-06 |
| `apps/**/test` | Local JWT/fake OTP tests and API/mobile scenarios | AC-01 to AC-07 |

## Test and evidence log

| Check | Command / method | Result | Criteria |
| --- | --- | --- | --- |
| API/unit tests | `npm run test -- --run` | Passed: 3 files / 3 tests, including deterministic fake OTP behavior | Partial AC-04, AC-05, AC-07 |
| Mobile tests | `npm run test -- --run` | Passed: secure-session adapter saves, reads, and clears credentials through its supplied secure-store interface | Partial AC-06, AC-07 |
| Static checks | `npm run typecheck` | Passed for API, mobile, and shared workspaces | Partial AC-07 |
| PostgreSQL | Applied `apps/api/drizzle/0000_auth_foundation.sql` with `docker compose exec`; invoked local bootstrap, fake OTP start, and fake OTP verify | Passed: one UUID/subject mapping was returned; verification timestamp was persisted while the E.164 number remained private | Partial AC-01, AC-04 |
| iOS bundle | Requested the iOS Expo Router bundle from the local Metro server | Passed: Metro produced a 5,616,935-byte iOS bundle | Manual mobile smoke test readiness |
| Mobile visual implementation | `npm run lint && npm run typecheck && npm run test -- --run` after adding Expo BlurView and the sign-up/log-in screen | Passed: lint/type checks passed; 3 test files / 3 tests passed | Partial AC-03, AC-06, AC-07 |
| Auth0 native integration | `npm run format:write && npm run lint && npm run typecheck && npm run test`; `npx expo config --type public --json` | Passed: formatting, lint, all workspace type checks, and 3 tests passed; Expo confirms the `tucarton` scheme, `com.tucarton.app` iOS identifier, and Auth0 config plugin | AC-01, partial AC-06, AC-07 |
| Auth0 tenant discovery | Public `/.well-known/openid-configuration` check | Passed: issuer, authorization endpoint, and JWKS URI resolve for `dev-cwpsbs7tbid3scpa.us.auth0.com` | Partial AC-02 |
| Native iOS dependency build | `npx expo prebuild --clean --platform ios`; `pod install` | Passed after installing and selecting full Xcode: CocoaPods resolved 107 pods, including `A0Auth0 (5.11.1)` and `Auth0 (2.25.0)` | Partial AC-06, AC-07 |
| Simulator native build | Disabled Xcode user-script sandboxing for the generated Debug and Release project configurations; rebuilt the `TuCartn` scheme for iOS Simulator | Passed: `BUILD SUCCEEDED`; the app bundle now contains `ExpoModulesJSI`, React, React Native dependencies, and Hermes frameworks | Partial AC-06, AC-07 |
| Simulator launch | Installed and launched `com.tucarton.app` on iPhone 17 Pro Max; started Metro at `http://localhost:8081` and opened the development-client URL | Passed through native launch and Metro handoff prompt. The iOS confirmation dialog remains visible and must be accepted before visual JS-screen verification. | Partial AC-06 |
| Auth0 return diagnosis | Added development-only Auth0 failure detail to the Spanish access notice; ran `npm run typecheck --workspace=@tucarton/mobile` | Passed: mobile TypeScript compilation succeeds. The exact runtime Auth0 error can now be captured without exposing it in production. | Partial AC-06, AC-07 |
| Physical iPhone development build | Installed `expo-dev-client@57.0.18`; ran `pod install`; built `TuCartn` for the connected iPhone 16 Pro; installed the signed app with `devicectl`; started Metro reachable at `http://10.0.0.250:8081` | Passed: app identifier `com.tucarton.app` is signed by the Personal Team and contains `EXDevLauncher.bundle`. Automatic launch was denied only because the physical phone was locked. | Partial AC-06, AC-07 |

## Deviations and decisions

- Drizzle is the approved PostgreSQL persistence toolkit (ADR-009).
- The deterministic local fake provider is used until Twilio Verify activation is separately authorized and configured.
- Auth0 runtime validation is configuration-driven; local signed JWTs verify the guard without reading secrets or contacting Auth0.
- Local `npm run api:dev` now clears stale API build output through `apps/api/nest-cli.json`; this prevented an outdated server from hiding newly added routes.
- Auth0 Custom API is configured with audience `https://api.tucarton.local`. The API validates tokens from the approved native client (`wA3kOsMS3icJaCxn1ajjWXVjKzAIuIUM`) through `azp`; the environment override remains available for deployed environments. Real Twilio Verify delivery remains deferred.
- The Expo onboarding screen uses `expo-blur` with a restrained, iOS Liquid Glass-inspired interaction card and `#D6E29E` primary accent. It displays the TuCartón name and a notebook/pen-accent `Ó` mark. Sign-up and log-in now invoke Auth0 Universal Login rather than displaying a placeholder notice.
- The Auth0 React Native SDK uses the platform credential manager (iOS Keychain / Android Keystore), not the prior Expo SecureStore prototype. It requires an Expo development build and cannot run in Expo Go.
- Xcode 26's user-script sandbox blocked CocoaPods from copying Expo resources and frameworks. The generated iOS project's Debug and Release configurations now set `ENABLE_USER_SCRIPT_SANDBOXING = NO`, which allows the CocoaPods scripts expected by Expo to run. This generated native configuration must be retained or reproduced if iOS is regenerated with `expo prebuild --clean`.
- The first physical-device build is awaiting a USB-connected, unlocked, trusted iPhone; Expo currently detects only installed simulators.

## Handoff to Verifier

Implementation remains in progress. Before independent verification, add API-level JWT/gate coverage and connect the Expo state preview to a real Auth0 handoff once the Auth0 API audience is available.
