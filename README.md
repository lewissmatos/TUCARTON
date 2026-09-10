# TUCARTON — Spec-Driven Multi-Agent Harness

This repository is a lightweight, provider-neutral harness for supervised multi-agent development. It follows the OpenAI/Codex convention of using `AGENTS.md` as repository-local instructions, with role prompts and workflow state stored as versioned project files.

The default delivery loop is:

1. **Spec Writer** turns a request into an implementable, testable specification.
2. **Senior Developer** (you) approves or returns the specification.
3. **Coder** implements only the approved specification.
4. **Verifier** independently validates the implementation and records evidence.
5. **Senior Developer** accepts, requests remediation, or closes the work item.

Start with [`.agents/work-items/README.md`](.agents/work-items/README.md), then create one directory per work item from the templates in [`.agents/templates`](.agents/templates).

## Repository map

| Path                  | Purpose                                                                   |
| --------------------- | ------------------------------------------------------------------------- |
| `AGENTS.md`           | Binding instructions for every coding agent working here.                 |
| `harness.toml`        | Machine-readable harness policy, workflow, gates, and artifact locations. |
| `agents.toml`         | Role registry and capability boundaries.                                  |
| `.agents/roles/`      | Role instructions for the spec writer, coder, and verifier.               |
| `.agents/templates/`  | Canonical work-item artifact templates.                                   |
| `.agents/work-items/` | Per-work-item specifications, plans, and verification evidence.           |
| `.agents/WORKFLOW.md` | Full state machine and handoff protocol.                                  |

## Operating principles

- Specifications are the source of truth; chat requests are captured into a spec before implementation.
- Each role produces an artifact, not merely a conversational update.
- The verifier does not validate its own implementation.
- A failed gate returns work to its owning role with a written remediation request.
- No role may merge, deploy, or broaden scope without your explicit authorization.

## Minimal first run

1. Create `.agents/work-items/<work-item-id>/`.
2. Copy `spec.md`, `implementation-plan.md`, and `verification-report.md` from `.agents/templates/`.
3. Ask the Spec Writer to complete `spec.md` and set its state to `awaiting_spec_approval`.
4. Review and approve it as the Senior Developer.
5. Ask the Coder to work from the approved spec and plan.
6. Ask the Verifier for independent evidence and make the final decision.

## Foundation application structure

The approved Phase 0 foundation lives alongside this Harness:

```text
apps/mobile       Expo / React Native mobile shell
apps/api          NestJS REST and OpenAPI shell
packages/domain   Framework-independent vocabulary
packages/validation  Shared structural validation
packages/api-client  Typed REST client boundary
packages/config   Shared tooling configuration
docs/              Architecture and dependency notes
tests/             Unit, API, mobile, and offline test boundaries
```

Install dependencies with `npm install`, start PostgreSQL with `npm run db:up`, then use `npm run api:dev` or `npm run mobile:start`. Run `npm run format`, `npm run lint`, `npm run typecheck`, and `npm test` before requesting verification. See [the dependency inventory](docs/stack-and-dependencies.md) for the selected baseline and deliberately deferred decisions.
