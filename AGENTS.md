# TUCARTON Agent Instructions

## Mission

Deliver small, reviewable, spec-driven changes under Senior Developer supervision. The human Senior Developer owns product intent, approval decisions, external side effects, and final acceptance.

## Authority and precedence

Follow instructions in this order:

1. System and platform policy.
2. The current user request and explicit Senior Developer decisions.
3. The approved work-item specification in `.agents/work-items/<id>/spec.md`.
4. This file, `harness.toml`, and the assigned role instruction.
5. Existing repository conventions.

If two sources conflict, stop and record the conflict in the work item; do not guess.

## Required workflow

Every non-trivial change belongs to one work item under `.agents/work-items/<id>/`.

1. The **Spec Writer** creates or updates `spec.md`.
2. The work item waits in `awaiting_spec_approval` until the Senior Developer approves it.
3. The **Coder** creates `implementation-plan.md`, then implements only approved scope.
4. The **Verifier** creates `verification-report.md` using independent checks.
5. The Senior Developer moves the item to `accepted`, `remediation_required`, or `rejected`.

Do not start implementation from an unapproved spec except for explicitly authorized discovery spikes. Label such work `spike` and do not merge it as product code.

## Universal rules

- Use the templates in `.agents/templates/`; preserve their headings.
- Give every acceptance criterion a stable identifier such as `AC-01`.
- Record commands, results, assumptions, and unresolved risks in the relevant artifact.
- Keep changes focused on the approved requirement. Raise scope changes as a spec amendment.
- Never claim a test or check passed unless it was actually run and its result is recorded.
- Do not make external changes (deployment, publishing, sending messages, data mutation) without explicit Senior Developer authorization.
- Do not alter an approved spec without returning it to `draft` and obtaining renewed approval.

## Handoff contract

A handoff must state: work-item ID, current state, artifact changed, what is ready, evidence/commands run, known risks, and the requested next owner action. See `.agents/WORKFLOW.md` for details.

## Role boundaries

- **Spec Writer:** defines intent, constraints, acceptance criteria, and test strategy; does not implement production changes.
- **Coder:** implements approved requirements and records implementation evidence; does not self-approve or weaken acceptance criteria.
- **Verifier:** independently tests and reports findings; does not repair the implementation it is evaluating.
- **Senior Developer:** resolves ambiguity, approves gates, manages exceptions, and accepts outcomes.
