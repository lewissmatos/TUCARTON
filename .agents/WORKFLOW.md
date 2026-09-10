# Supervised Spec-Driven Development Workflow

## Work item lifecycle

```text
intake → draft_spec → awaiting_spec_approval
                         │
                         └─ Senior Developer approves → approved_for_implementation
                                                            ↓
                                                       implementing
                                                            ↓
                                                  awaiting_verification
                                                   ↙                    ↘
                                  remediation_required              awaiting_final_acceptance
                                          ↓                                  ↓
                                     implementing                  Senior Developer accepts
                                                                          ↓
                                                                       accepted
```

The Senior Developer may reject an item at any point. Material requirement changes return the item to `draft_spec`.

## Required artifacts

Each `.agents/work-items/<id>/` directory contains:

- `spec.md` — requirement, constraints, acceptance criteria, and approval record.
- `implementation-plan.md` — small, ordered plan tied to the approved spec.
- `verification-report.md` — independent evidence against each criterion.
- `decisions.md` — optional chronological record of ambiguity, exceptions, and scope decisions.

## Gates

### Spec approval

The Spec Writer sets the item to `awaiting_spec_approval` only after all template sections are complete. The Senior Developer either records approval (name/date/commit or revision) or sends it back with required changes. Coder work may begin only after approval.

### Verification

The Verifier works from the approved spec and current diff, not from the Coder's conclusion. Every acceptance criterion is marked `pass`, `fail`, `blocked`, or `not-applicable` with evidence. A `fail` returns the item to `remediation_required`; `blocked` is escalated to the Senior Developer.

### Final acceptance

The Senior Developer reviews the verification report, residual risks, and scope. Only the Senior Developer may mark `accepted`.

## Handoff format

Use this compact block in the artifact or work-item discussion:

```text
Work item: <id>
State: <workflow state>
From → To: <role> → <role>
Artifact: <path>
Ready: <what is complete>
Evidence: <commands/results or links>
Risks / blockers: <none or list>
Requested action: <specific next decision/action>
```

## Remediation loop

The Verifier records each finding with a stable ID (`V-01`, `V-02`, …), severity, reproduction steps, affected acceptance criteria, and expected remediation. The Coder responds to each ID in the implementation plan or verification report appendix. The Verifier then re-runs only the necessary checks plus any relevant regression checks.
